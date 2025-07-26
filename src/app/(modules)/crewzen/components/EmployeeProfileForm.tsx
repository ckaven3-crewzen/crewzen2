'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import {
  Trash2, FileText, Loader2
} from 'lucide-react';
import PhotoUploader from '@/components/PhotoUploader';
import DocumentsUploader, { DocumentFile } from '@/components/DocumentsUploader';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormMessage, FormDescription
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';

// Types
import type { Employee, Estate } from '@/lib/types';

// Define the schema for form validation
const employeeCreateSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  companyNumber: z.string().min(5, { message: 'Company number is required (e.g., cz-201 or cz-301).' }),
  companyId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['admin', 'supervisor', 'employee'], { required_error: "A role is required." }),
  rate: z.coerce.number().positive({ message: 'Rate must be a positive number.' }),
  idNumber: z.string().min(13, { message: 'SA ID Number must be 13 digits.' }).max(13, { message: 'SA ID Number must be 13 digits.' }),
  authUid: z.string().nullable().optional(),
  photoUrl: z.string().optional(),
  idCopyUrl: z.string().optional(),
  medicalCertificateUrl: z.string().optional(),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    storagePath: z.string(),
    type: z.string()
  })).optional(),
  isDriver: z.boolean().default(false),
  registeredEstateIds: z.array(z.string()).optional(),
  isInactive: z.boolean().default(false),
  location: z.object({
    city: z.string().optional(),
    province: z.string().optional()
  }).optional(),
  yearsExperience: z.coerce.number().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  isPublic: z.boolean().default(true),
});

const employeeEditSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  companyNumber: z.string().min(5, { message: 'Company number is required (e.g., cz-201 or cz-301).' }),
  companyId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  role: z.enum(['admin', 'supervisor', 'employee'], { required_error: "A role is required." }),
  rate: z.coerce.number().positive({ message: 'Rate must be a positive number.' }),
  idNumber: z.string().min(13, { message: 'SA ID Number must be 13 digits.' }).max(13, { message: 'SA ID Number must be 13 digits.' }),
  authUid: z.string().nullable().optional(),
  photoUrl: z.string().optional(),
  idCopyUrl: z.string().optional(),
  medicalCertificateUrl: z.string().optional(),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    storagePath: z.string(),
    type: z.string()
  })).optional(),
  isDriver: z.boolean().default(false),
  registeredEstateIds: z.array(z.string()).optional(),
  isInactive: z.boolean().default(false),
  location: z.object({
    city: z.string().optional(),
    province: z.string().optional()
  }).optional(),
  yearsExperience: z.coerce.number().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// Type for form values
export type EmployeeFormValues = z.infer<typeof employeeSchema>;

// Type for file uploads
export type SelectedFiles = {
  photo: File | null;
  idCopy: File | null;
  medicalCert: File | null;
};

// Type for capture target (for camera)
export type CaptureTarget = 'photoUrl' | 'idCopyUrl';

// Props for the component
interface EmployeeProfileFormProps {
  // Mode determines which fields to show and what behavior to use
  mode: 'employee-create' | 'employee-edit' | 'worker';

  // Initial values for editing
  initialValues?: Partial<EmployeeFormValues>;

  // Employee object for editing (contains ID and other metadata)
  employeeToEdit?: Employee | null;

  // Estates for registration
  estates?: Estate[];

  // Current user (for permissions)
  currentUser?: any;

  // Callbacks
  onSubmit: (values: EmployeeFormValues, files: SelectedFiles) => Promise<void>;
  onCancel: () => void;
  onDelete?: (employee: Employee) => void;

  // Optional props
  onboardingStep?: number;
  setOnboardingStep?: (step: number) => void;
  isSaving?: boolean;
  isDeleting?: boolean;

  // For camera functionality
  openCamera?: (target: CaptureTarget) => void;
}

/**
 * Unified Employee Profile Form
 * 
 * This component handles creating and editing employee profiles across the application.
 * It supports different modes for different contexts and preserves all functionality
 * from the original form components.
 */
