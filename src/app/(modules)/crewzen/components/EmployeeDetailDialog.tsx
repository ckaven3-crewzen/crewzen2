import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface EmployeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onClose: () => void;
}

const EmployeeDetailDialog: React.FC<EmployeeDetailDialogProps> = ({ open, onOpenChange, employee, onClose }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Employee Details</DialogTitle>
      </DialogHeader>
      {employee ? (
        <div>
          <div><strong>Name:</strong> {employee.firstName} {employee.lastName}</div>
          <div><strong>Role:</strong> {employee.role}</div>
          <div><strong>Company Number:</strong> {employee.companyNumber}</div>
          {/* Add more fields as needed */}
        </div>
      ) : (
        <div>No employee selected.</div>
      )}
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EmployeeDetailDialog;
