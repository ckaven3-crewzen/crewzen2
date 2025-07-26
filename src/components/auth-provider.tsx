'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User as AuthUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, limit, getDoc, updateDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppUser, Employee, UserRole, CompanyInfo } from '@/lib/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (credential: string, pass: string) => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const signIn = async (credential: string, pass: string): Promise<AuthUser | null> => {
    let authCredential = credential;
    if (!credential.includes('@')) {
      if (/^\d+$/.test(credential)) {
        authCredential = `${credential}@crewzen.app`;
      } else {
        const formattedName = credential.toLowerCase().replace(/\s+/g, '');
        authCredential = `${formattedName}@crewzen.app`;
      }
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, authCredential, pass);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({ variant: 'destructive', title: 'Sign In Failed', description: 'Invalid credentials or user not found.' });
      return null;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem signing out.',
      });
    }
  };

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/worker-register',
    '/company-signup',
    '/marketplace',
    '/connectzen/worker/signup',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  useEffect(() => {
    if (isPublicRoute) {
      setLoading(false);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      try {
        if (!authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        let userProfile: AppUser | null = null;
        const employeeQuery = query(collection(db, 'employees'), where('authUid', '==', authUser.uid), limit(1));
        const workerProfileQuery = query(collection(db, 'workerProfiles'), where('id', '==', authUser.uid), limit(1));
        const companyQuery = query(collection(db, 'connectZenCompanies'), where('email', '==', authUser.email), limit(1));
        const supplierQueryByEmail = query(collection(db, 'suppliers'), where('email', '==', authUser.email), limit(1));
        const supplierQueryByUid = query(collection(db, 'suppliers'), where('authUid', '==', authUser.uid), limit(1));
        
        const [employeeSnapshot, workerProfileSnapshot, companySnapshot, supplierSnapshotByEmail, supplierSnapshotByUid] = await Promise.all([
          getDocs(employeeQuery),
          getDocs(workerProfileQuery),
          getDocs(companyQuery),
          getDocs(supplierQueryByEmail),
          getDocs(supplierQueryByUid),
        ]);

        let needsProfileCompletion = false;
        if (!employeeSnapshot.empty) {
          const employeeDoc = employeeSnapshot.docs[0];
          const employeeData = { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
          userProfile = {
            uid: authUser.uid,
            phoneNumber: authUser.phoneNumber ?? null,
            email: authUser.email ?? null,
            employeeId: employeeData.id,
            companyNumber: employeeData.companyNumber,
            role: employeeData.role as UserRole,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            photoUrl: employeeData.photoUrl ?? undefined,
            companyId: employeeData.companyId ?? undefined
          };
          // Check WorkerProfile completeness
          let workerProfileDoc = null;
          if (!workerProfileSnapshot.empty) {
            workerProfileDoc = workerProfileSnapshot.docs[0].data();
          }
          // Main public fields to check
          const requiredFields = ['availability', 'tradeTags', 'skills', 'yearsExperience', 'preferredRate', 'bio', 'location'];
          needsProfileCompletion = !workerProfileDoc || requiredFields.some(field => !workerProfileDoc[field] || (Array.isArray(workerProfileDoc[field]) && workerProfileDoc[field].length === 0));
        } else if (!workerProfileSnapshot.empty) {
          const workerDoc = workerProfileSnapshot.docs[0];
          const workerData = workerDoc.data();
          userProfile = {
            uid: authUser.uid,
            phoneNumber: authUser.phoneNumber ?? null,
            email: authUser.email ?? null,
            employeeId: workerDoc.id,
            companyNumber: workerData.companyNumber || '',
            role: 'employee',
            firstName: workerData.firstName,
            lastName: workerData.lastName,
            photoUrl: workerData.photoUrl ?? undefined,
            companyId: workerData.companyId ?? undefined
          };
        } else if (!companySnapshot.empty) {
          const companyDoc = companySnapshot.docs[0];
          const companyData = companyDoc.data();
          userProfile = {
            uid: authUser.uid,
            phoneNumber: authUser.phoneNumber ?? null,
            email: authUser.email ?? null,
            employeeId: companyDoc.id,
            companyNumber: companyData.companyNumber || '',
            role: 'company',
            firstName: companyData.companyName,
            lastName: '',
            photoUrl: companyData.logoUrl ?? undefined,
            companyId: companyDoc.id // For companies, the companyId is the same as the document ID
          };
        } else if (!supplierSnapshotByEmail.empty || !supplierSnapshotByUid.empty) {
          const supplierDoc = !supplierSnapshotByEmail.empty
            ? supplierSnapshotByEmail.docs[0]
            : supplierSnapshotByUid.docs[0];
          const supplierData = supplierDoc.data();
          userProfile = {
            uid: authUser.uid,
            phoneNumber: authUser.phoneNumber ?? null,
            email: authUser.email ?? null,
            employeeId: supplierDoc.id,
            companyNumber: '',
            role: 'supplier',
            firstName: supplierData.name,
            lastName: '',
            photoUrl: supplierData.logoUrl ?? undefined,
            companyId: supplierDoc.id
          };
        } else {
          // Try to find company by UID directly
          const companyDocRef = doc(db, 'connectZenCompanies', authUser.uid);
          const companyDocSnap = await getDoc(companyDocRef);
          if (companyDocSnap.exists()) {
            const companyData = companyDocSnap.data();
            userProfile = {
              uid: authUser.uid,
              phoneNumber: authUser.phoneNumber ?? null,
              email: authUser.email ?? null,
              employeeId: companyDocSnap.id,
              companyNumber: companyData.companyNumber || '',
              role: 'company',
              firstName: companyData.companyName,
              lastName: '',
              photoUrl: companyData.logoUrl ?? undefined,
              companyId: companyDocSnap.id // For companies, the companyId is the same as the document ID
            };
          }
        }

        if (userProfile) {
          console.log('User profile found:', userProfile);
          setUser(userProfile);
          // Redirect to complete profile if needed and not already there
          if (userProfile.role === 'employee' && needsProfileCompletion && pathname !== '/complete-profile') {
            router.push('/complete-profile');
            return;
          }
        } else {
          console.log('No user profile found for auth user:', authUser.uid, authUser.email);
          await firebaseSignOut(auth);
          setUser(null);
          toastRef.current({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'No profile found linked to this account. If you just signed up, please wait a moment and try again.',
          });
        }
      } catch (error) {
        console.error("Error during authentication state change:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return (
      <AuthContext.Provider value={{ user: null, loading: false, signOut, signIn }}>
        {children}
      </AuthContext.Provider>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
