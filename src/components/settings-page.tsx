'use client';

import { useState, useEffect, useRef, type ChangeEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { db, storage, auth } from '@/lib/firebase';
import { AppearanceSettings } from '@/components/appearance-settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Building, Loader2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { CompanyInfo, ConnectZenCompany } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';


export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    email: '',
    phone: '',
    logoUrl: '',
    address: '',
    ownerName: '',
  });
  const [initialLogoUrl, setInitialLogoUrl] = useState('');
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingConnectZen, setIsCreatingConnectZen] = useState(false);
  const [connectZenPassword, setConnectZenPassword] = useState('');
  const [showConnectZenDialog, setShowConnectZenDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const settingsDocRef = useCallback(() => doc(db, 'settings', 'companyInfo'), []);

  const syncConnectZenCompany = useCallback(async (info: CompanyInfo) => {
    if (!info.email || !info.name) return;
    const companyQuery = query(collection(db, 'connectZenCompanies'), where('email', '==', info.email));
    const companySnapshot = await getDocs(companyQuery);
    let companyId = '';
    if (!companySnapshot.empty) {
      companyId = companySnapshot.docs[0].id;
    } else {
      // Create a new doc with a generated ID
      companyId = info.email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
    const companyData: Omit<ConnectZenCompany, 'id'> = {
      companyName: info.name,
      contactPerson: info.ownerName || info.name,
      email: info.email,
      phone: info.phone,
      password: '',
      logoUrl: info.logoUrl || '',
      industry: 'Construction',
      companySize: 'medium',
      description: `Company from CrewZen: ${info.name}`,
      website: '',
      location: {
        city: 'Durban',
        province: 'KwaZulu-Natal',
        address: info.address || undefined,
      },
      isVerified: false,
      verificationDocuments: {
        businessRegistration: false,
        taxClearance: false,
      },
      isPublic: true,
      allowDirectContact: true,
      autoPostJobs: false,
      jobPostings: [],
      savedWorkers: [],
      hiredWorkers: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastActive: Date.now(),
    };
    await setDoc(doc(db, 'connectZenCompanies', companyId), companyData, { merge: true });
    localStorage.setItem('connectZenCompany', JSON.stringify({ id: companyId, ...companyData }));
  }, []);

  useEffect(() => {
    if (user && user.role === 'employee') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      const fetchCompanyInfo = async () => {
        try {
          let data: CompanyInfo | null = null;
          // For company users, check connectZenCompanies first
          if (user.role === 'company') {
            const connectZenDoc = await getDoc(doc(db, 'connectZenCompanies', user.uid));
            if (connectZenDoc.exists()) {
              const czData = connectZenDoc.data();
              data = {
                name: czData.companyName || '',
                email: czData.email || '',
                phone: czData.phone || '',
                logoUrl: czData.logoUrl || '',
                address: czData.location?.address || '',
                ownerName: czData.contactPerson || '',
              };
            }
          }
          // Fallback to CrewZen settings if not found
          if (!data) {
          const docSnap = await getDoc(settingsDocRef());
          if (docSnap.exists()) {
              const docData = docSnap.data();
              data = {
                name: docData.name || '',
                email: docData.email || '',
                phone: docData.phone || '',
                logoUrl: docData.logoUrl || '',
                address: docData.address || '',
                ownerName: docData.ownerName || '',
              } as CompanyInfo;
            }
          }
          if (data) {
            setCompanyInfo(data);
            setInitialLogoUrl(data.logoUrl || '');
          }
        } catch (error) {
          console.error('Error fetching company info:', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load company information.' });
        }
      };
      fetchCompanyInfo();
    }
  }, [user, toast, settingsDocRef]);

  useEffect(() => {
    if (companyInfo.email && companyInfo.name) {
      syncConnectZenCompany(companyInfo);
    }
  }, [companyInfo, syncConnectZenCompany]);

  useEffect(() => {
    if (isCameraDialogOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isCameraDialogOpen]);
  
  const uploadImage = async (dataUrl: string | undefined, path: string): Promise<string | undefined> => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
        return dataUrl;
    }

    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error(`[uploadImage] Failed to upload image to ${path}`, error);
        throw error;
    }
  };

  const scheduleSave = useCallback((updatedInfo: CompanyInfo) => {
    setIsSaving(true);
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(async () => {
      try {
        // If the logo has changed from its initial state and an old logo existed, delete it.
        if (initialLogoUrl && updatedInfo.logoUrl !== initialLogoUrl) {
            const oldLogoRef = ref(storage, initialLogoUrl);
            await deleteObject(oldLogoRef).catch(err => {
                if (err.code !== 'storage/object-not-found') console.error("Non-critical: Failed to delete old logo.", err);
            });
        }

        // Upload the new logo if it's a new data URL
        const finalLogoUrl = await uploadImage(updatedInfo.logoUrl, 'company/logo.jpg');

        const finalInfo = { ...updatedInfo, logoUrl: finalLogoUrl || '' };
        await setDoc(settingsDocRef(), finalInfo);
        
        // Important: update local state *after* successful save to prevent flicker
        setCompanyInfo(finalInfo);
        setInitialLogoUrl(finalInfo.logoUrl);
        syncConnectZenCompany(finalInfo);

      } catch (error: any) {
        console.error('Error saving company info:', error);
        let description = 'Could not save company information. Please try again.';
        if (error.code === 'storage/unauthorized') {
            description = 'Upload failed due to a permission error. This is likely a CORS configuration issue on your storage bucket.';
        }
        toast({
          variant: 'destructive',
          title: 'Error Saving Data',
          description: description,
        });
      } finally {
        setIsSaving(false);
      }
    }, 1500); // 1.5-second debounce
  }, [initialLogoUrl, settingsDocRef, toast]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedInfo = { ...companyInfo, [name]: value };
    setCompanyInfo(updatedInfo);
    scheduleSave(updatedInfo);
  };
  
  const handleLogoChange = (dataUrl: string) => {
    const updatedInfo = { ...companyInfo, logoUrl: dataUrl };
    setCompanyInfo(updatedInfo);
    scheduleSave(updatedInfo);
  }

  const captureLogo = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      handleLogoChange(dataUrl);
      setIsCameraDialogOpen(false);
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleLogoChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkConnectZenCompanyExists = async (email: string) => {
    const emailQuery = query(collection(db, 'connectZenCompanies'), where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  };

  const createConnectZenCompany = async () => {
    if (!connectZenPassword.trim() || connectZenPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (!companyInfo.name || !companyInfo.email || !companyInfo.phone) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in company name, email, and phone number.',
      });
      return;
    }

    setIsCreatingConnectZen(true);

    try {
      // Check if company already exists
      const exists = await checkConnectZenCompanyExists(companyInfo.email);
      if (exists) {
        toast({
          variant: 'destructive',
          title: 'Company Already Exists',
          description: 'A ConnectZen company with this email already exists.',
        });
        return;
      }

      // Create Firebase Auth user
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, companyInfo.email, connectZenPassword);
      const user = userCredential.user;

      // Update Firebase Auth profile with company name and logo
      await updateProfile(user, {
        displayName: companyInfo.name,
        photoURL: companyInfo.logoUrl || '',
      });

      // Create ConnectZen company profile
      const companyData: Omit<ConnectZenCompany, 'id'> & { role: string; companyTag: string } = {
        companyName: companyInfo.name,
        contactPerson: companyInfo.ownerName || companyInfo.name,
        email: companyInfo.email,
        phone: companyInfo.phone,
        password: '', // We don't store the actual password in Firestore
        logoUrl: companyInfo.logoUrl || '',
        industry: 'Construction', // Default industry
        companySize: 'medium', // Default size
        description: `Company from CrewZen: ${companyInfo.name}`,
        website: '',
        location: {
          city: 'Durban', // Default location
          province: 'KwaZulu-Natal',
          address: companyInfo.address || undefined,
        },
        isVerified: false,
        verificationDocuments: {
          businessRegistration: false,
          taxClearance: false,
        },
        isPublic: true,
        allowDirectContact: true,
        autoPostJobs: false,
        jobPostings: [],
        savedWorkers: [],
        hiredWorkers: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActive: Date.now(),
        role: 'company',
        companyTag: 'Company',
      };

      // Save to Firestore
      await setDoc(doc(db, 'connectZenCompanies', user.uid), companyData);

      // Store company data in localStorage
      localStorage.setItem('connectZenCompany', JSON.stringify({ id: user.uid, ...companyData }));

      toast({
        title: 'ConnectZen Company Created!',
        description: `Your company ${companyInfo.name} has been registered on ConnectZen.`,
      });

      setShowConnectZenDialog(false);
      setConnectZenPassword('');

      // Redirect to ConnectZen company dashboard
      router.push('/connectzen/company/dashboard');
    } catch (error: any) {
      console.error('Error creating ConnectZen company:', error);
      
      let errorMessage = 'Failed to create ConnectZen company. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: errorMessage,
      });
    } finally {
      setIsCreatingConnectZen(false);
    }
  };

  const handleSave = async (profile: CompanyInfo) => {
    if (user?.uid) {
      await setDoc(doc(db, 'companies', user.uid), profile, { merge: true });
      toast({ title: 'Company profile updated!' });
    }
  };

  if (!user || user.role === 'employee') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8" suppressHydrationWarning>
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Settings</h1>
              {isSaving && <Loader2 className="animate-spin text-muted-foreground" />}
            </div>
        </div>
        <div className="grid gap-8">
          <AppearanceSettings />

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Changes are saved automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center gap-4">
                  <Label>Company Logo</Label>
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={companyInfo.logoUrl} alt="Company Logo" />
                    <AvatarFallback className="text-4xl">
                      <Building />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2 w-full">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCameraDialogOpen(true)}>
                      <Camera className="mr-2" /> Camera
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="mr-2" /> Upload
                    </Button>
                    <Input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" name="name" value={companyInfo.name} onChange={handleInputChange} placeholder="Your Company Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Company Owner</Label>
                    <Input id="ownerName" name="ownerName" value={companyInfo.ownerName || ''} onChange={handleInputChange} placeholder="e.g. John Doe" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="address">Company Address</Label>
                    <Input id="address" name="address" value={companyInfo.address || ''} onChange={handleInputChange} placeholder="123 Main St, Anytown, 12345" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input id="email" name="email" type="email" value={companyInfo.email} onChange={handleInputChange} placeholder="contact@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Company Phone</Label>
                    <Input id="phone" name="phone" value={companyInfo.phone} onChange={handleInputChange} placeholder="+1 (123) 456-7890" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Capture Logo</DialogTitle></DialogHeader>
          <div className="relative">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                 <Alert variant="destructive" className="w-3/d/4">
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>Enable camera permissions to use this feature.</AlertDescription>
                </Alert>
              </div>
            )}
             {hasCameraPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                 <p className="text-white">Requesting camera access...</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCameraDialogOpen(false)}>Cancel</Button>
            <Button onClick={captureLogo} disabled={!hasCameraPermission}>Capture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ConnectZen Company Creation Dialog */}
      <Dialog open={showConnectZenDialog} onOpenChange={setShowConnectZenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create ConnectZen Company Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Company Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {companyInfo.name}</p>
                <p><strong>Email:</strong> {companyInfo.email}</p>
                <p><strong>Phone:</strong> {companyInfo.phone}</p>
                <p><strong>Owner:</strong> {companyInfo.ownerName || 'Not specified'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="connectZenPassword">Password for ConnectZen Account</Label>
              <Input
                id="connectZenPassword"
                type="password"
                value={connectZenPassword}
                onChange={(e) => setConnectZenPassword(e.target.value)}
                placeholder="Enter a secure password"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                This will create a new ConnectZen account using your company information.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectZenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createConnectZenCompany}
              disabled={isCreatingConnectZen || !connectZenPassword.trim() || connectZenPassword.length < 6}
            >
              {isCreatingConnectZen ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
