/**
 * EmployeeList Component
 *
 * Displays a table of employees with edit and delete triggers.
 *
 * Props:
 *   - employees: Array of Employee objects
 *   - isLoading: Optional loading state
 *   - onEditClick: Function to trigger editing an employee
 *   - onDeleteClick: Function to trigger deleting an employee
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React from 'react';
import { Employee } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { Pencil, Trash2 } from 'lucide-react';


/**
 * Props for EmployeeList
 * @property {Employee[]} employees - Array of Employee objects
 * @property {boolean} [isLoading] - Optional loading state
 * @property {(employee: Employee) => void} onEditClick - Function to trigger editing an employee
 * @property {(employee: Employee) => void} onDeleteClick - Function to trigger deleting an employee
 */
interface EmployeeListProps {
  employees: Employee[];
  isLoading?: boolean;
  onEditClick: (employee: Employee) => void;
  onDeleteClick: (employee: Employee) => void;
}

/**
 * EmployeeList component for displaying employees in a table.
 * @param {EmployeeListProps} props
 */
const EmployeeList: React.FC<EmployeeListProps> = ({ employees, isLoading = false, onEditClick, onDeleteClick }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Company Number</TableHead>
          {/* <TableHead>Phone</TableHead> */}
          <TableHead>Role</TableHead>
          {/* <TableHead>Actions</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow
            key={employee.id}
            className="cursor-pointer hover:bg-muted transition"
            onClick={() => onEditClick(employee)}
          >
            <TableCell className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {employee.photoUrl ? (
                  <AvatarImage src={employee.photoUrl} alt={employee.firstName} />
                ) : (
                  <AvatarFallback>
                    {employee.firstName?.[0]?.toUpperCase() || '?'}
                    {employee.lastName?.[0]?.toUpperCase() || ''}
                  </AvatarFallback>
                )}
              </Avatar>
              {employee.firstName}
            </TableCell>
            <TableCell>{employee.lastName}</TableCell>
            <TableCell>{employee.companyNumber}</TableCell>
            {/* <TableCell>{employee.phone}</TableCell> */}
            <TableCell>{employee.role}</TableCell>
            {/* <TableCell>
              <Button size="sm" variant="outline" onClick={() => onEdit(employee)}><Pencil size={16} /></Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(employee)} className="ml-2"><Trash2 size={16} /></Button>
            </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeeList;