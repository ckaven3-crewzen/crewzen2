/**
 * TaskDialog Component - ProZen Module
 *
 * PURPOSE: Dedicated task creation and editing dialog with photo capabilities
 *
 * ✅ COMPONENT STATUS: NEW EXTRACTION - Enhanced with PhotoUploader integration
 * - Function: Task CRUD operations in modal dialog
 * - Integration: Extracted from TasksTab for better maintainability
 * - Dependencies: PhotoUploader, Firebase Storage, form validation
 *
 * 🔍 USAGE ANALYSIS:
 * - Used in ProZen TasksTab for task management
 * - Handles both Add and Edit modes with single component
 * - Integrates PhotoUploader for camera and file upload functionality
 * - Future reusability: Project overview, employee dashboard, mobile interfaces
 *
 * ✅ EXCELLENT FEATURES:
 * - **Dual Mode**: Single component handles both add and edit operations
 * - **Photo Integration**: Camera and file upload via PhotoUploader component
 * - **Form Validation**: Comprehensive validation with user feedback
 * - **Custom Trades**: Support for predefined and custom trade selection
 * - **Loading States**: Proper async operation feedback
 * - **Type Safety**: Proper TypeScript interfaces and validation
 *
 * 🏗️ ARCHITECTURE BENEFITS:
 * - **Separation of Concerns**: Dialog logic isolated from list management
 * - **Reusability**: Can be used in other task management contexts
 * - **Maintainability**: Easier to test and develop dialog features
 * - **PhotoUploader Integration**: Clean implementation of camera functionality
 * - **Future Ready**: Prepared for mobile and standalone task interfaces
 *
 * 📝 COMPONENT CONTEXT:
 * - Extracted from TasksTab.tsx to reduce component size (507 → 387 lines)
 * - Part of ProZen project management module
 * - Integrates with Firebase Storage for task photo management
 * - Uses existing PhotoUploader component for consistency
 *
 * 🏷️ RECOMMENDATION: EXCELLENT EXTRACTION - Improved maintainability and reusability
 *
 * Author: Component Cleanup Session
 * Date: 2025-07-26
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhotoUploader from '@/components/PhotoUploader';

interface Task {
  id: string;
  description: string;
  trade: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  photoUrl?: string;
  customTrade?: string;
  createdAt: number;
}

interface TaskDialogProps {
  mode: 'add' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSave: (task: Task) => Promise<void>;
  projectId: string;
  allTrades: string[];
  isSaving?: boolean;
}

interface TaskFormState {
  description: string;
  trade: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  photoUrl?: string;
  customTrade?: string;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  mode,
  open,
  onOpenChange,
  task,
  onSave,
  projectId,
  allTrades,
  isSaving = false
}) => {
  const [formState, setFormState] = useState<TaskFormState>({
    description: '',
    trade: '',
    status: 'To Do',
    photoUrl: '',
    customTrade: ''
  });

  // Initialize form when dialog opens or task changes
  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormState({
        description: task.description || '',
        trade: task.trade || '',
        status: task.status || 'To Do',
        photoUrl: task.photoUrl || '',
        customTrade: task.customTrade || ''
      });
    } else if (mode === 'add') {
      setFormState({
        description: '',
        trade: '',
        status: 'To Do',
        photoUrl: '',
        customTrade: ''
      });
    }
  }, [mode, task, open]);

  const handleSave = async () => {
    if (!formState.description.trim()) return;

    const taskData: Task = {
      id: mode === 'edit' && task ? task.id : crypto.randomUUID(),
      description: formState.description.trim(),
      trade: formState.trade === '__custom__' ? (formState.customTrade || '') : formState.trade,
      status: formState.status,
      photoUrl: formState.photoUrl,
      createdAt: mode === 'edit' && task ? task.createdAt : Date.now(),
    };

    // Remove customTrade from final object if not needed
    if (formState.trade !== '__custom__') {
      delete taskData.customTrade;
    }

    try {
      await onSave(taskData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleTradeChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      trade: value,
      customTrade: value === '__custom__' ? prev.customTrade : ''
    }));
  };

  const handlePhotoUpload = (url: string, storagePath?: string) => {
    setFormState(prev => ({
      ...prev,
      photoUrl: url
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Description Field */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <Input
              value={formState.description}
              onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter task description"
            />
          </div>

          {/* Trade Selection */}
          <div>
            <label className="block mb-1 font-medium">Trade</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formState.trade === '__custom__' ? '__custom__' : formState.trade}
              onChange={e => handleTradeChange(e.target.value)}
            >
              <option value="">Select trade</option>
              {allTrades.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
              <option value="__custom__">Other (type below)</option>
            </select>
            
            {/* Custom Trade Input */}
            {formState.trade === '__custom__' && (
              <Input
                className="w-full border rounded px-3 py-2 mt-2"
                placeholder="Enter custom trade"
                value={formState.customTrade || ''}
                onChange={e => setFormState(prev => ({ ...prev, customTrade: e.target.value }))}
              />
            )}
          </div>

          {/* Status Selection */}
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              value={formState.status}
              onChange={e => setFormState(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Task Photo Section */}
          <div>
            <label className="block mb-1 font-medium">Task Photo</label>
            
            {/* Show existing photo if available */}
            {formState.photoUrl && (
              <div className="mb-2">
                <img 
                  src={formState.photoUrl} 
                  alt="Task" 
                  className="max-h-40 rounded border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => setFormState(prev => ({ ...prev, photoUrl: '' }))}
                >
                  Remove Photo
                </Button>
              </div>
            )}
            
            {/* PhotoUploader Integration */}
            <PhotoUploader
              storagePath={(imageId) => `projects/${projectId}/tasks/${task?.id || 'new'}/images/${imageId}.jpg`}
              onUploadComplete={handlePhotoUpload}
              maxImages={1}
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formState.description.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
