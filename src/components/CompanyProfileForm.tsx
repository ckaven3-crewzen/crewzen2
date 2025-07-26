import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const companyProfileSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  contactPerson: z.string().min(2, { message: 'Contact person name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  companyType: z.enum(['principal_contractor', 'subcontractor', 'professional'], { required_error: 'Please select company type.' }),
  trade: z.string().optional(),
  professionalType: z.string().optional(),
  companySize: z.enum(['small', 'medium', 'large'], { required_error: 'Please select company size.' }),
  city: z.string().min(1, { message: 'Please select a city.' }),
  province: z.string().min(1, { message: 'Please select a province.' }),
  address: z.string().optional(),
  website: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0 && data.password.length < 6) {
    return false;
  }
  return true;
}, {
  message: 'Password must be at least 6 characters.',
  path: ['password'],
})
.refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine((data) => {
  if (data.companyType === 'subcontractor' && !data.trade) {
    return false;
  }
  return true;
}, {
  message: "Please select a trade for subcontractor",
  path: ["trade"],
})
.refine((data) => {
  if (data.companyType === 'professional' && !data.professionalType) {
    return false;
  }
  return true;
}, {
  message: "Please select a professional type",
  path: ["professionalType"],
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

interface CompanyProfileFormProps {
  initialValues?: Partial<CompanyProfileFormValues>;
  onSubmit: (data: CompanyProfileFormValues) => void;
  mode?: 'signup' | 'edit';
  showPassword?: boolean;
  isSaving?: boolean;
}

const cities = [
  'Durban', 'Johannesburg', 'Cape Town', 'Pretoria', 'Port Elizabeth', 
  'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'
];

const provinces = [
  'KwaZulu-Natal', 'Gauteng', 'Western Cape', 'Eastern Cape', 
  'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape'
];

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ initialValues, onSubmit, mode = 'signup', showPassword = true, isSaving = false }) => {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [trades, setTrades] = useState<string[]>([]);
  const [professionalTypes, setProfessionalTypes] = useState<string[]>([]);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: initialValues?.companyName ?? '',
      contactPerson: initialValues?.contactPerson ?? '',
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
      password: '',
      confirmPassword: '',
      companyType: initialValues?.companyType ?? 'principal_contractor',
      trade: initialValues?.trade ?? '',
      professionalType: initialValues?.professionalType ?? '',
      companySize: initialValues?.companySize ?? 'small',
      city: initialValues?.city ?? '',
      province: initialValues?.province ?? '',
      address: initialValues?.address ?? '',
      website: initialValues?.website ?? '',
      description: initialValues?.description ?? '',
      logoUrl: initialValues?.logoUrl ?? '',
    },
  });

  console.log('Form Errors:', form.formState.errors);

  // Fetch trades and professional types from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tradesSnapshot = await getDocs(collection(db, 'trades'));
        const tradesData = tradesSnapshot.docs.map(doc => doc.data().name).filter(Boolean);
        setTrades(tradesData.sort());

        const professionalTypesSnapshot = await getDocs(collection(db, 'professionalType'));
        const professionalTypesData = professionalTypesSnapshot.docs.map(doc => doc.data().name).filter(Boolean);
        setProfessionalTypes(professionalTypesData.sort());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const logoPath = `companies/temp/${file.name}`;
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

  // Deduplicate trades and professionalTypes before rendering
  // Handles both arrays of objects (with .name) and strings
  const uniqueTrades = Array.from(new Set(trades.map(t => typeof t === 'string' ? t : t?.name))).filter(Boolean);
  const uniqueProfessionalTypes = Array.from(new Set(professionalTypes.map(t => typeof t === 'string' ? t : t?.name))).filter(Boolean);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => { console.log('CompanyProfileForm onSubmit', data); onSubmit(data); })} className="space-y-4">
        <FormField control={form.control} name="companyName" render={({ field }) => (
          <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
        <FormField control={form.control} name="companyType" render={({ field }) => (
          <FormItem>
            <FormLabel>Company Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select company type" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="principal_contractor">Principal Contractor</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        {/* Trade and Professional Type fields (conditional) */}
        {form.watch('companyType') === 'subcontractor' && (
          <FormField control={form.control} name="trade" render={({ field }) => (
            <FormItem>
              <FormLabel>Trade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select trade" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {uniqueTrades.map(trade => (
                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}
        {form.watch('companyType') === 'professional' && (
          <FormField control={form.control} name="professionalType" render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select professional type" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {uniqueProfessionalTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}
        <FormField control={form.control} name="companySize" render={({ field }) => (
          <FormItem>
            <FormLabel>Company Size</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
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
        {mode === 'edit' && (
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={logoUrl} alt="Company Logo" />
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
        )}
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
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

export default CompanyProfileForm; 