/**
 * TeamTab Component
 *
 * This component manages and displays the project team (professionals and subcontractors).
 *
 * Features:
 * - Fetches and displays team members from Firestore
 * - Allows adding, editing, and removing team members
 * - Fetches trades and company lists for selection
 *
 * Props:
 *   - projectId: Project ID string
 *   - setProject: Function to update project state
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { arrayUnion, updateDoc } from 'firebase/firestore';
import type { ConnectZenCompany } from '@/lib/types';
import TeamMemberSelect from '@/components/TeamMemberSelect';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { setDoc, doc as firestoreDoc, collection as firestoreCollection } from 'firebase/firestore';

// Only accept projectId and setProject as props

/**
 * Props for TeamTab
 * @property {string} projectId - Project ID
 * @property {(updater: any) => void} setProject - Function to update project state
 */
interface TeamTabProps {
  projectId: string;
  setProject: (updater: any) => void;
}

/**
 * TeamTab component for managing and displaying project team members.
 * @param {TeamTabProps} props
 */
const TeamTab: React.FC<TeamTabProps> = ({ projectId, setProject }) => {
  // Local state for team, trades, and dialog
  const [team, setTeam] = React.useState<any[]>([]);
  const [trades, setTrades] = React.useState<string[]>([]);
  const [isTradesDialogOpen, setIsTradesDialogOpen] = React.useState(false);
  const [isAddingProfessional, setIsAddingProfessional] = React.useState(false);
  const [isAddingSubcontractor, setIsAddingSubcontractor] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<null | (ConnectZenCompany & { type: 'professional' | 'subcontractor' })>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // Fetch team array from the project document in Firestore
    const fetchTeam = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          setTeam(data.projectTeam || []); // Use 'projectTeam' as the field name
        } else {
          setTeam([]);
        }
      } catch (error) {
        console.error('Error fetching project team:', error);
        setTeam([]);
      }
    };
    // Fetch trades from Firestore (assuming a 'trades' collection)
    const fetchTrades = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'trades'));
        setTrades(snapshot.docs.map(doc => doc.data().name || ''));
      } catch (error) {
        console.error('Error fetching trades:', error);
        setTrades([]);
      }
    };

    if (projectId) {
      fetchTeam();
      fetchTrades();
    }
  }, [projectId]);

  const handleAddTeamMember = async (type: 'professional' | 'subcontractor', memberId: string) => {
    if (memberId === 'add-new') {
      if (type === 'professional') setIsAddingProfessional(true);
      else setIsAddingSubcontractor(true);
      return;
    }

    try {
      // Fetch the selected member from Firebase
      const companiesSnapshot = await getDocs(collection(db, 'connectZenCompanies'));
      const member = companiesSnapshot.docs
        .map(doc => ({
          ...doc.data() as ConnectZenCompany,
          id: doc.id
        }))
        .find(company => company.id === memberId);

      if (!member) return;

      // Prepare ProjectTeamMember shape
      const newMember = {
        id: member.id,
        companyName: member.companyName || '',
        contactPerson: member.contactPerson || '',
        email: member.email || '',
        trade: member.industry || '',
        phone: member.phone || '',
        type,
      };

      // Add to Firestore
      await updateDoc(doc(db, 'projects', projectId), {
        projectTeam: arrayUnion(newMember),
      });

      // Refresh local team state
      setTeam(prev => [...prev, newMember]);
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  // Add handlers for dialog close and submit
  const handleAddProfessional = async (data: any) => {
    // Add to 'connectZenCompanies' collection with professional industry
    await setDoc(firestoreDoc(db, 'connectZenCompanies', crypto.randomUUID()), {
      ...data,
      industry: data.industry || 'professional services',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setIsAddingProfessional(false);
  };
  
  const handleAddSubcontractor = async (data: any) => {
    // Add to 'connectZenCompanies' collection with contractor industry
    await setDoc(firestoreDoc(db, 'connectZenCompanies', crypto.randomUUID()), {
      ...data,
      industry: data.industry || 'construction contractor',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setIsAddingSubcontractor(false);
  };

  const handleEditClick = (member: any) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingMember) return;
    
    // Update in connectZenCompanies collection
    await setDoc(firestoreDoc(db, 'connectZenCompanies', editingMember.id), { 
      ...editingMember, 
      ...data,
      updatedAt: Date.now()
    }, { merge: true });
    
    setIsEditDialogOpen(false);
    setEditingMember(null);
    
    // Note: TeamMemberSelect components will refresh their own lists
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Professional Team</h2>
        <Button size="sm" variant="outline" className="mb-6 w-full sm:w-auto" onClick={() => setIsTradesDialogOpen(true)}>Manage Trades</Button>
        {team.filter(m => m.type === 'professional').length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No professional team members yet.</div>
        ) : (
          <div className="space-y-4">
            {team.filter(m => m.type === 'professional').map((member) => (
              <div key={member.id} className="bg-card rounded-lg p-4 border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <button
                      className="font-medium text-left hover:underline focus:outline-none text-sm sm:text-base"
                      onClick={() => handleEditClick({ ...member, type: 'professional' })}
                    >
                      {member.contactPerson}
                    </button>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">{member.trade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Professional Selection */}
        <div className="mt-6">
          <TeamMemberSelect
            type="professional"
            label="Add Professional"
            placeholder="Select professional..."
            onSelect={(memberId) => handleAddTeamMember('professional', memberId)}
          />
        </div>
      </div>
      {/* Subcontractors Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Subcontractors</h2>
        {team.filter(m => m.type === 'subcontractor').length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No subcontractors yet.</div>
        ) : (
          <div className="space-y-4">
            {team.filter(m => m.type === 'subcontractor').map((member) => (
              <div key={member.id} className="bg-card rounded-lg p-4 border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <button
                      className="font-medium text-left hover:underline focus:outline-none text-sm sm:text-base"
                      onClick={() => handleEditClick({ ...member, type: 'subcontractor' })}
                    >
                      {member.contactPerson}
                    </button>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">{member.trade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Subcontractor Selection */}
        <div className="mt-6">
          <TeamMemberSelect
            type="subcontractor"
            label="Add Subcontractor"
            placeholder="Select subcontractor..."
            onSelect={(memberId) => handleAddTeamMember('subcontractor', memberId)}
          />
        </div>
      </div>
      {/* Add Professional Dialog */}
      <Dialog open={isAddingProfessional} onOpenChange={setIsAddingProfessional}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Professional</DialogTitle>
            <DialogDescription>Fill in the details to add a new professional company.</DialogDescription>
          </DialogHeader>

        </DialogContent>
      </Dialog>
      {/* Add Subcontractor Dialog */}
      <Dialog open={isAddingSubcontractor} onOpenChange={setIsAddingSubcontractor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcontractor</DialogTitle>
            <DialogDescription>Fill in the details to add a new subcontractor company.</DialogDescription>
          </DialogHeader>

        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingMember?.type === 'professional' ? 'Professional' : 'Subcontractor'}</DialogTitle>
            <DialogDescription>Update the details and save.</DialogDescription>
          </DialogHeader>
          {/* CompanyProfileForm removed: editingMember form would go here */}
        </DialogContent>
      </Dialog>
      {/* TODO: Add dialogs and forms for managing team and trades here, using local state */}
    </>
  );
};

export default TeamTab; 