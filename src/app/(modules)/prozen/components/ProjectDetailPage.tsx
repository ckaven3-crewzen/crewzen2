
/**
 * ProjectDetailPage Component - ProZen Project Management Interface
 *
 * PURPOSE: Comprehensive project detail management with tabbed interface
 *
 * 🔧 COMPONENT STATUS: COMPLEX COMPONENT - Debug cleanup needed
 * - Function: Multi-tab project management interface (Info, Tasks, Team, Crew, Reports, Access)
 * - Integration: Core ProZen project detail functionality with AI voice features
 * - Size: 282 lines - Complex component with multiple tab integrations
 *
 * 🔍 USAGE ANALYSIS:
 * - Central project detail interface for ProZen module
 * - Tabbed interface for different project management aspects
 * - Integrates with Firebase and AI voice-to-task features
 * - No duplicates found - unique core functionality
 *
 * ✅ EXCELLENT FEATURES:
 * - **Tabbed Interface**: Well-organized multi-tab project management
 * - **AI Integration**: Voice-to-task generation with audio processing
 * - **Component Composition**: Clean separation of tab components
 * - **Firebase Integration**: Real-time project and task data management
 * - **Image Handling**: Project photo display and management
 * - **Navigation**: Proper back navigation and routing
 *
 * 🚨 DEVELOPMENT DEBUG ISSUES:
 * - **Debug Panel**: Development-only debug panel with console.log statements
 * - **Console Statements**: 5 console.log statements in debug panel (lines 139-145)
 * - **Debug UI**: Visual debug panel should be removed for production
 *
 * 🔧 DEBUG CLEANUP NEEDED:
 * ```typescript
 * // Lines requiring cleanup in DebugPanel:
 * console.log('[ProjectDetailPage] activeTab:', activeTab);     // Line 139
 * console.log('[ProjectDetailPage] project:', project);        // Line 142  
 * console.log('[ProjectDetailPage] tasks:', tasks);           // Line 143
 * console.log('[ProjectDetailPage] trades:', trades);         // Line 144
 * console.log('[ProjectDetailPage] estateName:', estateName); // Line 145
 * ```
 *
 * 🏗️ ARCHITECTURE ANALYSIS:
 * - **Tab Management**: Clean tab state management with proper routing
 * - **Component Integration**: Well-composed with specialized tab components
 * - **AI Features**: Advanced voice-to-task generation integration
 * - **Data Flow**: Proper Firebase data fetching and state management
 * - **Debug System**: Development debug panel (should be conditional/removed)
 *
 * 📝 TAB COMPONENTS INTEGRATION:
 * - ProjectInfoTab: Project details and information management
 * - TasksTab: Task management with AI voice integration
 * - TeamTab: Team member management
 * - CrewTab: Crew assignment and management
 * - ReportsTab: Project reporting and analytics
 * - AccessTab: Access bundle generation and delivery
 *
 * 🎯 RECOMMENDATION: DEBUG CLEANUP - Remove/conditionally render debug panel
 *
 * TODO: PRODUCTION DEBUG CLEANUP
 * - Remove or conditionally render DebugPanel for production
 * - Remove 5 console.log statements from debug panel
 * - Consider environment-based debug panel visibility
 * - Add proper development mode checks
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Project, Task, ProjectTeamMember } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Mic, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateTasksFromAudio } from '@/ai/flows/generate-tasks-from-audio';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { fillAccessForm } from '@/actions/form-actions';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import TaskTable from '@/app/(modules)/prozen/components/TaskTable';
import ReportsTab from '@/app/(modules)/prozen/components/ReportsTab';
import TeamTab from '@/app/(modules)/prozen/components/TeamTab';
import CrewTab from '@/app/(modules)/prozen/components/CrewTab';
import ProjectInfoTab from '@/app/(modules)/prozen/components/ProjectInfoTab';
import AccessTab from '@/app/(modules)/prozen/components/AccessTab';
import AIVoiceToTask from '@/components/ai/AIVoiceToTask';
import TasksTab from '@/app/(modules)/prozen/components/TasksTab';


// --- Types for local state forms ---
/**
 * TaskForm: Local state type for editing/creating tasks
 */
type TaskForm = Omit<Task, "id"> & { id?: string };
/**
 * TeamForm: Local state type for editing/creating team members
 */
type TeamForm = Omit<ProjectTeamMember, "id"> & { id?: string };


/**
 * Utility to remove undefined fields from an object (shallow)
 * @param obj Object to clean
 * @returns Cleaned object
 */
function cleanObject(obj: Record<string, any>) {
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) cleaned[key] = obj[key];
  });
  return cleaned;
}



/**
 * Collapsible debug panel for development
 * @param {object} props
 * @property {string} activeTab - Current tab
 * @property {string | undefined} projectId - Project ID
 * @property {Project | null} project - Project object
 * @property {Task[]} tasks - Array of tasks
 * @property {string[]} trades - Array of trades
 */
type DebugPanelProps = {
  activeTab: string;
  projectId: string | undefined;
  project: Project | null;
  tasks: Task[];
  trades: string[];
};