const EmployeeProfileForm: React.FC<EmployeeProfileFormProps> = ({
  mode,
  initialValues,
  employeeToEdit,
  estates = [],
  currentUser,
  onSubmit,
  onCancel,
  onDelete,
  onboardingStep = 1,
  setOnboardingStep,
  isSaving = false,
  isDeleting = false,
  openCamera
}) => {
  // State for file uploads
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({
    photo: null,
    idCopy: null,
    medicalCert: null
  });

  // Track created UID for new employees
  const [createdUid, setCreatedUid] = useState<string | null>(null);

  // Get registered estate names for display
  const [registeredEstateNames, setRegisteredEstateNames] = useState<string[]>([]);

  // Track photo and ID copy URLs
  const [photoUrl, setPhotoUrl] = useState<string>(initialValues?.photoUrl || '');
  const [idCopyUrl, setIdCopyUrl] = useState<string>(initialValues?.idCopyUrl || '');

  // Track documents (certificates, etc.)
  const [documents, setDocuments] = useState<any[]>(initialValues?.documents || []);

  // Track client-side rendering
  const [isClient, setIsClient] = useState(false);

  // Indicate client-side rendering
  useEffect(() => {
    setIsClient(true);

    // Auto-generate company number for new employees
    if (mode === 'employee-create' && !initialValues?.companyNumber) {
      // Use requestAnimationFrame to ensure this runs after hydration
      const animationFrameId = requestAnimationFrame(() => {
        const defaultRole = form.getValues('role') || 'employee';
        generateCompanyNumberForRole(defaultRole as 'admin' | 'supervisor' | 'employee');
      });

      return () => cancelAnimationFrame(animationFrameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize form with default values
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(mode === 'employee-edit' ? employeeEditSchema : employeeCreateSchema),
    defaultValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      companyNumber: initialValues?.companyNumber || '',
      companyId: initialValues?.companyId || (currentUser?.role === 'company' ? currentUser.uid : ''),
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      password: initialValues?.password || '',
      role: initialValues?.role || 'employee',
      rate: initialValues?.rate || 0,
      idNumber: initialValues?.idNumber || '',
      authUid: initialValues?.authUid || null,
      photoUrl: initialValues?.photoUrl || '',
      idCopyUrl: initialValues?.idCopyUrl || '',
      medicalCertificateUrl: initialValues?.medicalCertificateUrl || '',
      documents: initialValues?.documents || [],
      isDriver: initialValues?.isDriver || false,
      registeredEstateIds: initialValues?.registeredEstateIds || [],
      isInactive: initialValues?.isInactive || false,
      location: initialValues?.location || { city: '', province: '' },
      yearsExperience: initialValues?.yearsExperience || 0,
      skills: initialValues?.skills || [],
      bio: initialValues?.bio || '',
      isPublic: initialValues?.isPublic !== false, // Default to true
    }
  });

  // Auto-generate company number for new employees
  useEffect(() => {
    // Only run on client-side to avoid hydration mismatch
    // Use requestAnimationFrame to ensure this runs after initial render
    if (typeof window !== 'undefined') {
      const animationFrameId = requestAnimationFrame(() => {
        if (mode === 'employee-create' && !initialValues?.companyNumber) {
          // Use a stable ID for development to avoid hydration issues
          const defaultRole = form.getValues('role') || 'employee';

          // Use a stable number during development to avoid hydration issues
          const stableNum = '42'; // Always use a stable number to avoid hydration issues

          let prefix;
          if (defaultRole === 'admin') {
            prefix = 'cz-1';
          } else if (defaultRole === 'supervisor') {
            prefix = 'cz-2';
          } else {
            prefix = 'cz-3';
          }

          form.setValue('companyNumber', `${prefix}${stableNum}`);
        }
      });

      return () => cancelAnimationFrame(animationFrameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update registered estate names when estates or form values change
  useEffect(() => {
    const estateIds = form.getValues('registeredEstateIds') || [];
    const names = estateIds
      .map(id => estates.find(e => e.id === id)?.name || '')
      .filter(Boolean);
    setRegisteredEstateNames(names);
  }, [estates, form]);

  // Handle file changes
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof SelectedFiles
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFiles(prev => ({
      ...prev,
      [type]: file
    }));

    // Create a preview URL for the UI
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        // Map file types to form field names
        const fieldMap: Record<keyof SelectedFiles, keyof EmployeeFormValues> = {
          photo: 'photoUrl',
          idCopy: 'idCopyUrl',
          medicalCert: 'medicalCertificateUrl'
        };

        const result = reader.result as string;
        form.setValue(fieldMap[type], result);

        // Update state variables
        if (type === 'photo') {
          setPhotoUrl(result);
        } else if (type === 'idCopy') {
          setIdCopyUrl(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle removing images
  const handleRemoveImage = (field: keyof EmployeeFormValues) => {
    form.setValue(field, '');

    // Map form field names to file types
    const fileMap: Record<string, keyof SelectedFiles> = {
      photoUrl: 'photo',
      idCopyUrl: 'idCopy',
      medicalCertificateUrl: 'medicalCert'
    };

    if (field in fileMap) {
      setSelectedFiles(prev => ({
        ...prev,
        [fileMap[field]]: null
      }));

      // Update state variables
      if (field === 'photoUrl') {
        setPhotoUrl('');
      } else if (field === 'idCopyUrl') {
        setIdCopyUrl('');
      }
    }
  };

  // Generate company number based on role
  const generateCompanyNumberForRole = (role: 'admin' | 'supervisor' | 'employee') => {
    // Only run on client-side to avoid hydration mismatch
    if (isClient) {
      // Generate prefix based on role level
      let prefix;
      if (role === 'admin') {
        prefix = 'cz-1';
      } else if (role === 'supervisor') {
        prefix = 'cz-2';
      } else {
        prefix = 'cz-3';
      }

      // Use a stable number to avoid hydration issues
      const stableNum = '42';

      // Use setTimeout to ensure this runs after the current render cycle
      setTimeout(() => {
        form.setValue('companyNumber', `${prefix}${stableNum}`);
      }, 0);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: EmployeeFormValues) => {
    // Include documents in the form values
    values.documents = documents;
    await onSubmit(values, selectedFiles);
  };

  // Handle next step in onboarding
  const handleNextStep = () => {
    if (setOnboardingStep && onboardingStep < 2) {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  // Handle previous step in onboarding
  const handlePrevStep = () => {
    if (setOnboardingStep && onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Determine which fields to show based on mode
  const showField = (field: keyof EmployeeFormValues | string) => {
    if (mode === 'worker') {
      // Hide employee-specific fields for workers
      return !['companyNumber', 'companyId', 'role', 'registeredEstateIds', 'isInactive'].includes(field);
    }

    if (mode === 'employee-create' || mode === 'employee-edit') {
      // Hide worker-specific fields for employees
      return !['location', 'yearsExperience', 'skills', 'bio', 'isPublic'].includes(field);
    }

    return true;
  };

  // Determine if a field should be disabled
  const isFieldDisabled = (field: string): boolean => {
    // Company number is auto-generated for new employees
    if (field === 'companyNumber' && mode === 'employee-create') {
      return true;
    }

    // Company ID is fixed for company users
    if (field === 'companyId' && currentUser?.role === 'company') {
      return true;
    }

    // Auth UID is read-only
    if (field === 'authUid') {
      return true;
    }

    return false;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Step 1: Basic Information (or all fields for editing) */}
        {(mode === 'employee-edit' || mode === 'worker' || onboardingStep === 1) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Only show company fields for employees */}
            {showField('companyNumber') && (
              <FormField
                control={form.control}
                name="companyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. cz-201 or cz-301"
                        {...field}
                        disabled={isFieldDisabled('companyNumber')}
                      />
                    </FormControl>
                    {mode === 'employee-create' && (
                      <FormDescription>
                        Auto-generated based on role. Level 2 (Supervisor): cz-2xx, Level 3 (Employee): cz-3xx
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showField('companyId') && currentUser?.role === 'company' && (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isFieldDisabled('companyId')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showField('role') && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        setTimeout(() => {
                          generateCompanyNumberForRole(value as 'admin' | 'supervisor' | 'employee');
                        }, 0);
                      }}
                      value={field.value}
                      disabled={currentUser?.role === 'supervisor' && !employeeToEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'company') && (
                          <SelectItem value="supervisor">Supervisor (Level 2)</SelectItem>
                        )}
                        <SelectItem value="employee">Employee (Level 3)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+27821234567" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="employee@example.com" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Only show password field for new employees */}
            {mode === 'employee-create' && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Password for this employee's login (min 6 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Employment Details */}
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Per Day Rate (R)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="250" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SA ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="8501015800080" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Worker-specific fields */}
            {showField('location') && (
              <>
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Province" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {showField('yearsExperience') && (
              <FormField
                control={form.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Experience</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Years Experience" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showField('bio') && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input placeholder="Short bio" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Additional fields for editing */}
            {mode === 'employee-edit' && employeeToEdit?.authUid && (
              <FormField
                control={form.control}
                name="authUid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firebase Auth User ID</FormLabel>
                    <FormDescription>This employee has an existing Firebase Auth account.</FormDescription>
                    <FormControl>
                      <Input placeholder="Auth UID" {...field} value={field.value || ''} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Registered Estates for editing */}
            {mode === 'employee-edit' && employeeToEdit && (
              <div className="space-y-2 col-span-2">
                <FormLabel>Registered At</FormLabel>
                <div className="flex flex-wrap gap-2 rounded-lg border p-2 min-h-[40px]">
                  {registeredEstateNames.length > 0 ? registeredEstateNames.map(name => (
                    <Badge key={name} variant="secondary">{name}</Badge>
                  )) : <p className="text-sm text-muted-foreground p-1">No registrations yet.</p>}
                </div>
              </div>
            )}

            {/* Status toggles for editing */}
            {mode === 'employee-edit' && (
              <>
                <FormField
                  control={form.control}
                  name="isDriver"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Driver</FormLabel>
                        <FormDescription>
                          Mark this employee as a driver
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === true}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isInactive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Inactive</FormLabel>
                        <FormDescription>
                          Mark this employee as inactive
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === true}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Public profile toggle for workers */}
            {showField('isPublic') && (
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel>Public Profile</FormLabel>
                      <FormDescription>
                        Show profile in the public marketplace
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === true}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* PhotoUploader and DocumentsUploader for both create (step 2) and edit modes */}
        {(mode === 'employee-create' && onboardingStep === 2) || mode === 'employee-edit' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employee Photo */}
              <div className="space-y-2">
                <FormLabel>Employee Photo</FormLabel>
                <div className="w-full bg-muted rounded-md flex flex-col items-center justify-center overflow-hidden p-4">
                  {photoUrl ? (
                    <div className="mb-4">
                      <img
                        src={photoUrl}
                        alt="Profile Preview"
                        className="w-24 h-24 object-cover rounded-full border"
                      />
                    </div>
                  ) : null}

                  <PhotoUploader
                    storagePath={(imageId) => `users/${employeeToEdit?.id || createdUid || 'temp'}/profile.jpg`}
                    onUploadComplete={(url) => {
                      setPhotoUrl(url);
                      form.setValue('photoUrl', url);
                      setSelectedFiles(prev => ({
                        ...prev,
                        photo: null // Clear the file since we're using the URL directly
                      }));
                    }}
                    disabled={isSaving}
                  />

                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive mt-2"
                      onClick={() => handleRemoveImage('photoUrl')}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* ID Copy */}
              <div className="space-y-2">
                <FormLabel>ID Copy</FormLabel>
                <div className="w-full bg-muted rounded-md flex flex-col items-center justify-center overflow-hidden p-4">
                  {idCopyUrl && (
                    <div className="mb-4 text-center">
                      <img
                        src={idCopyUrl}
                        alt="ID Copy"
                        className="max-h-32 max-w-full object-contain border rounded"
                      />
                    </div>
                  )}

                  <PhotoUploader
                    storagePath={(imageId) => `users/${employeeToEdit?.id || createdUid || 'temp'}/id-copy.jpg`}
                    onUploadComplete={(url) => {
                      setIdCopyUrl(url);
                      form.setValue('idCopyUrl', url);
                      setSelectedFiles(prev => ({
                        ...prev,
                        idCopy: null // Clear the file since we're using the URL directly
                      }));
                    }}
                    disabled={isSaving}
                  />

                  {idCopyUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive mt-2"
                      onClick={() => handleRemoveImage('idCopyUrl')}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove ID Copy
                    </Button>
                  )}
                </div>
              </div>

              {/* Documents Section (Certificates, etc.) */}
              <div className="space-y-2 col-span-2">
                <FormLabel>Documents & Certifications</FormLabel>
                <div className="w-full bg-muted rounded-md p-4">
                  <DocumentsUploader
                    workerId={employeeToEdit?.id || createdUid || 'temp'}
                    documents={documents}
                    onDocumentsChange={(newDocs) => {
                      setDocuments(newDocs);
                      form.setValue('documents', newDocs);
                    }}
                    editable={!isSaving}
                  />
                </div>
                <FormDescription>
                  Upload medical certificates, first aid certifications, forklift licenses, or other relevant documents.
                </FormDescription>
              </div>
            </div>
          </div>
        ) : null}

        {/* DocumentsUploader for edit mode only - removed to prevent duplicate */}

        {/* Form Actions */}
        <div className="flex justify-between mt-6">
          {/* Left side buttons */}
          <div className="flex gap-2">
            {/* Cancel button */}
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>

            {/* Delete button (only for editing) */}
            {mode === 'employee-edit' && employeeToEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(employeeToEdit)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </Button>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex gap-2">
            {/* Previous step button (only for onboarding) */}
            {mode === 'employee-create' && onboardingStep > 1 && setOnboardingStep && (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                Previous
              </Button>
            )}

            {/* Next step button (only for onboarding step 1) */}
            {mode === 'employee-create' && onboardingStep === 1 && setOnboardingStep && (
              <Button type="submit" disabled={isSaving}>
                Next: Upload Documents
              </Button>
            )}

            {/* Finish button (only for onboarding step 2) */}
            {mode === 'employee-create' && onboardingStep === 2 && (
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish Onboarding
              </Button>
            )}

            {/* Save button (for editing) */}
            {(mode === 'employee-edit' || mode === 'worker') && (
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeProfileForm;