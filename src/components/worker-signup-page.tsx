'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, getDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { User, Loader2, Building, ArrowLeft, AlertCircle, Camera, Upload, X, RotateCw, ZoomIn, ZoomOut, Plus } from 'lucide-react';

import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { WorkerSkill } from '@/lib/types';
import UnifiedProfileForm from '@/components/UnifiedProfileForm';
import { uploadFileToStorage } from '@/lib/upload';

const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).optional().or(z.literal('')),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  city: z.string().min(1, { message: 'Please select a city.' }),
  province: z.string().min(1, { message: 'Please select a province.' }),
  yearsExperience: z.coerce.number().min(0, { message: 'Years of experience must be 0 or more.' }),
  preferredRate: z.coerce.number().min(0, { message: 'Preferred rate must be 0 or more.' }),
  primarySkill: z.string().min(1, { message: 'Please select a primary skill.' }),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  bio: z.string().optional(),
  idNumber: z.string().min(13, { message: 'SA ID Number must be 13 digits.' }).max(13, { message: 'SA ID Number must be 13 digits.' }),
  idCopyUrl: z.string().optional(),
  photoUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const cities = [
  'Durban', 'Johannesburg', 'Cape Town', 'Pretoria', 'Port Elizabeth', 
  'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'
];

const provinces = [
  'KwaZulu-Natal', 'Gauteng', 'Western Cape', 'Eastern Cape', 
  'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape'
];

const skillOptions = [
  'General Labor', 'Supervision', 'Driving', 'Team Leadership',
  'Painting', 'Tiling', 'Plumbing', 'Electrical', 'Carpentry',
  'Roofing', 'Masonry', 'Welding', 'HVAC', 'Concrete Work',
  'Steel Fixing', 'Formwork', 'Scaffolding', 'Demolition'
];

// Helper to remove undefined values from an object
function removeUndefined(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

// Function to check if ID number already exists
const checkIdNumberExists = async (idNumber: string): Promise<boolean> => {
  try {
    const db = getFirestore();
    
    // Check in workers collection
    const workersQuery = query(
      collection(db, 'workers'),
      where('idNumber', '==', idNumber)
    );
    const workersSnapshot = await getDocs(workersQuery);
    
    // Check in employees collection
    const employeesQuery = query(
      collection(db, 'employees'),
      where('idNumber', '==', idNumber)
    );
    const employeesSnapshot = await getDocs(employeesQuery);
    
    // Check in connectZenCompanies collection (for company users)
    const companiesQuery = query(
      collection(db, 'connectZenCompanies'),
      where('idNumber', '==', idNumber)
    );
    const companiesSnapshot = await getDocs(companiesQuery);
    
    return !workersSnapshot.empty || !employeesSnapshot.empty || !companiesSnapshot.empty;
  } catch (error) {
    console.error('Error checking ID number:', error);
    return false; // If there's an error, allow the submission to proceed
  }
};

export default function WorkerSignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [conflictError, setConflictError] = useState<{ field: string; message: string } | null>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [cameraCaptureTarget, setCameraCaptureTarget] = useState<'idCopyUrl' | 'photoUrl' | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);
  const [createdWorkerId, setCreatedWorkerId] = useState<string | null>(null);
  const [isCreatingCrewZenAccount, setIsCreatingCrewZenAccount] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      yearsExperience: 0,
      preferredRate: 0,
      primarySkill: '',
      skillLevel: 'intermediate',
      bio: '',
      idNumber: '',
      idCopyUrl: '',
      photoUrl: '',
    },
  });

  const checkForConflicts = async (values: SignupFormValues) => {
    const conflicts = [];

    // Generate phone-based email for Firebase Auth check
    const phoneEmail = `${values.phone.replace(/\D/g, '')}@connectzen.app`;

    // Check if phone number already exists in workerProfiles
    if (values.phone) {
      const phoneQuery = query(collection(db, 'workerProfiles'), where('phone', '==', values.phone));
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        conflicts.push({ field: 'phone', message: 'This phone number is already registered.' });
      }
    }

    // Check if email already exists in workerProfiles (if provided)
    if (values.email) {
      const emailQuery = query(collection(db, 'workerProfiles'), where('email', '==', values.email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        conflicts.push({ field: 'email', message: 'This email address is already registered.' });
      }
    }

    // Check if phone number exists in employees collection
    if (values.phone) {
      const employeePhoneQuery = query(collection(db, 'employees'), where('phone', '==', values.phone));
      const employeePhoneSnapshot = await getDocs(employeePhoneQuery);
      if (!employeePhoneSnapshot.empty) {
        conflicts.push({ field: 'phone', message: 'This phone number is already registered as a CrewZen employee.' });
      }
    }

    // Check if email exists in employees collection (if provided)
    if (values.email) {
      const employeeEmailQuery = query(collection(db, 'employees'), where('email', '==', values.email));
      const employeeEmailSnapshot = await getDocs(employeeEmailQuery);
      if (!employeeEmailSnapshot.empty) {
        conflicts.push({ field: 'email', message: 'This email address is already registered as a CrewZen employee.' });
      }
    }

    return conflicts;
  };

  const uploadFileFromDataUrl = async (dataUrl: string | undefined, path: string): Promise<string | undefined> => {
    if (!dataUrl) return undefined;
    
    try {
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataUrl,
          path,
          userId: createdWorkerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.success) {
        return result.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return undefined;
    }
  };

  const handleSubmit = async (values: SignupFormValues) => {
    console.log("handleSubmit called", values);
    if (values.password !== values.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match.',
      });
      return;
    }

    setIsSubmitting(true);
    setConflictError(null);

    try {
      // Check for duplicate ID number
      const idNumberExists = await checkIdNumberExists(values.idNumber);
      if (idNumberExists) {
        toast({
          variant: 'destructive',
          title: 'ID Number Already Exists',
          description: 'This SA ID Number is already registered in our system.',
        });
        setIsSubmitting(false);
        return;
      }

      // Check for conflicts
      const conflicts = await checkForConflicts(values);
      if (conflicts.length > 0) {
        setConflictError(conflicts[0]);
        setIsSubmitting(false);
        return;
      }

      // Create Auth user immediately
      const phoneEmail = `${values.phone.replace(/\D/g, '')}@connectzen.app`;
      const authEmail = values.email || phoneEmail;
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, values.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: `${values.firstName} ${values.lastName}` });

      // Clean data to remove undefined fields
      const cleanedData = Object.fromEntries(Object.entries(values).filter(([_, v]) => v !== undefined));
      
      // Create worker profile document
      await setDoc(doc(db, 'workerProfiles', user.uid), { 
        ...cleanedData, 
        availability: 'available',
        isPublic: true, // Default to public - workers can opt-out later
        allowDirectContact: true, // Allow direct contact by default
        autoAcceptJobs: false // Require manual job acceptance
      });
      
      // Store user ID for later use
      setCreatedWorkerId(user.uid);
      
      // Move to photo upload step
      setStep(2);
      
      toast({
        title: 'Account Created!',
        description: 'Your account has been created. Now please upload your photos.',
      });
      
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!createdWorkerId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No user account found. Please start over.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload files
      let uploadedIdCopyUrl = form.getValues('idCopyUrl');
      let uploadedPhotoUrl = form.getValues('photoUrl');

      // Helper to convert data URL to Blob
      function dataUrlToBlob(dataUrl: string): Blob {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      }

      if (uploadedIdCopyUrl && uploadedIdCopyUrl.startsWith('data:')) {
        const idCopyBlob = dataUrlToBlob(uploadedIdCopyUrl);
        uploadedIdCopyUrl = await uploadFileToStorage(idCopyBlob, `users/${createdWorkerId}/id-copy.jpg`);
      }
      if (uploadedPhotoUrl && uploadedPhotoUrl.startsWith('data:')) {
        const photoBlob = dataUrlToBlob(uploadedPhotoUrl);
        uploadedPhotoUrl = await uploadFileToStorage(photoBlob, `users/${createdWorkerId}/profile.jpg`);
      }

      // Update worker profile with photos
      console.log('Updating Firestore with:', { photoUrl: uploadedPhotoUrl, idCopyUrl: uploadedIdCopyUrl });
      const updates = {
        idCopyUrl: uploadedIdCopyUrl || '',
        photoUrl: uploadedPhotoUrl || '',
        updatedAt: new Date(),
      };
      await updateDoc(doc(db, 'workerProfiles', createdWorkerId), updates);

      // Sync photos to employees collection if needed
      try {
        await fetch('/api/sync-profile-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authUid: createdWorkerId,
            idCopyUrl: uploadedIdCopyUrl || '',
            photoUrl: uploadedPhotoUrl || '',
          }),
        });
      } catch (syncError) {
        console.error('Photo sync error:', syncError);
      }

      setSignupComplete(true);
      
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Failed to upload photos. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCrewZenAccount = async () => {
    console.log("handleCreateCrewZenAccount called");
    if (!createdWorkerId) return;
    
    setIsCreatingCrewZenAccount(true);
    try {
      // Get the worker profile data
      const workerDoc = await getDoc(doc(db, 'workerProfiles', createdWorkerId));
      if (!workerDoc.exists()) {
        throw new Error('Worker profile not found');
      }
      
      const workerData = workerDoc.data();
      
      // Create employee document in CrewZen
      const employeeData = {
        authUid: createdWorkerId,
        firstName: workerData.firstName,
        lastName: workerData.lastName,
        phone: workerData.phone,
        email: workerData.email,
        idNumber: workerData.idNumber || '',
        photoUrl: workerData.photoUrl || '',
        idCopyUrl: workerData.idCopyUrl || '',
        tradeTags: workerData.tradeTags || [],
        skillLevel: workerData.skillLevel,
        yearsExperience: workerData.yearsExperience,
        preferredRate: workerData.preferredRate,
        availability: 'available',
        location: workerData.location,
        bio: workerData.bio || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Mark as from ConnectZen
        source: 'connectzen',
        connectZenProfileId: createdWorkerId,
      };
      
      // Save to employees collection using Auth UID as document ID
      await setDoc(doc(db, 'employees', createdWorkerId), removeUndefined(employeeData));
      
      toast({
        title: 'CrewZen Account Created!',
        description: 'Your CrewZen employee account has been created successfully.',
      });
      
      // Redirect to CrewZen dashboard
      router.push('/crewzen/dashboard');
      
    } catch (error) {
      console.error('Error creating CrewZen account:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create CrewZen account. Please try again.',
      });
    } finally {
      setIsCreatingCrewZenAccount(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      // Step 1: Submit form to create account
      form.handleSubmit(handleSubmit)();
    } else if (step === 2) {
      // Step 2: Upload photos and complete
      handleFinalSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const openCamera = (target: 'idCopyUrl' | 'photoUrl') => {
    setCameraCaptureTarget(target);
    setIsCameraDialogOpen(true);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCameraPermission(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    if (cameraCaptureTarget) {
      form.setValue(cameraCaptureTarget, dataUrl, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      toast({
        title: 'Photo captured!',
        description: `Photo saved for ${cameraCaptureTarget}.`,
      });
    }
    setIsCameraDialogOpen(false);
    setCameraCaptureTarget(null);
    // Stop camera stream
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'idCopyUrl' | 'photoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      form.setValue(target, dataUrl, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      toast({
        title: 'File uploaded!',
        description: `File saved for ${target}.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (target: 'idCopyUrl' | 'photoUrl') => {
    form.setValue(target, '', { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  useEffect(() => {
    if (isCameraDialogOpen) {
      startCamera();
    }
  }, [isCameraDialogOpen]);

  useEffect(() => {
    if (signupComplete) {
      // Show success for 2 seconds, then redirect
      const timer = setTimeout(() => {
        router.push('/connectzen');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [signupComplete, router]);

  // Add debug log before the Create Account button
  console.log('isSubmitting', isSubmitting, 'idCopyUrl', form.watch('idCopyUrl'), 'photoUrl', form.watch('photoUrl'));

  if (signupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to ConnectZen!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your worker profile has been created successfully.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You can now access the ConnectZen marketplace to find work opportunities.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/connectzen')}
                className="w-full"
                variant="outline"
              >
                Go to ConnectZen Dashboard
              </Button>
              
              <Button 
                onClick={handleCreateCrewZenAccount}
                disabled={isCreatingCrewZenAccount}
                className="w-full"
              >
                {isCreatingCrewZenAccount && <Loader2 className="animate-spin mr-2" />}
                <Plus className="mr-2" />
                Create CrewZen Account
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Creating a CrewZen account will allow you to be hired by companies using CrewZen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Step 1: Main profile info */}
              {step === 1 && (
        <UnifiedProfileForm
          mode="worker"
          onSubmit={async (data) => {
            setIsSubmitting(true);
            setConflictError(null);
            try {
              // Check for duplicate ID number
              const idNumberExists = await checkIdNumberExists(data.idNumber);
              if (idNumberExists) {
                toast({
                  variant: 'destructive',
                  title: 'ID Number Already Exists',
                  description: 'This SA ID Number is already registered in our system.',
                });
                setIsSubmitting(false);
                return;
              }
              // Check for conflicts (reuse your existing logic if needed)
              // ...
              // Create Auth user
              if (!data.email || !data.password) {
                toast({ variant: 'destructive', title: 'Missing email or password', description: 'Email and password are required.' });
                setIsSubmitting(false);
                return;
              }
              const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
              const user = userCredential.user;
              await updateProfile(user, { displayName: `${data.firstName} ${data.lastName}` });
              // Clean data to remove undefined fields
              const cleanedData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
              // Create worker profile document
              await setDoc(doc(db, 'workerProfiles', user.uid), { 
                ...cleanedData, 
                availability: 'available',
                isPublic: true, // Default to public - workers can opt-out later
                allowDirectContact: true, // Allow direct contact by default
                autoAcceptJobs: false // Require manual job acceptance
              });
              setCreatedWorkerId(user.uid);
              setStep(2); // Move to photo upload step
              toast({ title: 'Account Created!', description: 'Your account has been created. Now please upload your photos.' });
            } catch (error: any) {
              console.error('Signup error:', error);
              let errorMessage = 'An error occurred during signup.';
              if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email address is already in use.';
              } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak.';
              } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
              }
              toast({ variant: 'destructive', title: 'Signup Failed', description: errorMessage });
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      )}
      {/* Step 2: Photo upload and finalization (keep your existing logic here) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Upload Required Photos</h3>
                    <p className="text-sm text-gray-600">
                      Please upload a clear photo of your ID and a selfie for verification.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">ID Photo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {form.watch('idCopyUrl') ? (
                          <div className="space-y-2">
                            <img 
                              src={form.watch('idCopyUrl')} 
                              alt="ID" 
                              className="w-full h-32 object-cover rounded"
                            />
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openCamera('idCopyUrl')}
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Retake
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImage('idCopyUrl')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openCamera('idCopyUrl')}
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Take Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => idInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Upload File
                              </Button>
                            </div>
                            <input
                              ref={idInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'idCopyUrl')}
                            />
                          </div>
                        )}
                      </div>
                    </div>

            {/* Photo Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Selfie</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {form.watch('photoUrl') ? (
                          <div className="space-y-2">
                            <img 
                      src={form.watch('photoUrl')} 
                              alt="Selfie" 
                              className="w-full h-32 object-cover rounded"
                            />
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                        onClick={() => openCamera('photoUrl')}
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Retake
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                        onClick={() => removeImage('photoUrl')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                        onClick={() => openCamera('photoUrl')}
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Take Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => selfieInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Upload File
                              </Button>
                            </div>
                            <input
                              ref={selfieInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                      onChange={(e) => handleFileUpload(e, 'photoUrl')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {conflictError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{conflictError.message}</AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                {step === 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="ml-auto"
                  >
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    Create Account
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={nextStep}
            disabled={isSubmitting || !form.watch('idCopyUrl') || !form.watch('photoUrl')}
                    className="ml-auto"
                  >
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    Complete Registration
                  </Button>
                )}
              </div>
    </div>
  );
} 