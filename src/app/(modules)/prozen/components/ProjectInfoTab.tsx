/**
 * ProjectInfoTab Component
 *
 * This component displays and allows editing of basic project information.
 *
 * Features:
 * - View and edit project name, address, status, estate, and principal contractor
 * - Fetches dropdown data for estates and contractors
 *
 * Props:
 *   - setProject: Function to update project state
 *   - projectId: Project ID string
 *   - toast: Toast notification handler
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { updateDoc, doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';


/**
 * Props for ProjectInfoTab
 * @property {(updater: any) => void} setProject - Function to update project state
 * @property {string} projectId - Project ID
 * @property {any} toast - Toast notification handler
 */
interface ProjectInfoTabProps {
  setProject: (updater: any) => void;
  projectId: string;
  toast: any;
}

/**
 * ProjectInfoTab component for viewing and editing project info.
 * @param {ProjectInfoTabProps} props
 */
const ProjectInfoTab: React.FC<ProjectInfoTabProps> = ({
  setProject,
  projectId,
  toast,
}) => {
  const [info, setInfo] = React.useState({
    name: '',
    address: '',
    status: 'In Progress',
    estateId: '',
    principalContractor: { companyName: '', contactName: '', phone: '', email: '' },
  });

  // Local state for dropdowns
  const [estates, setEstates] = React.useState<{ id: string; name: string }[]>([]);
  const [principalContractors, setPrincipalContractors] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (snap.exists()) {
        const data = snap.data();
        setInfo({
          name: data.name || '',
          address: data.address || '',
          status: data.status || 'In Progress',
          estateId: data.estateId || '',
          principalContractor: data.principalContractor || { companyName: '', contactName: '', phone: '', email: '' },
        });
      }
    };
    fetchProject();
  }, [projectId]);

  // Fetch dropdown data on mount
  React.useEffect(() => {
    const fetchEstates = async () => {
      const snap = await getDocs(collection(db, 'estates'));
      setEstates(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    };
    const fetchContractors = async () => {
      const snap = await getDocs(collection(db, 'principalContractors'));
      setPrincipalContractors(snap.docs.map(d => ({
        id: d.id,
        companyName: d.data().companyName,
        contactName: d.data().contactName,
        phone: d.data().phone,
        email: d.data().email,
      })));
    };
    fetchEstates();
    fetchContractors();
  }, []);

  return (
    <div className="mb-8 space-y-6">
      <h2 className="text-xl font-semibold mb-6">Project Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-2">Name</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={info.name}
            onChange={e => setInfo(i => ({ ...i, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Status</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={info.status}
            onChange={e => setInfo(i => ({ ...i, status: e.target.value }))}
          >
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-2">Address</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          value={info.address}
          onChange={e => setInfo(i => ({ ...i, address: e.target.value }))}
        />
      </div>
      <div>
        <label className="block font-medium mb-2">Estate</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={info.estateId || ''}
          onChange={e => setInfo(i => ({ ...i, estateId: e.target.value }))}
        >
          <option value="">None selected</option>
          {estates.map(estate => (
            <option key={estate.id} value={estate.id}>{estate.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Principal Contractor</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={info.principalContractor.companyName}
          onChange={e => {
            const pc = principalContractors.find(c => c.companyName === e.target.value);
            setInfo(i => ({
              ...i,
              principalContractor: pc
                ? { ...pc }
                : { companyName: e.target.value, contactName: '', phone: '', email: '' }
            }));
          }}
        >
          <option value="">Select principal contractor</option>
          {principalContractors.map(pc => (
            <option key={pc.id} value={pc.companyName}>
              {pc.companyName} ({pc.contactName})
            </option>
          ))}
          <option value="__other__">Other (add new)</option>
        </select>
        {/* If "Other" is selected, show blank fields for manual entry */}
        {info.principalContractor.companyName === '__other__' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Company Name"
              value={info.principalContractor.companyName === '__other__' ? '' : info.principalContractor.companyName}
              onChange={e => setInfo(i => ({
                ...i,
                principalContractor: {
                  ...i.principalContractor,
                  companyName: e.target.value,
                },
              }))}
            />
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Contact Name"
              value={info.principalContractor.contactName}
              onChange={e => setInfo(i => ({
                ...i,
                principalContractor: {
                  ...i.principalContractor,
                  contactName: e.target.value,
                },
              }))}
            />
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Phone"
              value={info.principalContractor.phone}
              onChange={e => setInfo(i => ({
                ...i,
                principalContractor: {
                  ...i.principalContractor,
                  phone: e.target.value,
                },
              }))}
            />
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Email"
              value={info.principalContractor.email}
              onChange={e => setInfo(i => ({
                ...i,
                principalContractor: {
                  ...i.principalContractor,
                  email: e.target.value,
                },
              }))}
            />
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          // Handle adding a new principal contractor
        }}
        variant="outline"
      >
        Add Principal Contractor
      </Button>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={false}
        onClick={async () => {
          if (!projectId) return;
          try {
            await updateDoc(doc(db, 'projects', projectId), {
              name: info.name,
              address: info.address,
              status: info.status,
              estateId: info.estateId || null,
              principalContractor: info.principalContractor,
            });
            toast({ title: 'Project info updated!' });
            setProject((p: any) => p ? { ...p, ...info } : p);
          } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update project info.' });
          }
        }}
      >
        Save
      </button>
    </div>
  );
};

export default ProjectInfoTab; 