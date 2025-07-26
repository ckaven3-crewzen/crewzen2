## CrewTab (ProZen)

**Current Features:**
- Lists all crew members assigned to the project, with avatars and names.
- Allows adding crew members from all employees (excluding those already assigned).
- Allows removing crew members from the project.
- Clicking a crew member opens a detail dialog with full employee info.
- Handles loading states for employee lists and detail fetches.
- Uses Firebase for all data operations.

**Improvement Suggestions:**
- Add search/filter to the Add Crew Member dialog for large employee lists.
- Show employee roles or job titles in the crew list and add dialog.
- Add confirmation dialog before removing a crew member.
- Support bulk add/remove for crew members.
- Show crew member status (active/inactive, on leave, etc.) if available.
- Add success/error toasts for add/remove actions.
- Optimize data fetching to avoid redundant queries (e.g., cache allEmployees).
- Allow sorting crew by name, role, or custom order.
- Add option to view employee profile in a new tab or modal.
- Improve accessibility (keyboard navigation, ARIA labels).

# ProZen Tab Improvement Notes

This document collects suggestions and future enhancements for the ProZen module tabs, especially the Tasks tab and TaskTable component.

## TaskTable/TasksTab Suggestions

1. Add a mobile-friendly card/list view for tasks (currently hidden on small screens).
2. Show photo/document attachment indicators or previews in the table.
3. Add an "assignee" column/field to assign tasks to team members.
4. Improve accessibility (aria-labels, keyboard navigation, etc.).
5. Replace `alert`-based toasts with your app’s notification system.
6. Add support for document uploads (not just photos).
7. Consider virtualization for large task lists.
8. Add more columns if needed (e.g., due date, priority).
9. Add filters/search for tasks.
10. Add bulk actions (e.g., mark multiple tasks as complete).

11. Add a debug panel for AI errors/output in the Tasks tab (for troubleshooting voice-to-task issues).
12. Improve error handling and user feedback for AI-generated tasks (e.g., show more details on failure).


## TeamTab/Team Management Suggestions

1. Support roles for each team member (e.g., project manager, supervisor).
2. Add the ability to remove or replace a team member from the project team.
3. Allow assigning or editing trades for each team member directly in the UI.
4. Ensure the team list and dialogs are mobile-friendly.
5. Support adding multiple team members at once or bulk editing.
6. Show last active or status (e.g., invited, active) for each member.
7. Trigger notifications or emails when a team member is added/edited.


## ReportsTab Suggestions

1. Integrate actual PDF generation (e.g., jsPDF + autoTable) for the "Generate PDF" button.
2. Add a mobile-friendly view for the task table and report preview.
3. Allow users to select which columns to include in the report.
4. Add options to export as CSV, email the report, or share a link.
5. Show task photos/documents in the report preview and PDF.
6. Consider paginating or virtualizing the task list for large projects.
7. Add accessibility improvements (aria-labels, keyboard navigation, etc.).
8. Optionally notify team members when a report is generated or shared.

## WorkersTab Suggestions

1. Design a UI for viewing and managing all workers assigned to the project.
2. Add filters/search for workers by name, trade, or status.
3. Support adding/removing workers from the project.
4. Show worker details (contact info, trade, status, last active, etc.).
5. Allow bulk actions (e.g., message, assign to task, mark attendance).
6. Add mobile-friendly and accessible layouts.
7. Integrate with team and task assignment flows.


---

Update this doc as you implement or prioritize new features!