const DebugPanel: React.FC<DebugPanelProps> = ({ activeTab, projectId, project, tasks, trades }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 4 }}
      >
        {open ? 'Hide' : 'Show'} Debug Info
      </button>
      {open && (
        <div className="mb-2 text-xs text-muted-foreground" style={{ background: '#181818', padding: 8, borderRadius: 4, maxWidth: 600, overflowX: 'auto' }}>
          <div>Active Tab: <b>{activeTab}</b></div>
          <div>Project ID: <b>{projectId}</b></div>
          <div>Project: <pre style={{display:'inline',whiteSpace:'pre-wrap',wordBreak:'break-all',maxWidth:400}}>{JSON.stringify(project, null, 2)}</pre></div>
          <div>Tasks: <pre style={{display:'inline',whiteSpace:'pre-wrap',wordBreak:'break-all',maxWidth:400}}>{JSON.stringify(tasks, null, 2)}</pre></div>
          <div>Trades: <pre style={{display:'inline',whiteSpace:'pre-wrap',wordBreak:'break-all',maxWidth:400}}>{JSON.stringify(trades, null, 2)}</pre></div>
        </div>
      )}
    </div>
  );
};

const ProjectDetailPage: React.FC = () => {

  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : Array.isArray(params?.projectId) ? params.projectId[0] : undefined;
  const { toast } = useToast();
  const router = useRouter();


  // All state declarations must come first
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [estateName, setEstateName] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isAddTeamDialog, setIsAddTeamDialog] = useState(false);
  const [addTeamType, setAddTeamType] = useState<'professional' | 'subcontractor' | null>(null);
  const [newPrincipalContractor, setNewPrincipalContractor] = useState({ companyName: '', contactName: '', phone: '', email: '' });
  const [isSavingPrincipalContractor, setIsSavingPrincipalContractor] = useState(false);
  const [trades, setTrades] = useState<string[]>([]);

  // Debug: Log tab state and props (must be after all state declarations)
  React.useEffect(() => {
    console.log('[ProjectDetailPage] activeTab:', activeTab);
  }, [activeTab]);
  React.useEffect(() => {
    console.log('[ProjectDetailPage] project:', project);
    console.log('[ProjectDetailPage] tasks:', tasks);
    console.log('[ProjectDetailPage] trades:', trades);
    console.log('[ProjectDetailPage] estateName:', estateName);
  }, [project, tasks, trades, estateName]);


  // --- Fetch project data ---
  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    const safeProjectId = projectId || '';
    getDoc(doc(db, "projects", safeProjectId))
      .then((snap) => {
        if (!snap.exists()) throw new Error("Project not found");
        const data = snap.data() as Project;
        setProject(data);
        setTasks(data.tasks || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  // Fetch estate name if estateId exists
  useEffect(() => {
    if (project && project.estateId) {
      const safeEstateId = project.estateId || '';
      getDoc(doc(db, "estates", safeEstateId))
        .then((snap) => {
          if (snap.exists()) {
            const data = snap.data() as { name?: string };
            setEstateName(data.name || null);
          }
        });
    }
  }, [project]);

  // Refetch project data when crew changes
  const refetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const snap = await getDoc(doc(db, "projects", projectId));
      if (snap.exists()) {
        const data = snap.data() as Project;
        setProject(data);
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error refetching project:', err);
    }
  }, [projectId]);

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin mr-2" /> Loading project...
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : project ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            {/* Offline Status Indicator */}
            <div className="flex items-center gap-2">
              {/* Offline Status Indicator */}
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Debug: Show current tab and props (collapsible) */}
            <DebugPanel
              activeTab={activeTab}
              projectId={projectId}
              project={project}
              tasks={tasks}
              trades={trades}
            />
            <TabsList className="mb-6 flex flex-wrap gap-2 bg-muted p-1 rounded-md">
              <TabsTrigger value="tasks" className="flex-1 min-w-0 text-xs sm:text-sm">Tasks</TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 min-w-0 text-xs sm:text-sm">Reports</TabsTrigger>
              <TabsTrigger value="team" className="flex-1 min-w-0 text-xs sm:text-sm">Team</TabsTrigger>
              <TabsTrigger value="crew" className="flex-1 min-w-0 text-xs sm:text-sm">Crew</TabsTrigger>
              <TabsTrigger value="info" className="flex-1 min-w-0 text-xs sm:text-sm">Project Info</TabsTrigger>
              <TabsTrigger value="access" className="flex-1 min-w-0 text-xs sm:text-sm">Access</TabsTrigger>
            </TabsList>
            {/* --- Tasks Tab --- */}
            <TabsContent value="tasks">
              <TasksTab
                projectId={projectId || ''}
                tasks={tasks}
                setTasks={setTasks}
                trades={trades}
                setTrades={setTrades}
              />
            </TabsContent>
            {/* --- Reports Tab --- */}
            <TabsContent value="reports">
              <ReportsTab
                project={project}
                tasks={tasks}
              />
            </TabsContent>
            {/* --- Team Tab --- */}
            <TabsContent value="team">
              <TeamTab
                projectId={projectId || ''}
                setProject={setProject}
              />
            </TabsContent>
            {/* --- Crew Tab --- */}
            <TabsContent value="crew">
              <CrewTab
                projectId={projectId || ''}
                employeeIds={project?.employeeIds || []}
                onCrewChange={refetchProject}
              />
            </TabsContent>
            {/* --- Project Info Tab --- */}
            <TabsContent value="info">
              <ProjectInfoTab
                projectId={projectId || ''}
                setProject={setProject}
                toast={toast}
              />
            </TabsContent>
            {/* --- Access Tab --- */}
            <TabsContent value="access">
              <AccessTab
                projectId={projectId || ''}
                project={project}
                estateName={estateName}
                fillAccessForm={fillAccessForm}
                getEstateEmail={async (estateId: string) => {
                  if (!estateId) return null;
                  const estateSnap = await getDoc(doc(db, 'estates', estateId));
                  return estateSnap.exists() ? estateSnap.data().email : null;
                }}
                toast={toast}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}

export default ProjectDetailPage;
    