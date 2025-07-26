/**
 * CrewTab Component
 *
 * This component manages and displays the crew (employees) assigned to a project.
 *
 * Features:
 * - Fetches all employees and filters by those assigned to the project
 * - Allows viewing details for each crew member
 * - Supports adding/removing crew members
 *
 * Props:
 *   - projectId: Project ID string
 *   - employeeIds: Array of employee IDs assigned to the project
 *   - onCrewChange: Optional callback when crew changes
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


/**
 * Props for CrewTab
 * @property {string} projectId - Project ID
 * @property {string[]} employeeIds - Array of employee IDs assigned to the project
 * @property {() => void} [onCrewChange] - Optional callback when crew changes
 */
interface CrewTabProps {
  projectId: string;
  employeeIds: string[];
  onCrewChange?: () => void;
}

/**
 * CrewTab component for managing and displaying project crew.
 * @param {CrewTabProps} props
 */
const CrewTab: React.FC<CrewTabProps> = ({ projectId, employeeIds, onCrewChange }) => {
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [isLoadingAllEmployees, setIsLoadingAllEmployees] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState<any | null>(null);
  const [isAddCrewDialogOpen, setIsAddCrewDialogOpen] = useState(false);
  const [fullEmployee, setFullEmployee] = useState<any | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);

  // Compute crew from allEmployees and employeeIds (more efficient than storing in state)
  const crew = useMemo(() => 
    allEmployees.filter(employee => employeeIds.includes(employee.id)), 
    [allEmployees, employeeIds]
  );

  // Compute available employees for the dialog (not already in crew)
  const availableEmployees = useMemo(() => 
    allEmployees.filter(employee => !employeeIds.includes(employee.id)), 
    [allEmployees, employeeIds]
  );

  // Fetch all employees on mount
  useEffect(() => {
    setIsLoadingAllEmployees(true);
    getDocs(collection(db, 'employees'))
      .then(snap => {
        const employees = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllEmployees(employees);
      })
      .finally(() => setIsLoadingAllEmployees(false));
  }, []);

  // When a crew member is selected, fetch full employee data
  useEffect(() => {
    if (selectedCrewMember) {
      setIsLoadingEmployee(true);
      getDoc(doc(db, 'employees', selectedCrewMember.id))
        .then(snap => {
          if (snap.exists()) setFullEmployee({ id: snap.id, ...snap.data() });
          else setFullEmployee(selectedCrewMember); // fallback
        })
        .finally(() => setIsLoadingEmployee(false));
    } else {
      setFullEmployee(null);
    }
  }, [selectedCrewMember]);

  // Add a crew member
  const addCrewMember = async (employeeId: string) => {
    if (!projectId) return;
    const newIds = [...employeeIds, employeeId];
    await updateDoc(doc(db, 'projects', projectId), { employeeIds: newIds });
    if (onCrewChange) onCrewChange();
    setIsAddCrewDialogOpen(false);
  };

  // Remove a crew member
  const removeCrewMember = async (employeeId: string) => {
    if (!projectId) return;
    const newIds = employeeIds.filter(id => id !== employeeId);
    await updateDoc(doc(db, 'projects', projectId), { employeeIds: newIds });
    if (onCrewChange) onCrewChange();
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Crew</h2>
        <Button
          onClick={() => setIsAddCrewDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Crew Member
        </Button>
      </div>
      {crew.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No crew assigned to this project.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {crew.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />
                <AvatarFallback className="text-sm">{(member.firstName?.[0] || '') + (member.lastName?.[0] || '')}</AvatarFallback>
              </Avatar>
              <button
                className="font-medium text-left hover:underline focus:outline-none text-sm sm:text-base flex-1 min-w-0"
                onClick={() => setSelectedCrewMember(member)}
              >
                <div className="truncate">{member.firstName} {member.lastName}</div>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCrewMember(member.id)}
                className="flex-shrink-0 text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <Dialog open={isAddCrewDialogOpen} onOpenChange={setIsAddCrewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Crew Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingAllEmployees ? (
              <div className="flex items-center justify-center py-8">
                <span className="ml-2">Loading employees...</span>
              </div>
            ) : availableEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employees found. Please add employees first.
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select an employee to add to this project's crew:
                </p>
                {availableEmployees.map((employee: any) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => addCrewMember(employee.id)}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                        <AvatarFallback className="text-sm">
                          {(employee.firstName?.[0] || '') + (employee.lastName?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {employee.firstName} {employee.lastName}
                        </div>
                        {employee.companyNumber && (
                          <div className="text-sm text-muted-foreground truncate">
                            #{employee.companyNumber}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCrewDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoadingEmployee && !!selectedCrewMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewTab; 