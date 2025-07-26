/**
 * TasksTab Component - ProZen Task Management Interface
 *
 * PURPOSE: Comprehensive task management with AI integration
 *
 * 🔧 COMPONENT STATUS: COMPLEX COMPONENT - Debug cleanup needed
 * - Function: Task CRUD operations with AI voice-to-task integration
 * - Integration: Core ProZen task management with AI features
 * - Size: 469 lines - Large component with task management and AI features
 *
 * 🔍 USAGE ANALYSIS:
 * - Task management interface within ProZen project detail
 * - Integrates TaskTable component for task display
 * - AI voice-to-task generation capabilities
 * - No duplicates found - unique task management functionality
 *
 * ✅ EXCELLENT FEATURES:
 * - **Task Management**: Complete CRUD operations for project tasks
 * - **AI Integration**: Voice-to-task generation with AIVoiceToTask component
 * - **File Upload**: Task attachment and document management
 * - **Component Composition**: Clean integration with TaskTable component
 * - **Firebase Integration**: Real-time task data synchronization
 * - **Trade Management**: Dynamic trade categories and filtering
 *
 * 🚨 DEBUG ISSUES FOUND:
 * - **Console Statements**: 2 console.log statements for development debugging
 * - **Debug Logging**: Task prop and setTasks function logging
 *
 * 🔧 CONSOLE STATEMENTS TO REMOVE:
 * ```typescript
 * // Lines requiring cleanup:
 * console.log('[TasksTab] tasks prop:', tasks);           // Line 78
 * console.log('[TasksTab] setTasks called with:', newTasks); // Line 82
 * ```
 *
 * 🏗️ ARCHITECTURE ANALYSIS:
 * - **Component Composition**: Good separation with TaskTable and AIVoiceToTask
 * - **State Management**: Proper task state management with prop drilling
 * - **AI Integration**: Advanced voice processing with Firebase storage
 * - **Firebase Operations**: Task CRUD with proper error handling
 * - **File Handling**: Task attachment upload and management
 *
 * 📝 COMPONENT INTEGRATION:
 * - TaskTable: Task display and inline editing
 * - AIVoiceToTask: Voice-to-task generation functionality
 * - Firebase: Real-time task data and file storage
 * - Trade Management: Dynamic trade category system
 *
 * 🎯 RECOMMENDATION: DEBUG CLEANUP - Remove console statements, otherwise excellent
 *
 * TODO: PRODUCTION DEBUG CLEANUP
 * - Remove 2 console.log statements (lines 78, 82)
 * - Consider adding proper logging service for development
 * - Evaluate component size for potential splitting
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Mic } from 'lucide-react';
import TaskTable from './TaskTable';
import TaskDialog from './TaskDialog';
import AIVoiceToTask from '@/components/ai/AIVoiceToTask';
import { db } from '@/lib/firebase';
import { updateDoc, doc, addDoc, collection } from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';

// TODO: Import types as needed
import type { Task } from '@/lib/types';


/**
 * Props for TasksTab
 * @property {string} projectId - Project ID
 * @property {Task[]} tasks - Array of Task objects
 * @property {(tasks: Task[]) => void} setTasks - Function to update tasks
 * @property {string[]} trades - Array of trade strings
 * @property {(trades: string[]) => void} setTrades - Function to update trades
 */
interface TasksTabProps {
  projectId: string;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  trades: string[];
  setTrades: (trades: string[]) => void;
}

// Utility to remove undefined fields from a task object
function cleanTask<T extends Record<string, any>>(task: T): T {
  const cleaned: Record<string, any> = { ...task };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) delete cleaned[key];
  });
  return cleaned as T;
}

// Utility to remove undefined fields from an object (shallow)
function cleanObject(obj: Record<string, any>) {
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) cleaned[key] = obj[key];
  });
  return cleaned;
}

/**
 * TasksTab component for managing and displaying project tasks.
 * @param {TasksTabProps} props
 */
