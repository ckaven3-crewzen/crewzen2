/**
 * ReportsTab Component
 *
 * This component provides a UI for generating, filtering, and previewing project task reports.
 *
 * Features:
 * - Filter tasks by trade, date, and location.
 * - Display filtered tasks in a table.
 * - List team members and allow sending reports via Email or WhatsApp.
 * - Preview a report summary in a dialog, including tasks, team, and distribution.
 * - (Placeholder) Generate PDF functionality.
 *
 * Props:
 *   - project: Project object (should contain projectTeam array)
 *   - tasks: Array of task objects
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Remove all props except project and tasks

/**
 * Props for ReportsTab
 * @property {any} project - The project object, should include projectTeam.
 * @property {any[]} tasks - Array of task objects to report on.
 */
interface ReportsTabProps {
  project: any;
  tasks: any[];
}

/**
 * ReportsTab component for generating and previewing project task reports.
 * @param {ReportsTabProps} props
 */
const ReportsTab: React.FC<ReportsTabProps> = ({ project, tasks }) => {
  // State for filters and dialog
  const [reportTrade, setReportTrade] = React.useState('');
  const [reportDate, setReportDate] = React.useState('');
  const [reportLocation, setReportLocation] = React.useState('');
  const [isReportPreviewOpen, setIsReportPreviewOpen] = React.useState(false);
  const [reportPreviewData, setReportPreviewData] = React.useState<any>(null);

  /**
   * Derive unique trades from the tasks array for the filter dropdown.
   */
  const trades = React.useMemo(() => Array.from(new Set(tasks.map((t: any) => t.trade).filter(Boolean))), [tasks]);

  /**
   * Filter tasks based on selected trade, date, and location.
   */
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task: any) => {
      const matchTrade = !reportTrade || task.trade === reportTrade;
      const matchDate = !reportDate || (task.createdAt && new Date(task.createdAt).toISOString().slice(0, 10) === reportDate);
      const matchLocation = !reportLocation || (task.location && task.location.toLowerCase().includes(reportLocation.toLowerCase()));
      return matchTrade && matchDate && matchLocation;
    });
  }, [tasks, reportTrade, reportDate, reportLocation]);

  /**
   * Team members for the project (replace with real team if needed).
   */
  const team = project?.projectTeam || [];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-6">Generate Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Trade</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={reportTrade}
            onChange={e => setReportTrade(e.target.value)}
          >
            <option value="">All</option>
            {trades.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={reportDate}
            onChange={e => setReportDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={reportLocation}
            onChange={e => setReportLocation(e.target.value)}
            placeholder="Location"
          />
        </div>
      </div>
      <div className="hidden sm:block overflow-x-auto mb-6">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Trade</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No tasks found.</td></tr>
            ) : (
              filteredTasks.map(task => (
                <tr key={task.id}>
                  <td className="px-4 py-2">{task.description}</td>
                  <td className="px-4 py-2">{task.trade}</td>
                  <td className="px-4 py-2">{task.status}</td>
                  <td className="px-4 py-2">{task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd') : ''}</td>
                  <td className="px-4 py-2">{task.location || ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <h3 className="text-lg font-semibold mb-4">Send Report</h3>
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => {
            setReportPreviewData({
              projectName: project?.name || '',
              reportDate,
              reportTrade,
              reportLocation,
              tasks: filteredTasks,
              teamMembers: team
            });
            setIsReportPreviewOpen(true);
          }}
          disabled={filteredTasks.length === 0}
          className="w-full sm:w-auto"
        >
          Preview Report
        </Button>
      </div>
      <div className="space-y-4">
        {reportTrade ? (
          team.filter((m: any) => m.trade === reportTrade).map((member: any) => (
            <div key={member.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-medium text-sm">{member.contactPerson} ({member.trade})</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="secondary" className="w-full sm:w-auto">Email</Button>
                  <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                    <a href={`https://wa.me/${member.phone?.replace(/\D/g, '')}?text=${encodeURIComponent('Here are your tasks: ' + filteredTasks.filter(t => t.trade === member.trade).map(t => t.description).join('; '))}`} target="_blank">WhatsApp</a>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          team.map((member: any) => (
            <div key={member.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-medium text-sm">{member.contactPerson} ({member.trade})</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="secondary" className="w-full sm:w-auto">Email</Button>
                  <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                    <a href={`https://wa.me/${member.phone?.replace(/\D/g, '')}?text=${encodeURIComponent('Here are your tasks: ' + filteredTasks.filter(t => t.trade === member.trade).map(t => t.description).join('; '))}`} target="_blank">WhatsApp</a>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Report Preview Dialog */}
      <Dialog open={isReportPreviewOpen} onOpenChange={setIsReportPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          {reportPreviewData && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold mb-2">{reportPreviewData.projectName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Date:</span> {reportPreviewData.reportDate || 'All dates'}
                  </div>
                  <div>
                    <span className="font-medium">Trade:</span> {reportPreviewData.reportTrade || 'All trades'}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {reportPreviewData.reportLocation || 'All locations'}
                  </div>
                </div>
              </div>
              {/* Tasks Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tasks Summary</h3>
                <div className="bg-muted p-4 rounded">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Tasks:</span> {reportPreviewData.tasks.length}
                    </div>
                    <div>
                      <span className="font-medium">To Do:</span> {reportPreviewData.tasks.filter(t => t.status === 'To Do').length}
                    </div>
                    <div>
                      <span className="font-medium">In Progress:</span> {reportPreviewData.tasks.filter(t => t.status === 'In Progress').length}
                    </div>
                    <div>
                      <span className="font-medium">Completed:</span> {reportPreviewData.tasks.filter(t => t.status === 'Completed').length}
                    </div>
                  </div>
                </div>
              </div>
              {/* Tasks Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border rounded">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Trade</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Created</th>
                        <th className="px-4 py-2 text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportPreviewData.tasks.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No tasks found.</td></tr>
                      ) : (
                        reportPreviewData.tasks.map((task: any) => (
                          <tr key={task.id} className="border-t">
                            <td className="px-4 py-2">{task.description}</td>
                            <td className="px-4 py-2">{task.trade}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-4 py-2">{task.createdAt ? format(new Date(task.createdAt), 'yyyy-MM-dd') : ''}</td>
                            <td className="px-4 py-2">{task.location || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportPreviewData.teamMembers.length === 0 ? (
                    <div className="text-muted-foreground">No team members assigned.</div>
                  ) : (
                    reportPreviewData.teamMembers.map((member: any) => (
                      <div key={member.id} className="border rounded p-3">
                        <div className="font-medium">{member.contactPerson}</div>
                        <div className="text-sm text-muted-foreground">{member.companyName}</div>
                        <div className="text-sm text-muted-foreground">{member.trade}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <div className="text-sm text-muted-foreground">{member.phone}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Distribution Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Distribution Preview</h3>
                <div className="space-y-2">
                  {reportPreviewData.reportTrade ? (
                    reportPreviewData.teamMembers
                      .map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{member.contactPerson}</span>
                            <span className="text-sm text-muted-foreground ml-2">({member.trade})</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reportPreviewData.tasks.filter(t => t.trade === member.trade).length} tasks
                          </div>
                        </div>
                      ))
                  ) : (
                    reportPreviewData.teamMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{member.contactPerson}</span>
                          <span className="text-sm text-muted-foreground ml-2">({member.trade})</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {reportPreviewData.tasks.filter(t => t.trade === member.trade).length} tasks
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportPreviewOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                // Here you would trigger the actual PDF generation
                // toast({ title: 'PDF generation would start here' });
                setIsReportPreviewOpen(false);
              }}
            >
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsTab; 