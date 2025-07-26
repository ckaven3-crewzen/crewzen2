/**
 * CompanyProfileEditPage Component
 * 
 * ✅ COMPONENT STATUS: ACTIVE & FUNCTIONAL - Company profile editing interface
 * 
 * 🔧 ISSUES IDENTIFIED:
 * - Console.log statement in production code (line 42)
 * - Missing proper error boundary for network failures
 * - No validation for unsaved changes before navigation
 * - Type assertion without proper validation (line 28)
 * 
 * 🎯 UX IMPROVEMENTS NEEDED:
 * - Add "unsaved changes" warning before leaving page
 * - Better loading states (skeleton UI instead of spinner)
 * - Success feedback after save (beyond toast)
 * - Form validation feedback during typing
 * 
 * 📋 TECHNICAL IMPROVEMENTS:
 * - Remove console.log statement for production
 * - Add proper TypeScript validation for Firestore data
 * - Implement optimistic updates for better UX
 * - Add form dirty state tracking
 * 
 * 🔗 DEPENDENCIES:
 * - CompanyProfileForm component (located in src/components/)
 * - Should consider moving to module-specific location per file organization plan
 * 
 * Author: System Generated
 * Date: 2025-07-25
 * Status: Functional but needs production cleanup
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CompanyProfileForm, { CompanyProfileFormValues } from '@/components/CompanyProfileForm';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CompanyProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [initialValues, setInitialValues] = useState<Partial<CompanyProfileFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'connectZenCompanies', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // 🔧 TODO: Add proper validation instead of type assertion
          setInitialValues(docSnap.data() as CompanyProfileFormValues);
        } else {
          toast({ variant: 'destructive', title: 'Profile Not Found', description: 'Could not find your company profile.' });
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load company profile.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const handleSubmit = async (data: CompanyProfileFormValues) => {
    // 🔧 TODO: Remove console.log for production
    console.log('profile-edit/page.tsx handleSubmit', data);
    if (!user?.uid) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'connectZenCompanies', user.uid);
      const { password, confirmPassword, ...filteredData } = data;
      await setDoc(docRef, filteredData, { merge: true });
      toast({ title: 'Profile updated successfully!' });
      router.push('/connectzen/company/dashboard');
    } catch (error) {
      console.error('Error updating company profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update company profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading company profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Company Profile</h1>
      {initialValues && (
        <CompanyProfileForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          mode="edit"
          showPassword={false}
          isSaving={saving}
        />
      )}
      {saving && (
        <div className="flex items-center mt-4 text-blue-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Saving changes...</span>
        </div>
      )}
    </div>
  );
} 