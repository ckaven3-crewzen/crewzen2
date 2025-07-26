"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle } from 'lucide-react';

import type { Employee, Estate } from '@/lib/types';
import EmployeeList from '@/app/(modules)/crewzen/components/EmployeeList';
import EmployeeProfileForm from '@/app/(modules)/crewzen/components/EmployeeProfileForm';

// Function to check if ID number already exists
const checkIdNumberExists = async (idNumber: string, excludeEmployeeId?: string): Promise<boolean> => {
  try {
    // Check in employees collection
    const employeesQuery = query(
      collection(db, 'employees'),
      where('idNumber', '==', idNumber)
    );
    const employeesSnapshot = await getDocs(employeesQuery);

    let hasDuplicate = false;
    if (excludeEmployeeId) {
      // Editing: only flag as duplicate if another doc (not this one) has the same idNumber
      hasDuplicate = employeesSnapshot.docs.some(doc => doc.id !== excludeEmployeeId);
    } else {
      // Creating: only flag as duplicate if any doc exists
      hasDuplicate = !employeesSnapshot.empty;
    }

    // Check in workers collection
    const workersQuery = query(
      collection(db, 'workers'),
      where('idNumber', '==', idNumber)
    );
    const workersSnapshot = await getDocs(workersQuery);

    // Check in connectZenCompanies collection (for company users)
    const companiesQuery = query(
      collection(db, 'connectZenCompanies'),
      where('idNumber', '==', idNumber)
    );
    const companiesSnapshot = await getDocs(companiesQuery);

    return hasDuplicate || !workersSnapshot.empty || !companiesSnapshot.empty;
  } catch (error) {
    console.error('Error checking ID number:', error);
    return false; // If there's an error, allow the submission to proceed
  }
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [cameraCaptureTarget, setCameraCaptureTarget] = useState<CaptureTarget | null>(null);
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Stepper state for new employee onboarding
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [createdUid, setCreatedUid] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const fetchEmployees = useCallback(async () => {
    setIsDataLoaded(false);
    try {
      let employeeSnapshot;
      
      // For ConnectZen companies, only fetch their own employees
      if (user?.role === 'company') {
        const employeesQuery = query(
          collection(db, 'employees'),
          where('companyId', '==', user.uid)
        );
        employeeSnapshot = await getDocs(employeesQuery);
      } else {
        // For Dynamic Dimensions users (admin, supervisor), fetch all employees
        employeeSnapshot = await getDocs(collection(db, 'employees'));
      }
      
      const estateSnapshot = await getDocs(collection(db, 'estates'));
      
      const employeesData = employeeSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Employee)
      );
      employeesData.sort((a, b) => (a.companyNumber || '').localeCompare(b.companyNumber || ''));
      setEmployees(employeesData);

      const estatesData = estateSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Estate)
      );
      setEstates(estatesData);

    } catch (error) {
      console.error('Error fetching data: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch employees or estates.' });
    } finally {
      setIsDataLoaded(true);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      fetchEmployees();
    }
  }, [user, fetchEmployees]);

  // Open employee dialog if employeeId is in query string
  useEffect(() => {
    const employeeId = searchParams.get('employeeId');
    if (employeeId && employees.length > 0) {
      const emp = employees.find(e => e.id === employeeId);
      if (emp) handleEditClick(emp);
    }
    // Only run when employees are loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  const handleEditClick = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEmployeeToEdit(null);
    setOnboardingStep(1);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEmployeeToEdit(null);
    setOnboardingStep(1);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      const id = employeeToDelete.id;
      // Delete photos from storage
      const deletePromises: Promise<any>[] = [];
      deletePromises.push(deleteObject(ref(storage, `users/${id}/id-copy.jpg`)).catch(e => { if (e.code !== 'storage/object-not-found') throw e; }));
      deletePromises.push(deleteObject(ref(storage, `users/${id}/profile.jpg`)).catch(e => { if (e.code !== 'storage/object-not-found') throw e; }));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'employees', id));

      if (employeeToDelete.authUid) {
        toast({ title: 'Partial Success', description: 'Employee data has been deleted. The linked Auth user must be deleted manually from the Firebase Console.' });
      } else {
        // quiet success
      }

      await fetchEmployees();
      setIsDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not delete employee.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const openCamera = (target: CaptureTarget) => {
    setCameraCaptureTarget(target);
    setIsCameraDialogOpen(true);
  };

  // Step 1: User Info & Account Creation for new employees
  const handleCreateSubmit = async (values: EmployeeFormValues, files: SelectedFiles) => {
    setIsSaving(true);
    try {
      console.log('handleCreateSubmit called, step:', onboardingStep);

      if (!values.email || !values.password) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: 'Email and password are required for new employees.'
        });
        setIsSaving(false);
        return;
      }

      // Check for duplicate ID number
      // TODO: Re-enable duplicate ID number check after onboarding/save issues are resolved.

      if (onboardingStep === 1) {
        let response;
        let result;
        try {
          response = await fetch('/api/create-employee-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: values.email,
              password: values.password,
              firstName: values.firstName,
              lastName: values.lastName,
              phone: values.phone,
              rate: values.rate,
              idNumber: values.idNumber,
              companyId: (user as any)?.companyId || user?.uid || '',
              role: values.role || 'employee',
              companyNumber: values.companyNumber
            })
          });
          if (!response.ok) {
            response = await fetch('/api/create-employee', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                rate: values.rate,
                idNumber: values.idNumber,
                companyId: (user as any)?.companyId || user?.uid || '',
                role: values.role || 'employee',
                companyNumber: values.companyNumber
              })
            });
          }
          result = await response.json();
        } catch (err) {
          toast({
            variant: 'destructive',
            title: 'Network/API Error',
            description: 'Could not reach the server. Please check your connection or try again.'
          });
          setIsSaving(false);
          return;
        }

        if (!response.ok || !result.uid) {
          toast({
            variant: 'destructive',
            title: 'Employee Creation Failed',
            description: result?.error || 'Unknown error creating employee.'
          });
          setIsSaving(false);
          return;
        }

        setCreatedUid(result.uid);
        setOnboardingStep(2);
        toast({ title: 'Step 1 Complete', description: 'User account created. Please upload required documents.' });
      } else if (onboardingStep === 2) {
        if (!createdUid) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No user ID found. Please complete Step 1 first.'
          });
          setIsSaving(false);
          return;
        }
        // Accept either a new file or an already uploaded URL for photo
        let profileImageUrl = values.photoUrl || '';
        if (!files.photo && !profileImageUrl) {
          toast({
            variant: 'destructive',
            title: 'Photo Required',
            description: 'A profile photo is required for onboarding.'
          });
          setIsSaving(false);
          return;
        }
        if (files.photo) {
          try {
            const storageRef = ref(storage, `users/${createdUid}/profile.jpg`);
            await uploadBytes(storageRef, files.photo);
            profileImageUrl = await getDownloadURL(storageRef);
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'Photo Upload Failed',
              description: 'Could not upload profile photo. Please try again.'
            });
            setIsSaving(false);
            return;
          }
        }
        // Accept either a new file or an already uploaded URL for ID copy
        let idCopyUrl = values.idCopyUrl || '';
        if (!files.idCopy && !idCopyUrl) {
          toast({
            variant: 'destructive',
            title: 'ID Copy Required',
            description: 'An ID copy is required for onboarding.'
          });
          setIsSaving(false);
          return;
        }
        if (files.idCopy) {
          try {
            const docRef = ref(storage, `users/${createdUid}/id-copy.jpg`);
            await uploadBytes(docRef, files.idCopy);
            idCopyUrl = await getDownloadURL(docRef);
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'ID Copy Upload Failed',
              description: 'Could not upload ID copy. Please try again.'
            });
            setIsSaving(false);
            return;
          }
        }
        try {
          const employeeUpdate = {
            photoUrl: profileImageUrl,
            idCopyUrl: idCopyUrl,
            onboardingComplete: true
          };
          await updateDoc(doc(db, 'employees', createdUid), employeeUpdate);
          const workerProfileUpdate = {
            photoUrl: profileImageUrl,
            idCopyUrl: idCopyUrl,
            onboardingComplete: true,
            updatedAt: Date.now(),
            availability: 'working'
          };
          await updateDoc(doc(db, 'workerProfiles', createdUid), workerProfileUpdate);
          await fetch('/api/sync-profile-photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authUid: createdUid, photoUrl: profileImageUrl, idCopyUrl: idCopyUrl })
          });
        } catch (err) {
          toast({
            variant: 'destructive',
            title: 'Profile Update Failed',
            description: 'Could not update employee profile. Please try again.'
          });
          setIsSaving(false);
          return;
        }
        await fetchEmployees();
        setIsFormOpen(false);
        setOnboardingStep(1);
        setCreatedUid(null);
        toast({ title: 'Success', description: 'Employee onboarding completed successfully!' });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create employee'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing existing employees
  const handleEditSubmit = async (values: EmployeeFormValues, files: SelectedFiles) => {
    if (!employeeToEdit) return;
    
    setIsSaving(true);
    try {
      // For existing employees, we should have both authUid and employeeToEdit.id
      const authUid = values.authUid || employeeToEdit.authUid;
      const employeeId = employeeToEdit.id;
      
      // Check for duplicate ID number (excluding current employee)
      // TODO: Re-enable duplicate ID number check after onboarding/save issues are resolved.

      // Create/update employees doc (CrewZen profile)
      let companyNumber = values.companyNumber;
      
      let profileImageUrl = values.photoUrl || '';
      let idCopyUrl = values.idCopyUrl || '';
      
      // Upload new files if selected
      if (files.photo) {
        // Upload profile image to Storage under /users/{authUid}/profile.jpg
        const storageRef = ref(storage, `users/${authUid}/profile.jpg`);
        await uploadBytes(storageRef, files.photo);
        profileImageUrl = await getDownloadURL(storageRef);
        console.log('Profile image uploaded:', profileImageUrl);
      }
      
      if (files.idCopy) {
        const docRef = ref(storage, `users/${authUid}/id-copy.jpg`);
        await uploadBytes(docRef, files.idCopy);
        idCopyUrl = await getDownloadURL(docRef);
        console.log(`ID copy uploaded:`, idCopyUrl);
      }

      const dataPayload: any = { 
        ...values, 
        companyNumber, 
        photoUrl: profileImageUrl, 
        idCopyUrl: idCopyUrl, 
        medicalCertificateUrl: values.medicalCertificateUrl 
      };
      
      // Ensure authUid is set correctly
      dataPayload.authUid = authUid;
      
      // Ensure companyId is set correctly (never undefined)
      if (user?.role === 'company') {
        dataPayload.companyId = user.uid;
      } else if (values.companyId) {
        dataPayload.companyId = values.companyId;
      } else if (employeeToEdit?.companyId) {
        dataPayload.companyId = employeeToEdit.companyId;
      }
      
      // Clean up optional fields
      dataPayload.phone = dataPayload.phone || null;
      dataPayload.email = dataPayload.email || '';
      dataPayload.idNumber = dataPayload.idNumber || null;
      dataPayload.photoUrl = dataPayload.photoUrl || null;
      dataPayload.idCopyUrl = dataPayload.idCopyUrl || null;
      dataPayload.medicalCertificateUrl = dataPayload.medicalCertificateUrl || null;
      
      const isInactive = values.isInactive;
      dataPayload.status = isInactive ? 'available' : 'unavailable';
      
      try {
        await updateDoc(doc(db, 'employees', employeeId), dataPayload);
        console.log('Employee doc updated successfully');
        
        // --- SYNC WORKER PROFILE AVAILABILITY ---
        if (authUid) {
          const workerProfileRef = doc(db, 'workerProfiles', authUid);
          const workerProfileSnap = await getDoc(workerProfileRef);
          if (workerProfileSnap.exists()) {
            let newAvailability = 'working';
            if (dataPayload.status === 'available') {
              newAvailability = 'available';
            }
            await updateDoc(workerProfileRef, { availability: newAvailability });
            console.log('Worker profile availability synced:', newAvailability);
          }
          
          // --- SYNC PROFILE PHOTOS ---
          await fetch('/api/sync-profile-photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              authUid, 
              photoUrl: dataPayload.photoUrl, 
              idCopyUrl: dataPayload.idCopyUrl 
            })
          });
        }
        
        await fetchEmployees();
        setIsFormOpen(false);
        toast({ title: 'Success', description: 'Employee updated successfully!' });
        console.log('Save complete!');
        
      } catch (error: any) {
        console.error('Employee doc error:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Employee Save Failed', 
          description: error.message || 'Could not save employee data.' 
        });
        return;
      }
      
    } catch (error: any) {
      console.error('General error in handleEditSubmit:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Save Failed', 
        description: error.message || 'Could not save employee data.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submission based on mode
  const handleFormSubmit = async (values: EmployeeFormValues, files: SelectedFiles) => {
    if (employeeToEdit) {
      await handleEditSubmit(values, files);
    } else {
      await handleCreateSubmit(values, files);
    }
  };

  if (user?.role === 'employee') {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <EmployeeList
        employees={employees}
        isLoading={!isDataLoaded}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Employee Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {employeeToEdit ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          
          <EmployeeProfileForm
            mode={employeeToEdit ? 'employee-edit' : 'employee-create'}
            initialValues={employeeToEdit || undefined}
            employeeToEdit={employeeToEdit}
            estates={estates}
            currentUser={user}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            onDelete={handleDeleteClick}
            onboardingStep={onboardingStep}
            setOnboardingStep={setOnboardingStep}
            isSaving={isSaving}
            isDeleting={isDeleting}
            openCamera={openCamera}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {employeeToDelete?.firstName} {employeeToDelete?.lastName}'s profile and all associated data.
              {employeeToDelete?.authUid && (
                <p className="mt-2 text-destructive">
                  Note: The Firebase Auth user will need to be deleted manually from the Firebase Console.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



