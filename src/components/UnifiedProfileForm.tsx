/**
 * UNIFIED PROFILE FORM - NEEDS REFACTORING
 * 
 * ⚠️ CURRENT ISSUES TO FIX:
 * 1. TypeScript errors with form control types (TFieldValues incompatibility)
 * 2. yearsExperience type mismatch (string | number vs number)
 * 3. Missing proper type constraints for form submission
 * 4. No photo upload functionality (unlike EmployeeProfileForm)
 * 5. Basic skills input vs advanced EmployeeProfileForm features
 * 6. No document management capabilities
 * 7. Inconsistent validation schemas
 * 
 * 🔧 SUGGESTED IMPROVEMENTS:
 * - Fix TypeScript type issues
 * - Add PhotoUploader component integration
 * - Standardize with EmployeeProfileForm validation
 * - Add proper file upload handling
 * - Improve error handling and user feedback
 * - Consider adding Switch components for better UX
 * 
 * 📝 NOTES:
 * - This form is simpler by design for ConnectZen worker registration
 * - EmployeeProfileForm is more comprehensive for CrewZen employee management
 * - Both forms should coexist but share common patterns
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UnifiedProfile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Select from 'react-select';
import { Select as ShadcnSelect, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// Define a Zod schema for validation (adjust as needed)
// 🔧 TODO: Fix validation schema to match EmployeeProfileForm patterns
// 🔧 TODO: Add proper type constraints for better TypeScript support
const unifiedProfileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  phone: z.string().min(10, { message: 'Phone is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
  companyNumber: z.string().optional(),
  companyId: z.string().optional(),
  role: z.enum(['supervisor', 'employee', 'worker']).optional(),
  rate: z.coerce.number().optional(),
  idNumber: z.string().min(13, { message: 'SA ID Number must be 13 digits.' }).max(13, { message: 'SA ID Number must be 13 digits.' }),
  photoUrl: z.string().optional(),
  idCopyUrl: z.string().optional(),
  location: z.object({ city: z.string(), province: z.string() }).optional(),
  // 🚨 BUG: This causes TypeScript error - should be z.number().optional() not coerced to string
  yearsExperience: z.coerce.number().optional(), // TODO: Fix type mismatch
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  medicalCertificateUrl: z.string().optional(),
  isDriver: z.boolean().optional(),
  registeredEstateIds: z.array(z.string()).optional(),
  isInactive: z.boolean().optional(),
  isPublic: z.boolean().default(true),
});

type UnifiedProfileFormValues = z.infer<typeof unifiedProfileSchema>;

interface UnifiedProfileFormProps {
  mode: 'employee' | 'worker';
  onSubmit: (data: UnifiedProfileFormValues) => void;
  initialValues?: Partial<UnifiedProfileFormValues>;
}

// 🔧 TODO: Add these missing features from EmployeeProfileForm:
// - PhotoUploader integration for profile pictures
// - DocumentsUploader for certificates and documents  
// - Multi-step workflow support
// - Advanced validation and error handling
// - Auto-generation of company numbers
// - Estate registration management
// - Status management (isDriver, isInactive toggles)

// Helper to detect dark mode
const isDarkMode = () =>
  (typeof window !== 'undefined' &&
    (window.document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches));

// Utility to clean undefined optional fields (convert to null), but preserve required fields and structure
function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = { ...obj };
  const optionalFields = [
    'companyNumber', 'companyId', 'email', 'password', 'role', 'rate', 'photoUrl', 'idCopyUrl',
    'location', 'yearsExperience', 'skills', 'bio', 'medicalCertificateUrl', 'isDriver',
    'registeredEstateIds', 'isInactive',
  ];
  for (const key of optionalFields) {
    if (cleaned[key] === undefined) {
      // Set safe defaults for each type
      if (key === 'skills' || key === 'registeredEstateIds') cleaned[key] = [];
      else if (key === 'isDriver' || key === 'isInactive') cleaned[key] = false;
      else if (key === 'rate' || key === 'yearsExperience') cleaned[key] = '';
      else if (key === 'location') cleaned[key] = { city: '', province: '' };
      else cleaned[key] = '';
    }
  }
  // For nested location
  if (!cleaned.location) {
    cleaned.location = { city: '', province: '' };
  } else {
    cleaned.location.city = cleaned.location.city ?? '';
    cleaned.location.province = cleaned.location.province ?? '';
  }
  return cleaned as T;
}

const UnifiedProfileForm: React.FC<UnifiedProfileFormProps> = ({ mode, onSubmit, initialValues }) => {
  const form = useForm<UnifiedProfileFormValues>({
    resolver: zodResolver(unifiedProfileSchema),
    defaultValues: {
      firstName: initialValues?.firstName ?? '',
      lastName: initialValues?.lastName ?? '',
      phone: initialValues?.phone ?? '',
      email: initialValues?.email ?? '',
      password: initialValues?.password ?? '',
      companyNumber: initialValues?.companyNumber ?? '',
      companyId: initialValues?.companyId ?? '',
      role: initialValues?.role ?? undefined,
      rate: initialValues?.rate ?? undefined,
      idNumber: initialValues?.idNumber ?? '',
      photoUrl: initialValues?.photoUrl ?? '',
      idCopyUrl: initialValues?.idCopyUrl ?? '',
      location: initialValues?.location ?? { city: '', province: '' },
      yearsExperience: initialValues?.yearsExperience !== undefined && initialValues?.yearsExperience !== null ? Number(initialValues.yearsExperience) : '',
      skills: initialValues?.skills ?? [],
      bio: initialValues?.bio ?? '',
      medicalCertificateUrl: initialValues?.medicalCertificateUrl ?? '',
      isDriver: initialValues?.isDriver ?? false,
      registeredEstateIds: initialValues?.registeredEstateIds ?? [],
      isInactive: initialValues?.isInactive ?? false,
      isPublic: initialValues?.isPublic ?? true,
    },
  });

  const [trades, setTrades] = useState<string[]>([]);
  const [customTrade, setCustomTrade] = useState('');

  const isEdit = !!initialValues?.role;

  useEffect(() => {
    // Fetch trades from Firestore
    const fetchTrades = async () => {
      try {
        const db = getFirestore();
        const tradesSnapshot = await getDocs(collection(db, 'trades'));
        const tradesList = tradesSnapshot.docs.map(doc => doc.data().name);
        setTrades(tradesList);
      } catch (error) {
        setTrades([]);
      }
    };
    fetchTrades();
  }, []);

  // Helper to decide which fields to show based on mode
  const showField = (field: string) => {
    if (mode === 'employee') {
      return !['location', 'yearsExperience', 'skills', 'bio'].includes(field);
    }
    if (mode === 'worker') {
      return !['companyNumber', 'companyId', 'role', 'registeredEstateIds', 'isInactive'].includes(field);
    }
    return true;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => {
        // Always ensure required fields are present
        const cleaned = cleanFirestoreData(data);
        onSubmit(cleaned);
      })} className="space-y-4">
        {/* Always show name and phone fields */}
        <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} placeholder="First Name" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} placeholder="Last Name" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} placeholder="Phone" /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Email and password (optional for worker) */}
        {showField('email') && (
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} placeholder="Email" /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {showField('password') && (
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} placeholder="Password" /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {/* Company fields (employee only) */}
        {showField('companyNumber') && (
          <FormField control={form.control} name="companyNumber" render={({ field }) => (
            <FormItem><FormLabel>Company Number</FormLabel><FormControl><Input {...field} disabled={!initialValues?.role} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {showField('companyId') && (
          <FormField control={form.control} name="companyId" render={({ field }) => (
            <FormItem><FormLabel>Company ID</FormLabel><FormControl><Input {...field} disabled={!initialValues?.role} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {showField('role') && (
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <ShadcnSelect
                  value={field.value || 'employee'}
                  onValueChange={field.onChange}
                  disabled={!isEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </ShadcnSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}
        {/* Worker fields (worker only) */}
        {showField('location') && (
          <FormField control={form.control} name="location.city" render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} placeholder="City" /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {showField('location') && (
          <FormField control={form.control} name="location.province" render={({ field }) => (
            <FormItem><FormLabel>Province</FormLabel><FormControl><Input {...field} placeholder="Province" /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {showField('yearsExperience') && (
          <FormField control={form.control} name="yearsExperience" render={({ field }) => (
            <FormItem><FormLabel>Years Experience</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} placeholder="Years Experience" /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {/* Skills/Trade dropdown for workers */}
        {showField('skills') && mode === 'worker' && (
          <FormField control={form.control} name="skills" render={({ field }) => (
            <FormItem>
              <FormLabel>Trade(s)</FormLabel>
              <FormControl>
                <div>
                  <Select
                    isMulti
                    options={trades.map(trade => ({ value: trade, label: trade }))}
                    value={(field.value || []).map((trade: string) => ({ value: trade, label: trade }))}
                    onChange={selected => {
                      field.onChange(selected.map(option => option.value));
                    }}
                    classNamePrefix="react-select"
                    placeholder="Select or type to search..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--input)',
                        borderRadius: 6,
                        minHeight: '40px',
                        boxShadow: state.isFocused ? '0 0 0 2px var(--ring)' : base.boxShadow,
                        '&:hover': { borderColor: 'var(--input)' },
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        backgroundColor: isDarkMode() ? '#18181b' : '#fff',
                        border: '1px solid var(--input)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: 'var(--muted)',
                        borderRadius: 4,
                        color: 'var(--foreground)',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: 'var(--foreground)',
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: 'var(--muted-foreground)',
                        ':hover': { backgroundColor: 'var(--muted)', color: 'var(--destructive)' },
                      }),
                      placeholder: (base) => ({ ...base, color: 'var(--muted-foreground)' }),
                      input: (base) => ({ ...base, color: 'var(--foreground)' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'var(--accent)' : (isDarkMode() ? '#18181b' : '#fff'),
                        color: 'var(--foreground)',
                      }),
                    }}
                  />
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={customTrade}
                      onChange={e => setCustomTrade(e.target.value)}
                      placeholder="Add custom trade"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (customTrade && !trades.includes(customTrade)) {
                          setTrades([...trades, customTrade]);
                        }
                        if (customTrade && (!field.value || !field.value.includes(customTrade))) {
                          field.onChange([...(field.value || []), customTrade]);
                        }
                        setCustomTrade('');
                      }}
                    >Add</Button>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}
        {showField('bio') && (
          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem><FormLabel>Bio</FormLabel><FormControl><Input {...field} placeholder="Bio" /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {/* Common fields */}
        <FormField control={form.control} name="idNumber" render={({ field }) => (
          <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input {...field} placeholder="ID Number" /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Add more fields as needed, using showField to control visibility */}
        <FormField control={form.control} name="isPublic" render={({ field }) => (
          <FormItem>
            <FormControl>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                <span>Show my profile in the public marketplace</span>
              </label>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default UnifiedProfileForm;