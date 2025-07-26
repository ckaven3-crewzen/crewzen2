/**
 * TaskTable Component
 *
 * Displays a sortable table of tasks with status editing and edit triggers.
 *
 * Props:
 *   - tasks: Array of Task objects
 *   - onEdit: Function to trigger editing a task
 *   - onStatusChange: Function to update task status
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React from "react";
import type { Task } from '@/lib/types';


/**
 * Props for TaskTable
 * @property {Task[]} tasks - Array of Task objects
 * @property {(task: Task) => void} onEdit - Function to trigger editing a task
 * @property {(task: Task, newStatus: Task['status']) => void} onStatusChange - Function to update task status
 */
interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: Task['status']) => void;
}

/**
 * TaskTable component for displaying and editing tasks in a table.
 * @param {TaskTableProps} props
 */
const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEdit, onStatusChange }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Trade</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {[...tasks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map((task) => (
            <tr
              key={task.id}
              className="hover:bg-accent cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName.toLowerCase() !== 'select') {
                  onEdit(task);
                }
              }}
            >
              <td className="px-4 py-2">{task.description}</td>
              <td className="px-4 py-2">{task.trade}</td>
              <td className="px-4 py-2">
                <select
                  value={task.status}
                  className="border rounded px-2 py-1 bg-background"
                  onClick={e => e.stopPropagation()}
                  onChange={e => onStatusChange(task, e.target.value as Task['status'])}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="px-4 py-2">{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable; 