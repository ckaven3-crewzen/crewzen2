'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Building, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Phone, User, MapPin, Globe, FileText, Upload, Camera } from 'lucide-react';

import { auth, db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { ConnectZenCompany } from '@/lib/types';
import CompanyProfileForm from '@/components/CompanyProfileForm';
import type { CompanyProfileFormValues } from '@/components/CompanyProfileForm';

export default function CompanySignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const checkForConflicts = async (values: CompanyProfileFormValues) => {
    const conflicts = [];
    const emailQuery = query(collection(db, 'connectZenCompanies'), where('email', '==', values.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      conflicts.push({ field: 'email', message: 'This email address is already registered.' });
    }
    const workerEmailQuery = query(collection(db, 'workerProfiles'), where('email', '==', values.email));
    const workerEmailSnapshot = await getDocs(workerEmailQuery);
    if (!workerEmailSnapshot.empty) {
      conflicts.push({ field: 'email', message: 'This email address is already registered as a worker.' });
    }
    return conflicts;
  };

  const handleSubmit = async (values: CompanyProfileFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const conflicts = await checkForConflicts(values);
      if (conflicts.length > 0) {
        const firstConflict = conflicts[0];
        setError(firstConflict.message);
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: firstConflict.message,
        });
        setIsSubmitting(false);
        return;
      }
      // Create Firebase Auth user (password is always a string)
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password || '');
      const user = userCredential.user;
      // Determine the industry field based on company type
      let industry = '';
      if (values.companyType === 'principal_contractor') {
        industry = 'Principal Contractor';
      } else if (values.companyType === 'subcontractor') {
        industry = `Subcontractor - ${values.trade}`;
      } else if (values.companyType === 'professional') {
        industry = `Professional - ${values.professionalType}`;
      }
      // Use logoUrl from values (already uploaded by CompanyProfileForm)
      const companyData = {
        companyName: values.companyName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        password: '',
        logoUrl: values.logoUrl || '',
        industry: industry,
        companySize: values.companySize,
        description: values.description || null,
        website: values.website ? values.website : null,
        location: {
          city: values.city,
          province: values.province,
          address: values.address || null,
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
        authUid: user.uid,
        role: 'company',
      };
      await setDoc(doc(db, 'connectZenCompanies', user.uid), companyData);
      localStorage.setItem('connectZenCompany', JSON.stringify({ id: user.uid, ...companyData }));
      toast({
        title: 'Welcome to ConnectZen!',
        description: `Your company ${values.companyName} has been registered successfully.`,
      });
      router.push('/connectzen/company/dashboard');
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Company Sign Up</h1>
      <CompanyProfileForm
        onSubmit={handleSubmit}
        mode="signup"
        showPassword={true}
      />
    </div>
  );
} 