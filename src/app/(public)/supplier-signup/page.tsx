'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import SupplierProfileForm from '@/app/(modules)/connectzen/suppliers/SupplierProfileForm';
import type { SupplierProfileFormValues } from '@/app/(modules)/connectzen/suppliers/SupplierProfileForm';

export default function SupplierSignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const checkForConflicts = async (values: SupplierProfileFormValues) => {
    const conflicts = [];
    const emailQuery = query(collection(db, 'suppliers'), where('email', '==', values.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      conflicts.push({ field: 'email', message: 'This email address is already registered.' });
    }
    return conflicts;
  };

  const handleSubmit = async (values: SupplierProfileFormValues) => {
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
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password || '');
      const user = userCredential.user;
      // Prepare supplier data
      const supplierData = {
        name: values.name,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        password: '',
        logoUrl: values.logoUrl || '',
        services: values.services || [],
        description: values.description || null,
        website: values.website ? values.website : null,
        location: {
          city: values.city,
          province: values.province,
          address: values.address || null,
        },
        isVerified: false,
        isPublic: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActive: Date.now(),
        authUid: user.uid,
        role: 'supplier',
      };
      await setDoc(doc(db, 'suppliers', user.uid), supplierData);
      localStorage.setItem('supplierProfile', JSON.stringify({ id: user.uid, ...supplierData }));
      toast({
        title: 'Welcome to ConnectZen!',
        description: `Your supplier profile has been registered successfully.`,
      });
      router.push('/connectzen/supplier/dashboard');
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
      <h1 className="text-3xl font-bold mb-6 text-center">Supplier Sign Up</h1>
      <SupplierProfileForm
        onSubmit={handleSubmit}
        mode="signup"
        showPassword={true}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 