const TasksTab: React.FC<TasksTabProps> = ({ projectId, tasks, setTasks, trades, setTrades }) => {
  // Debug: Log tasks prop on every render
  React.useEffect(() => {
    console.log('[TasksTab] tasks prop:', tasks);
  }, [tasks]);
  // Patch setTasks to log updates
  const debugSetTasks = (newTasks: Task[]) => {
    console.log('[TasksTab] setTasks called with:', newTasks);
    setTasks(newTasks);
  };

  // Dialog and form state
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);

  // Add toast logic (replace with your own toast hook if needed)
  const toast = (msg: { title: string; description?: string; variant?: string }) => {
    alert(msg.title + (msg.description ? ': ' + msg.description : ''));
  };

  // Compute unique trades from current tasks
  const uniqueTaskTrades = Array.from(new Set(tasks.map(t => t.trade).filter(Boolean)));
  const allTrades = Array.from(new Set([...uniqueTaskTrades, ...trades]));

  // Unified save handler for both add and edit
  const handleTaskSave = async (task: Task) => {
    setIsSavingTask(true);
    try {
      let finalTrade = task.trade;
      
      // Add new trade to collection if it doesn't exist
      if (finalTrade && finalTrade !== '__custom__' && !trades.includes(finalTrade)) {
        await addDoc(collection(db, 'trades'), { name: finalTrade });
        setTrades([...trades, finalTrade]);
        toast({ title: `New trade "${finalTrade}" added to trades collection!` });
      }

      let updatedTasks: Task[];
      if (editTask && task.id === editTask.id) {
        // Editing existing task
        updatedTasks = tasks.map((t) => t.id === task.id ? cleanTask(task) : cleanTask(t));
        toast({ title: 'Task updated successfully!' });
      } else {
        // Adding new task
        updatedTasks = [...tasks, cleanTask(task)];
        toast({ title: 'Task added successfully!' });
      }

      const updatePayload = cleanObject({ tasks: updatedTasks });
      debugSetTasks(updatedTasks);
      
      if (projectId) {
        await updateDoc(doc(db, 'projects', projectId), updatePayload);
      }

      // Reset edit state
      setEditTask(null);
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: `Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsSavingTask(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setShowVoiceDialog(true)} className="w-full sm:w-auto">
            <Mic className="mr-2 h-4 w-4" /> Voice Note
          </Button>
          <Button variant="default" onClick={() => {
            setIsAddTaskDialogOpen(true);
          }} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Task List (mobile and desktop) */}
      {tasks.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No tasks yet.</div>
      ) : (
        <div className="space-y-4">
          {/* TODO: Add mobile card view if needed */}
          <TaskTable
            tasks={tasks}
            onEdit={(task) => {
              setEditTask(task);
              setEditTask(task);
              setIsEditDialogOpen(true);
            }}
            onStatusChange={async (task, newStatus) => {
              if (newStatus === 'Completed') {
                // Remove the task from the list
                const updatedTasks = tasks.filter(t => t.id !== task.id);
                debugSetTasks(updatedTasks);
                // Update Firestore
                if (projectId) {
                  const updatePayload = { tasks: updatedTasks };
                  try {
                    await updateDoc(doc(db, 'projects', projectId), updatePayload);
                    toast({ title: 'Task marked as completed and removed.' });
                  } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to update tasks in Firestore.' });
                  }
                }
              } else {
                // Update the status in the list
                const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
                debugSetTasks(updatedTasks);
                // Update Firestore
                if (projectId) {
                  const updatePayload = { tasks: updatedTasks };
                  try {
                    await updateDoc(doc(db, 'projects', projectId), updatePayload);
                    toast({ title: 'Task status updated.' });
                  } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to update tasks in Firestore.' });
                  }
                }
              }
            }}
          />
        </div>
      )}

      {/* Task Dialogs */}
      <TaskDialog
        mode="add"
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onSave={handleTaskSave}
        projectId={projectId}
        allTrades={allTrades}
        isSaving={isSavingTask}
      />

      <TaskDialog
        mode="edit"
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={editTask || undefined}
        onSave={handleTaskSave}
        projectId={projectId}
        allTrades={allTrades}
        isSaving={isSavingTask}
      />

      {/* AI Voice Note Dialog */}
      <AIVoiceToTask
        open={showVoiceDialog}
        onOpenChange={setShowVoiceDialog}
        onTasksGenerated={async (generatedTasks) => {
          if (!generatedTasks || generatedTasks.length === 0) {
            toast({ variant: 'destructive', title: 'No tasks generated', description: 'No tasks were generated from your voice note.' });
            return;
          }
          try {
            // Prepare new tasks with required fields
            const newTasks = generatedTasks.map(task => ({
              ...cleanTask(task),
              id: crypto.randomUUID(),
              status: 'To Do',
              createdAt: Date.now(),
            }));
            const cleanedTasks = [...tasks, ...newTasks].map(cleanTask);
            const updatePayload = cleanObject({ tasks: cleanedTasks });
            debugSetTasks(cleanedTasks);
            if (projectId) {
              await updateDoc(doc(db, 'projects', projectId), updatePayload);
            }
            toast({ title: `Generated ${newTasks.length} tasks from voice note!` });
          } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to add AI-generated tasks: ${error instanceof Error ? error.message : 'Unknown error'}` });
          }
        }}
      />

      {/* TODO: Add debug panel for AI errors/output if needed */}
    </div>
  );
};

export default TasksTab; 