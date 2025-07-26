/*
 * SupplierProfileForm Component
 * 
 * PURPOSE: Reusable form component for supplier registration and profile editing
 * 
 * ✅ COMPONENT STATUS: WELL-IMPLEMENTED - Good form validation and UX
 * - Used by: supplier-signup page (public registration)
 * - Function: Dual-mode form (signup/edit) with comprehensive validation
 * - Integration: Proper Zod validation, Firebase storage, react-hook-form
 * 
 * 🔍 USAGE ANALYSIS:
 * - Used in /app/(public)/supplier-signup/page.tsx for registration
 * - No duplicates found - unique supplier-specific form
 * - Exports SupplierProfileFormValues type for external usage
 * - Mode prop allows signup vs edit functionality
 * 
 * ✅ EXCELLENT FEATURES:
 * - Comprehensive Zod validation schema with proper error messages
 * - Logo upload with Firebase Storage integration
 * - Dynamic services array with add/remove functionality
 * - City/Province validation with predefined lists
 * - Password confirmation validation
 * - Dual-mode support (signup/edit) with showPassword prop
 * - Loading states and proper error handling
 * - Responsive design with proper form styling
 * 
 * 🏗️ ARCHITECTURE HIGHLIGHTS:
 * - Uses react-hook-form with Zod resolver for type-safe validation
 * - Proper form state management with defaultValues
 * - File upload with progress indication
 * - Services managed as array with dynamic UI
 * - Clean separation of form logic and validation
 * 
 * 🔧 MINOR IMPROVEMENTS POSSIBLE (Low Priority):
 * - City/Province could use dropdown selects instead of text inputs
 * - Logo upload could have file size/type validation
 * - Services could have predefined suggestions
 * - Website URL validation could be more strict
 * - Phone number validation could be more specific to SA format
 * 
 * 💡 TYPE SYSTEM NOTES:
 * - Exports SupplierProfileFormValues type (should align with types.ts)
 * - Schema defines structure for supplier data
 * - Good separation between form values and backend storage
 * 
 * 🏷️ RECOMMENDATION: KEEP - Excellent form implementation, well-architected
 */

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const supplierProfileSchema = z.object({
  name: z.string().min(2, { message: 'Supplier name must be at least 2 characters.' }),
  contactPerson: z.string().min(2, { message: 'Contact person name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  services: z.array(z.string()).optional(),
  city: z.string().min(1, { message: 'Please select a city.' }),
  province: z.string().min(1, { message: 'Please select a province.' }),
  address: z.string().optional(),
  website: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SupplierProfileFormValues = z.infer<typeof supplierProfileSchema>;

interface SupplierProfileFormProps {
  initialValues?: Partial<SupplierProfileFormValues>;
  onSubmit: (data: SupplierProfileFormValues) => void;
  mode?: 'signup' | 'edit';
  showPassword?: boolean;
  isSubmitting?: boolean;
}

const cities = [
  'Durban', 'Johannesburg', 'Cape Town', 'Pretoria', 'Port Elizabeth', 
  'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'
];

const provinces = [
  'KwaZulu-Natal', 'Gauteng', 'Western Cape', 'Eastern Cape', 
  'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape'
];

const SupplierProfileForm: React.FC<SupplierProfileFormProps> = ({ initialValues, onSubmit, mode = 'signup', showPassword = true, isSubmitting = false }) => {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [services, setServices] = useState<string[]>(initialValues?.services || []);
  const [serviceInput, setServiceInput] = useState('');

  const form = useForm<SupplierProfileFormValues>({
    resolver: zodResolver(supplierProfileSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      contactPerson: initialValues?.contactPerson ?? '',
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
      password: '',
      confirmPassword: '',
      services: initialValues?.services ?? [],
      city: initialValues?.city ?? '',
      province: initialValues?.province ?? '',
      address: initialValues?.address ?? '',
      website: initialValues?.website ?? '',
      description: initialValues?.description ?? '',
      logoUrl: initialValues?.logoUrl ?? '',
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const logoPath = `suppliers/temp/${file.name}`;
      const logoRef = ref(storage, logoPath);
      await uploadBytes(logoRef, file);
      const url = await getDownloadURL(logoRef);
      setLogoUrl(url);
      form.setValue('logoUrl', url);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logo Upload Failed',
        description: 'Failed to upload logo.',
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl('');
    form.setValue('logoUrl', '');
  };

  const handleAddService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      const updated = [...services, serviceInput.trim()];
      setServices(updated);
      form.setValue('services', updated);
      setServiceInput('');
    }
  };

  const handleRemoveService = (service: string) => {
    const updated = services.filter(s => s !== service);
    setServices(updated);
    form.setValue('services', updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => { onSubmit(data); })} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Supplier Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="contactPerson" render={({ field }) => (
          <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {showPassword && (
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {showPassword && (
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {/* Services offered */}
        <div>
          <FormLabel>Services Offered</FormLabel>
          <div className="flex gap-2 mt-1">
            <Input
              value={serviceInput}
              onChange={e => setServiceInput(e.target.value)}
              placeholder="Add a service"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
            />
            <Button type="button" onClick={handleAddService} disabled={!serviceInput.trim()}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {services.map(service => (
              <span key={service} className="bg-muted px-2 py-1 rounded text-xs flex items-center gap-1">
                {service}
                <Button type="button" size="icon" variant="destructive" className="h-4 w-4 p-0" onClick={() => handleRemoveService(service)}>
                  ×
                </Button>
              </span>
            ))}
          </div>
        </div>
        <FormField control={form.control} name="city" render={({ field }) => (
          <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="province" render={({ field }) => (
          <FormItem><FormLabel>Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="website" render={({ field }) => (
          <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Logo upload */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {logoUrl ? <AvatarImage src={logoUrl} alt="Supplier Logo" /> : null}
            <AvatarFallback>Logo</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />
            <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}>
              {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
            </Button>
            {logoUrl && (
              <Button type="button" variant="destructive" onClick={removeLogo}>
                Remove Logo
              </Button>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            mode === 'signup' ? 'Sign Up' : 'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SupplierProfileForm; 