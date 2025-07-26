'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  Employee,
  EmployeeAttendance,
  Project,
  DailyAttendanceRecord,
} from '@/lib/types';
import {
  Users,
  Calendar as CalendarIcon,
  PlusCircle,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CrewZenDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [employees, setEmployees] = useState<EmployeeAttendance[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const saveAttendance = useCallback(
    (employeesToSave: EmployeeAttendance[]) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveTimeout.current = setTimeout(async () => {
        if (!date) return;
        const formattedDate = format(date, 'yyyy-MM-dd');
        const attendanceDocRef = doc(db, 'attendance', formattedDate);

        const recordsToSave = employeesToSave.map(
          (emp) => {
            const record: DailyAttendanceRecord = {
              employeeId: emp.id,
              isAbsent: emp.isAbsent,
              projectId: emp.projectId || null,
            };
            
            if (emp.hasHelper) {
              record.isHelperAbsent = emp.isHelperAbsent ?? true;
            }
            
            return record;
          }
        );

        try {
          await setDoc(attendanceDocRef, { records: recordsToSave });
          // Success toast removed for a quieter UX
        } catch (error) {
          console.error('Error saving attendance: ', error);
          toast({
            variant: 'destructive',
            title: 'Error Saving Attendance',
            description: 'There was a problem saving the attendance data.',
          });
        }
      }, 1500);
    },
    [date, toast]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const projectSnapshot = await getDocs(collection(db, 'projects'));
        
        let employeesData: Employee[];
        if (user.role === 'admin' || user.role === 'supervisor') {
            const employeeSnapshot = await getDocs(collection(db, 'employees'));
            employeesData = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            // Only include employees with companyNumber starting with 2, 3, or 4
            employeesData = employeesData.filter(emp => /^cz-[234]/.test(emp.companyNumber));
        } else if (user.role === 'company') {
            // For companies, fetch only their own employees
            const employeesQuery = query(
                collection(db, 'employees'),
                where('companyId', '==', user.uid)
            );
            const employeeSnapshot = await getDocs(employeesQuery);
            employeesData = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        } else { // 'employee' role
            const employeeDocSnap = await getDoc(doc(db, 'employees', user.employeeId));
            if (employeeDocSnap.exists()) {
                employeesData = [{ id: employeeDocSnap.id, ...employeeDocSnap.data() } as Employee];
            } else {
                employeesData = [];
                toast({ variant: 'destructive', title: 'Error', description: 'Could not find your employee profile.' });
            }
        }
        employeesData.sort((a, b) =>
          a.companyNumber.localeCompare(b.companyNumber)
        );

        const projectsData = projectSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Project)
        );
        setProjects(projectsData);

        if (date) {
          const formattedDate = format(date, 'yyyy-MM-dd');
          const attendanceDocRef = doc(db, 'attendance', formattedDate);
          const attendanceDocSnap = await getDoc(attendanceDocRef);

          let finalEmployees: EmployeeAttendance[];

          if (attendanceDocSnap.exists()) {
            const attendanceRecords =
              attendanceDocSnap.data().records as DailyAttendanceRecord[];
            finalEmployees = employeesData.map((emp) => {
              const record = attendanceRecords.find(
                (r) => r.employeeId === emp.id
              );
              return {
                ...emp,
                isAbsent: record ? record.isAbsent : true,
                isHelperAbsent: emp.hasHelper
                  ? record?.isHelperAbsent ?? true
                  : undefined,
                projectId: record?.projectId || undefined,
              };
            });
          } else {
            finalEmployees = employeesData.map((e) => ({
              ...e,
              isAbsent: true,
              isHelperAbsent: e.hasHelper ? true : undefined,
              projectId: undefined,
            }));
          }
          setEmployees(finalEmployees);
        }
      } catch (error) {
        console.error('Error fetching data for dashboard: ', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Data',
          description: 'Could not load required data. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [date, toast, user]);

  const handleAttendanceChange = (employeeId: string, isAbsent: boolean) => {
    setEmployees((prevEmployees) => {
      const updatedEmployees = prevEmployees.map((emp) => {
        if (emp.id === employeeId) {
          const shouldClearProject = isAbsent && (emp.isHelperAbsent ?? true);
          return {
            ...emp,
            isAbsent,
            projectId: shouldClearProject ? undefined : emp.projectId,
          };
        }
        return emp;
      });
      saveAttendance(updatedEmployees);
      return updatedEmployees;
    });
  };

  const handleHelperAttendanceChange = (
    employeeId: string,
    isHelperAbsent: boolean
  ) => {
    setEmployees((prevEmployees) => {
      const updatedEmployees = prevEmployees.map((emp) => {
        if (emp.id === employeeId) {
          const shouldClearProject = isHelperAbsent && emp.isAbsent;
          return {
            ...emp,
            isHelperAbsent,
            projectId: shouldClearProject ? undefined : emp.projectId,
          };
        }
        return emp;
      });
      saveAttendance(updatedEmployees);
      return updatedEmployees;
    });
  };

  const handleProjectChange = (employeeId: string, projectId: string) => {
    setEmployees((prevEmployees) => {
      const updatedEmployees = prevEmployees.map((emp) =>
        emp.id === employeeId ? { ...emp, projectId } : emp
      );
      saveAttendance(updatedEmployees);
      return updatedEmployees;
    });
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleSaveNewProject = async () => {
    if (!newProjectName.trim()) {
      return;
    }
    const newProjectData = {
      name: newProjectName.trim(),
      status: 'In Progress' as const,
      address: '',
      tasks: [],
      companyId: user?.companyId || user?.uid || '',
    };
    try {
      const docRef = await addDoc(collection(db, 'projects'), newProjectData);
      setProjects((prev) => [...prev, { id: docRef.id, ...newProjectData }]);
      setIsAddProjectDialogOpen(false);
      setNewProjectName('');
    } catch (error) {
      console.error('Error adding new project: ', error);
      toast({
        variant: 'destructive',
        title: 'Error Adding Project',
        description: 'Could not save the new project.',
      });
    }
  };

  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'company';

  // --- Simplified worker attendance UI ---
  if (!isAdminOrSupervisor && user?.role === 'employee') {
    const worker = employees[0]; // Workers only see themselves
    if (!worker) {
      return (
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
          </div>
        </div>
      );
    }

    const handleWorkerSave = async () => {
      if (!date) return;
      const formattedDate = format(date, 'yyyy-MM-dd');
      const attendanceDocRef = doc(db, 'attendance', formattedDate);

      const record: DailyAttendanceRecord = {
        employeeId: worker.id,
        isAbsent: worker.isAbsent,
        projectId: worker.projectId || null,
      };
      
      if (worker.hasHelper) {
        record.isHelperAbsent = worker.isHelperAbsent ?? true;
      }

      try {
        await setDoc(attendanceDocRef, { records: [record] }, { merge: true });
        toast({
          title: 'Attendance Saved',
          description: 'Your attendance has been recorded successfully.',
        });
        // After saving attendance, check WorkerProfile completeness
        const workerProfileRef = doc(db, 'workerProfiles', user.uid);
        const workerProfileSnap = await getDoc(workerProfileRef);
        let needsProfileCompletion = true;
        if (workerProfileSnap.exists()) {
          const profile = workerProfileSnap.data();
          const requiredFields = ['availability', 'tradeTags', 'skills', 'yearsExperience', 'preferredRate', 'bio', 'location'];
          needsProfileCompletion = requiredFields.some(field => !profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0));
        }
        if (needsProfileCompletion) {
          router.push('/complete-profile');
        } else {
          router.push('/connectzen/businessMarketplacePage');
        }
      } catch (error) {
        console.error('Error saving attendance: ', error);
        toast({
          variant: 'destructive',
          title: 'Error Saving Attendance',
          description: 'There was a problem saving your attendance.',
        });
      }
    };

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">My Attendance</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <User className="h-6 w-6" />
                {worker.firstName} {worker.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attendance Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Attendance Status</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className={worker.isAbsent ? 'text-destructive' : 'text-green-600 font-medium'}>
                    {worker.isAbsent ? 'Absent' : 'Present'}
                  </span>
                  <Switch
                    checked={!worker.isAbsent}
                    onCheckedChange={(checked) =>
                      setEmployees([{ ...worker, isAbsent: !checked }])
                    }
                  />
                </div>
              </div>

              {/* Project Selection - Only show if present */}
              {!worker.isAbsent && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Project</Label>
                  <Select
                    value={worker.projectId || ''}
                    onValueChange={(projectId) =>
                      setEmployees([{ ...worker, projectId }])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Save Button */}
              <Button 
                onClick={handleWorkerSave}
                className="w-full"
                disabled={!worker.isAbsent && !worker.projectId}
              >
                Save & Go to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="flex flex-col gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isAdminOrSupervisor ? <Users className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  {isAdminOrSupervisor ? 'Crew Attendance' : 'My Attendance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(isAdminOrSupervisor ? 3 : 1)].map((_, i) => (
                      <Card key={i} className="p-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-grow sm:justify-end">
                            <Skeleton className="h-9 w-full sm:w-40" />
                            <Skeleton className="h-9 w-full sm:w-48" />
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    employees.map((employee) => {
                      const anyonePresent =
                        !employee.isAbsent ||
                        (employee.hasHelper && !employee.isHelperAbsent);

                      return (
                        <Card key={employee.id} className="p-3">
                          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                            <div className="flex-shrink-0">
                               <button
                                className={cn(
                                  'flex items-center gap-2 font-medium text-left w-full hover:bg-muted/50 p-1 rounded-md transition-colors',
                                  selectedEmployee?.id === employee.id && 'bg-accent/20'
                                )}
                                onClick={() => handleViewEmployee(employee)}
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                                  <AvatarFallback>
                                    {(employee.firstName?.[0] || '') + (employee.lastName?.[0] || '')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <span className={cn('font-semibold', selectedEmployee?.id === employee.id && 'text-accent')}>
                                    {employee.firstName} {employee.lastName}
                                  </span>
                                  {employee.hasHelper && (
                                    <span className="text-muted-foreground font-normal ml-1 text-xs">
                                      (+ Helper)
                                    </span>
                                  )}
                                </div>
                              </button>
                            </div>

                            <div className="flex items-center gap-3 flex-grow justify-end">
                               <div className="space-y-1 flex-shrink-0 w-40">
                                <div className="flex items-center justify-between">
                                  <Label
                                    htmlFor={`attendance-${employee.id}`}
                                    className={cn('text-xs',
                                      employee.isAbsent && 'text-destructive'
                                    )}
                                  >
                                    {employee.isAbsent ? 'Absent' : 'Present'}
                                  </Label>
                                  <Switch
                                    id={`attendance-${employee.id}`}
                                    checked={!employee.isAbsent}
                                    onCheckedChange={(checked) =>
                                      handleAttendanceChange(
                                        employee.id,
                                        !checked
                                      )
                                    }
                                  />
                                </div>
                                {employee.hasHelper && (
                                  <div className="flex items-center justify-between">
                                    <Label
                                      htmlFor={`helper-attendance-${employee.id}`}
                                      className={cn('text-xs',
                                        employee.isHelperAbsent && 'text-destructive'
                                      )}
                                    >
                                      {employee.isHelperAbsent
                                        ? 'Helper Absent'
                                        : 'Helper Present'}
                                    </Label>
                                    <Switch
                                      id={`helper-attendance-${employee.id}`}
                                      checked={!employee.isHelperAbsent}
                                      onCheckedChange={(checked) =>
                                        handleHelperAttendanceChange(
                                          employee.id,
                                          !checked
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>

                              <div
                                className={cn(
                                  'w-full sm:w-48',
                                  !anyonePresent && 'invisible'
                                )}
                              >
                                <Select
                                  value={employee.projectId}
                                  onValueChange={(projectId) =>
                                    handleProjectChange(
                                      employee.id,
                                      projectId
                                    )
                                  }
                                  disabled={!anyonePresent}
                                >
                                  <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue placeholder="Assign Project" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {projects.map((project) => (
                                      <SelectItem
                                        key={project.id}
                                        value={project.id}
                                      >
                                        {project.name}
                                      </SelectItem>
                                    ))}
                                    {isAdminOrSupervisor && (
                                      <>
                                        <Separator className="my-1" />
                                        <div
                                          className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                                          onClick={() => {
                                            setIsAddProjectDialogOpen(true);
                                          }}
                                        >
                                          <PlusCircle className="mr-2 h-4 w-4" />
                                          <span>Add New Project</span>
                                        </div>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          
          {isAdminOrSupervisor && (
            <div className="flex flex-col items-start gap-2">
              <Label className="text-lg font-semibold">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[280px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={!!selectedEmployee}
        onOpenChange={(isOpen) => !isOpen && setSelectedEmployee(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-accent">Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setZoomedImage(selectedEmployee.photoUrl || null)}
                  className="rounded-full"
                  disabled={!selectedEmployee.photoUrl}
                >
                  <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage
                      src={selectedEmployee.photoUrl}
                      alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {(selectedEmployee.firstName?.[0] || '') +
                        (selectedEmployee.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div>
                  <h2 className="text-xl font-bold text-accent">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedEmployee.companyNumber}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-accent">
                    Phone Number
                  </p>
                  <p>{selectedEmployee.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-accent">
                    SA ID Number
                  </p>
                  <p>{selectedEmployee.idNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-accent">
                    Per Day Rate
                  </p>
                  <p>R {selectedEmployee.rate.toFixed(2)}</p>
                </div>
              </div>
              {selectedEmployee.hasHelper && selectedEmployee.helper && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-accent mb-2">
                      Helper Details
                    </p>
                    <div className="grid grid-cols-2 gap-4 p-2 rounded-md border">
                      <div>
                        <p className="text-xs font-medium">Name</p>
                        <p>
                          {selectedEmployee.helper.firstName}{' '}
                          {selectedEmployee.helper.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Per Day Rate</p>
                        <p>R {selectedEmployee.helper.rate.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {selectedEmployee.idCopyUrl && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-accent mb-2">
                      ID Document Copy
                    </p>
                    <div className="flex justify-center">
                      <button onClick={() => setZoomedImage(selectedEmployee.idCopyUrl!)}>
                        <Image
                          src={selectedEmployee.idCopyUrl}
                          alt="ID Document"
                          width={400}
                          height={250}
                          className="rounded-md object-contain border cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedEmployee(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isAddProjectDialogOpen}
        onOpenChange={setIsAddProjectDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Enter the name for the new project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. New Residential Build"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddProjectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNewProject}>Save Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!zoomedImage} onOpenChange={(isOpen) => !isOpen && setZoomedImage(null)}>
        <DialogContent className="sm:max-w-4xl p-2 bg-transparent border-0 shadow-none">
           <DialogTitle className="sr-only">Zoomed Image</DialogTitle>
           {zoomedImage && (
              <Image
                src={zoomedImage}
                alt="Zoomed Image"
                width={1200}
                height={800}
                className="rounded-md object-contain w-full h-auto"
              />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
} 