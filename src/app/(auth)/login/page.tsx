'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Building, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  credential: z.string().min(1, { message: 'Company Number or Full Name is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { credential: '', password: '' },
  });

  const signIn = async (credential: string, password: string) => {
    try {
      // First try to find by company number in connectZenCompanies
      const companyQuery = query(collection(db, 'connectZenCompanies'), where('companyNumber', '==', credential));
      const companySnapshot = await getDocs(companyQuery);
      
      if (!companySnapshot.empty) {
        const companyDoc = companySnapshot.docs[0];
        const companyData = companyDoc.data();
        
        // Try to sign in with the company's email
        const userCredential = await signInWithEmailAndPassword(auth, companyData.email, password);
        
        // Store company data in localStorage
        localStorage.setItem('connectZenCompany', JSON.stringify({ id: companyDoc.id, ...companyData }));
        
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${companyData.companyName}`,
        });
        
        router.push('/connectzen/company/dashboard');
        return userCredential.user;
      }
      
      // If not found as company, try as worker
      // First try to find by fullName (for backward compatibility)
      let workerQuery = query(collection(db, 'workerProfiles'), where('fullName', '==', credential));
      let workerSnapshot = await getDocs(workerQuery);
      
      // If not found by fullName, try by firstName + lastName combination
      if (workerSnapshot.empty) {
        // Split the credential into first and last name
        const nameParts = credential.trim().split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' '); // Handle multiple last names
          
          // Try to find by firstName and lastName
          workerQuery = query(
            collection(db, 'workerProfiles'), 
            where('firstName', '==', firstName),
            where('lastName', '==', lastName)
          );
          workerSnapshot = await getDocs(workerQuery);
        }
      }
      
      if (!workerSnapshot.empty) {
        const workerDoc = workerSnapshot.docs[0];
        const workerData = workerDoc.data();
        
        // Try to sign in with the worker's email
        const userCredential = await signInWithEmailAndPassword(auth, workerData.email, password);
        
        // Store worker data in localStorage
        localStorage.setItem('workerProfile', JSON.stringify({ id: workerDoc.id, ...workerData }));
        
        // Display the worker's name (handle both formats)
        const displayName = workerData.fullName || `${workerData.firstName} ${workerData.lastName}`;
        
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${displayName}`,
        });
        
        router.push('/crewzen/dashboard');
        return userCredential.user;
      }

      // If not found as company or worker, try as supplier (by email)
      const supplierQuery = query(collection(db, 'suppliers'), where('email', '==', credential));
      const supplierSnapshot = await getDocs(supplierQuery);
      if (!supplierSnapshot.empty) {
        const supplierDoc = supplierSnapshot.docs[0];
        const supplierData = supplierDoc.data();
        // Try to sign in with the supplier's email
        const userCredential = await signInWithEmailAndPassword(auth, supplierData.email, password);
        // Store supplier data in localStorage
        localStorage.setItem('supplierProfile', JSON.stringify({ id: supplierDoc.id, ...supplierData }));
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${supplierData.name}`,
        });
        router.push('/connectzen/suppliers/dashboard');
        return userCredential.user;
      }

      // If not found, try direct email login
      const userCredential = await signInWithEmailAndPassword(auth, credential, password);
      
      toast({
        title: 'Welcome back!',
        description: 'Signed in successfully',
      });
      
      router.push('/crewzen/dashboard');
      return userCredential.user;
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with these credentials.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
      
      return null;
    }
  };

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    await signIn(values.credential, values.password);
    setIsSubmitting(false);
  };

  // Add sign-out button logic
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.clear();
      toast({ title: 'Signed out', description: 'You have been signed out.' });
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'Could not sign out.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/* Sign Out Button (top right) */}
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
      >
        Sign Out
      </button>
      <div className="w-full max-w-sm p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Building className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">CrewZen</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credential"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Number or Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 301 or John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">New worker?</span>
          <a
            href="/worker-register"
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            Sign up as a worker
          </a>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-500">New company?</span>
          <a
            href="/company-signup"
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            Sign up as a company
          </a>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-500">New supplier?</span>
          <a
            href="/supplier-signup"
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            Sign up as a supplier
          </a>
        </div>
      </div>
    </div>
  );
} 