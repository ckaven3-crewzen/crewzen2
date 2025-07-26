import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Employee } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Props for the delete dialog
interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// This dialog asks the user to confirm deleting an employee
const EmployeeDeleteDialog: React.FC<EmployeeDeleteDialogProps> = ({
  open,
  onOpenChange,
  employee,
  isDeleting,
  onCancel,
  onConfirm,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete {employee?.firstName} {employee?.lastName} from the database. This action does NOT delete the user from Firebase Authentication.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting} onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="animate-spin" /> : 'Continue'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default EmployeeDeleteDialog;
