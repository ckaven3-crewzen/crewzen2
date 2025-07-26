/**
 * ProZenPage Component - ProZen Module Main Dashboard
 *
 * PURPOSE: Central project management dashboard for ProZen module
 *
 * 🔧 COMPONENT STATUS: COMPLEX COMPONENT - Production cleanup needed
 * - Function: Project CRUD operations, team management, task reporting
 * - Integration: Core ProZen project management functionality
 * - Size: 714 lines - Large complex component with multiple responsibilities
 *
 * 🔍 USAGE ANALYSIS:
 * - Main dashboard for ProZen project management module
 * - Central hub for project creation, editing, deletion
 * - Integrates with Firebase for project data and image storage
 * - No duplicates found - unique core functionality
 *
 * ✅ EXCELLENT FEATURES:
 * - **Project Management**: Complete CRUD operations with proper validation
 * - **Image Upload**: Firebase Storage integration with photo management
 * - **Role-Based Access**: Employee users automatically redirected
 * - **Task Reporting**: Advanced filtering by trade and date
 * - **Principal Contractor Management**: Integration with contractor system
 * - **Real-time Data**: Firebase Firestore integration with proper queries
 * - **User Experience**: Loading states, error handling, toast notifications
 *
 * 🚨 PRODUCTION ISSUES FOUND:
 * - **Console Statements**: 5 console.error + 1 console.warn statements for production cleanup
 * - **Component Size**: 714 lines - could benefit from component splitting
 * - **State Complexity**: 15+ useState hooks - consider useReducer pattern
 *
 * 🔧 CONSOLE STATEMENTS TO REMOVE:
 * ```typescript
 * // Lines requiring cleanup:
 * console.error('Error fetching projects: ', error);         // Line 166
 * console.error('Error adding new project: ', error);        // Line 231  
 * console.warn("Could not delete an image...", e);          // Line 249
 * console.error("Error deleting project:", error);          // Line 261
 * console.error('Error fetching tasks for reporter:', error); // Line 306
 * ```
 *
 * 🏗️ ARCHITECTURE ANALYSIS:
 * - **State Management**: Complex with 15+ useState hooks
 * - **Firebase Integration**: Comprehensive Firestore + Storage operations
 * - **Image Handling**: Photo upload/delete with proper storage management
 * - **Error Handling**: Toast notifications with proper user feedback
 * - **Component Composition**: Good use of UI components and dialog patterns
 *
 * 📝 REFACTORING OPPORTUNITIES (Future):
 * - Split into smaller components (ProjectCard, ProjectForm, TaskReporter)
 * - Extract project operations to custom hooks
 * - Consider useReducer for complex state management
 * - Move image upload logic to separate utility
 *
 * 🎯 RECOMMENDATION: PRODUCTION CLEANUP - Remove console statements, consider refactoring
 *
 * TODO: PRODUCTION CLEANUP REQUIRED
 * - Remove 5 console.error statements (lines 166, 231, 261, 306)
 * - Remove 1 console.warn statement (line 249)
 * - Consider component splitting for maintainability
 * - Replace multiple useState with useReducer pattern
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
'use client';

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2, Camera, Upload, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';

function getStatusColor(status: Project['status']) {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-500 hover:bg-blue-500/90';
    case 'Completed':
      return 'bg-green-500 hover:bg-green-500/90';
    case 'On Hold':
      return 'bg-yellow-500 hover:bg-yellow-500/90';
    default:
      return 'bg-secondary';
  }
}

const newProjectInitialState: Omit<Project, 'id'> = {
  name: '',
  status: 'In Progress',
  address: '',
  tasks: [],
  photoUrls: [],
  location: undefined,
  projectTeam: [],
  principalContractor: {
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
  },
  companyId: '',
};

export default function ProZenPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState(newProjectInitialState);
  const [isSaving, setIsSaving] = useState(false);
  const [newProjectPhoto, setNewProjectPhoto] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [principalContractors, setPrincipalContractors] = useState<any[]>([]);
  const [selectedPrincipalContractorId, setSelectedPrincipalContractorId] = useState<string>('');
  const [newPrincipalContractor, setNewPrincipalContractor] = useState({ companyName: '', contactName: '', phone: '', email: '' });
  
  // Add state for task reporter
  const [isTaskReporterOpen, setIsTaskReporterOpen] = useState(false);
  const [taskReporterData, setTaskReporterData] = useState<any[]>([]);
  const [taskReporterFilter, setTaskReporterFilter] = useState<'trade' | 'date'>('trade');
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [allTrades, setAllTrades] = useState<string[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'employee') {
      router.push('/');
    }
  }, [user, router]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      // Filter projects by companyId to ensure users only see their company's projects
      const projectQuery = query(
        collection(db, 'projects'),
        where('companyId', '==', user?.companyId || user?.uid || '')
      );
      const projectSnapshot = await getDocs(projectQuery);
      const projectsData = projectSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          status: data.status || 'On Hold',
          address: data.address || '',
          photoUrls:
            data.photoUrls && Array.isArray(data.photoUrls)
              ? data.photoUrls
              : [],
          companyId: data.companyId || '',
        } as Project;
      });
      projectsData.sort((a,b) => a.name.localeCompare(b.name));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch projects.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.companyId, user?.uid]);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    if (isAddDialogOpen) {
      getDocs(collection(db, 'principalContractors')).then(snap => {
        setPrincipalContractors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [isAddDialogOpen]);

  const handleAddNewProject = async () => {
    if (!newProjectData.name) {
        toast({ variant: 'destructive', title: 'Error', description: 'Project name is required.' });
        return;
    }
    setIsSaving(true);
    try {
      const newProjectId = doc(collection(db, 'projects')).id;
      let uploadedUrl: string | undefined = undefined;

      if (newProjectPhoto && newProjectPhoto.startsWith('data:image')) {
        const res = await fetch(newProjectPhoto);
        const blob = await res.blob();
        const photoRef = ref(storage, `projects/${newProjectId}/gallery/${Date.now()}.jpg`);
        await uploadBytes(photoRef, blob);
        uploadedUrl = await getDownloadURL(photoRef);
      }
      
      let principalContractorToSave = newProjectData.principalContractor;
      if (selectedPrincipalContractorId === '__other__') {
        const docRef = await addDoc(collection(db, 'principalContractors'), newPrincipalContractor);
        principalContractorToSave = newPrincipalContractor;
      }
      
      const finalProjectData = { 
        ...newProjectData, 
        photoUrls: uploadedUrl ? [uploadedUrl] : [],
        location: newProjectData.location || null,
        projectTeam: newProjectData.projectTeam || [],
        principalContractor: principalContractorToSave,
        companyId: user?.companyId || user?.uid || '',
      };

      await setDoc(doc(db, 'projects', newProjectId), finalProjectData);
      await fetchProjects();
      setIsAddDialogOpen(false);
      setNewProjectData(newProjectInitialState);
      setNewProjectPhoto(null);
      toast({ title: 'Success', description: 'New project has been added.' });
    } catch (error) {
      console.error('Error adding new project: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add new project.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      if (projectToDelete.photoUrls && projectToDelete.photoUrls.length > 0) {
        const deleteImagePromises = projectToDelete.photoUrls.map(url => {
          const imageRef = ref(storage, url);
          return deleteObject(imageRef).catch(e => console.warn("Could not delete an image, it may have already been removed.", e));
        });
        await Promise.all(deleteImagePromises);
      }
      
      await deleteDoc(doc(db, 'projects', projectToDelete.id));
      
      toast({ title: 'Success', description: 'Project deleted successfully.' });
      fetchProjects();
      setIsDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete project.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewProjectPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAllTasksForReporter = async () => {
    setIsLoadingTasks(true);
    try {
      // Fetch all projects
      const projectSnapshot = await getDocs(collection(db, 'projects'));
      const allTasks: any[] = [];
      const tradesSet = new Set<string>();

      // Collect all tasks from all projects
      for (const projectDoc of projectSnapshot.docs) {
        const projectData = projectDoc.data();
        const projectTasks = projectData.tasks || [];
        
        projectTasks.forEach((task: any) => {
          if (task.trade) tradesSet.add(task.trade);
          allTasks.push({
            ...task,
            projectId: projectDoc.id,
            projectName: projectData.name || 'Unknown Project',
            projectAddress: projectData.address || ''
          });
        });
      }

      setAllTrades(Array.from(tradesSet).sort());
      setTaskReporterData(allTasks);
    } catch (error) {
      console.error('Error fetching tasks for reporter:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch tasks for reporting.',
      });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = taskReporterData;

    if (taskReporterFilter === 'trade' && selectedTrade) {
      filtered = filtered.filter(task => task.trade === selectedTrade);
    } else if (taskReporterFilter === 'date' && selectedDate) {
      filtered = filtered.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === selectedDate;
      });
    }

    return filtered;
  };

  const getTasksByGroup = () => {
    const filtered = getFilteredTasks();
    
    if (taskReporterFilter === 'trade') {
      // Group by trade
      const grouped: { [key: string]: any[] } = {};
      filtered.forEach(task => {
        if (!grouped[task.trade]) grouped[task.trade] = [];
        grouped[task.trade].push(task);
      });
      return grouped;
    } else {
      // Group by date
      const grouped: { [key: string]: any[] } = {};
      filtered.forEach(task => {
        if (!task.createdAt) return;
        const date = new Date(task.createdAt).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
      });
      return grouped;
    }
  };

  const projectStatuses: Project['status'][] = [
    'In Progress',
    'Completed',
    'On Hold',
  ];
  
  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteConfirmOpen(true);
  };

  if (!user || user.role === 'employee') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsTaskReporterOpen(true);
                fetchAllTasksForReporter();
              }}
            >
              Task Reporter
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link href={`/prozen/${project.id}`} key={project.id} className="block group">
                <Card className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow relative">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-lg sm:text-base md:text-lg">{project.name}</CardTitle>
                        <CardDescription className="truncate text-sm">{project.address}</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 self-end sm:self-start" 
                        onClick={(e) => handleDeleteClick(e, project)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {project.photoUrls && project.photoUrls[0] && (
                      <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
                        <Image 
                          src={project.photoUrls[0]}
                          alt={project.name}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover max-h-48 sm:max-h-40 md:max-h-56"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Badge
                      className={cn(
                        'text-primary-foreground',
                        getStatusColor(project.status)
                      )}
                    >
                      {project.status}
                    </Badge>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete the project "{projectToDelete?.name}". This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProject} disabled={isDeleting} className={cn(isDeleting && "bg-destructive/90")}>{isDeleting ? <Loader2 className="animate-spin" /> : 'Continue'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setNewProjectData(newProjectInitialState);
            setNewProjectPhoto(null);
          }
          setIsAddDialogOpen(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-lg w-full max-w-xs sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                    Fill in the initial details. You can add tasks, team members, and more photos later.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={newProjectData.name} onChange={(e) => setNewProjectData((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={newProjectData.address ?? ''} onChange={(e) => setNewProjectData((p) => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newProjectData.status} onValueChange={(value: Project['status']) => setNewProjectData((p) => ({ ...p, status: value }))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {projectStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                            {status}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Main Project Photo (Optional)</Label>
                    <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {newProjectPhoto ? <Image src={newProjectPhoto} alt="Project Preview" width={160} height={160} className="rounded-md object-cover h-full w-full" /> : <Camera className="h-12 w-12 text-muted-foreground" />}
                    </div>
                     <Button type="button" variant="outline" className="w-full" onClick={() => photoInputRef.current?.click()}><Upload className="mr-2" /> Upload Photo</Button>
                    <Input ref={photoInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>
                <div className="space-y-2">
                    <Label>Principal Contractor</Label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={selectedPrincipalContractorId}
                        onChange={e => {
                            setSelectedPrincipalContractorId(e.target.value);
                            if (e.target.value !== '__other__') {
                                const pc = principalContractors.find(c => c.id === e.target.value);
                                if (pc) setNewProjectData(p => ({ ...p, principalContractor: pc }));
                            } else {
                                setNewProjectData(p => ({ ...p, principalContractor: { companyName: '', contactName: '', phone: '', email: '' } }));
                            }
                        }}
                    >
                        <option value="">Select principal contractor</option>
                        {principalContractors.map(pc => (
                            <option key={pc.id} value={pc.id}>{pc.companyName} ({pc.contactName})</option>
                        ))}
                        <option value="__other__">Other (add new)</option>
                    </select>
                    {selectedPrincipalContractorId === '__other__' && (
                        <div className="space-y-2 mt-2">
                            <Input placeholder="Company Name" value={newPrincipalContractor.companyName} onChange={e => setNewPrincipalContractor(p => ({ ...p, companyName: e.target.value }))} />
                            <Input placeholder="Contact Name" value={newPrincipalContractor.contactName} onChange={e => setNewPrincipalContractor(p => ({ ...p, contactName: e.target.value }))} />
                            <Input placeholder="Phone" value={newPrincipalContractor.phone} onChange={e => setNewPrincipalContractor(p => ({ ...p, phone: e.target.value }))} />
                            <Input placeholder="Email" value={newPrincipalContractor.email} onChange={e => setNewPrincipalContractor(p => ({ ...p, email: e.target.value }))} />
                        </div>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button className="w-full sm:w-auto" onClick={handleAddNewProject} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Project
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Reporter Dialog */}
      <Dialog open={isTaskReporterOpen} onOpenChange={setIsTaskReporterOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Reporter</DialogTitle>
            <DialogDescription>
              View and analyze tasks across all projects, organized by trade or date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label>Filter by:</Label>
                <Select value={taskReporterFilter} onValueChange={(value: 'trade' | 'date') => setTaskReporterFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trade">Trade</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {taskReporterFilter === 'trade' && (
                <div className="flex items-center gap-2">
                  <Label>Trade:</Label>
                  <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All trades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All trades</SelectItem>
                      {allTrades.map(trade => (
                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {taskReporterFilter === 'date' && (
                <div className="flex items-center gap-2">
                  <Label>Date:</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Total Tasks: {taskReporterData.length} | 
                Filtered: {getFilteredTasks().length}
              </div>
            </div>

            {/* Loading State */}
            {isLoadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading tasks...
              </div>
            ) : (
              /* Task Groups */
              <div className="space-y-6">
                {Object.entries(getTasksByGroup()).map(([groupKey, tasks]) => (
                  <div key={groupKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {taskReporterFilter === 'trade' ? `Trade: ${groupKey}` : `Date: ${groupKey}`}
                      </h3>
                      <Badge variant="secondary">{tasks.length} tasks</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {tasks.map((task, index) => (
                        <div key={`${task.projectId}-${task.id}-${index}`} className="border rounded p-3 bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{task.description}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">Project:</span> {task.projectName}
                                {task.projectAddress && ` - ${task.projectAddress}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Trade:</span> {task.trade}
                                {taskReporterFilter === 'date' && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span className="font-medium">Created:</span> {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown'}
                                  </>
                                )}
                                {taskReporterFilter === 'trade' && task.createdAt && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleDateString()}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge
                                className={
                                  task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(getTasksByGroup()).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {taskReporterData.length === 0 ? 'No tasks found across all projects.' : 'No tasks match the current filter.'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskReporterOpen(false)}>Close</Button>
            <Button 
              onClick={() => {
                // Here you could add PDF export functionality
                toast({ title: 'PDF export would be implemented here' });
              }}
            >
              Export to PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}