
/*
 * Estate Detail Page Component
 * 
 * PURPOSE: Comprehensive estate management interface with PDF form field mapping
 * 
 * ✅ COMPONENT STATUS: COMPLEX IMPLEMENTATION - Advanced estate configuration
 * - Used by: [estateId]/page.tsx route wrapper
 * - Function: Estate details, PDF form mapping, document requirements
 * - Integration: Firebase Storage, Firestore, complex state management
 * 
 * 🔍 USAGE ANALYSIS:
 * - Single usage via dynamic route wrapper
 * - No duplicates found - unique complex estate management
 * - Core functionality for AccessZen PDF form processing
 * - Role-based access control (excludes employee role)
 * 
 * 🏗️ ADVANCED FEATURES:
 * - **PDF Form Field Mapping**: Dynamic field mapping for PDF form generation
 * - **Multi-Employee Support**: Configurable employee/helper count per form
 * - **Document Requirements**: Selectable required documents per estate
 * - **Settings Copy**: Copy configuration between estates
 * - **File Upload**: PDF form template upload to Firebase Storage
 * - **Auto-Save**: Debounced save functionality with visual feedback
 * - **Accordion Interface**: Organized field mapping by categories
 * 
 * 📊 COMPLEX STATE MANAGEMENT:
 * - 9 useState hooks managing various aspects
 * - useRef for debounced save operations
 * - useCallback for optimized functions
 * - Complex field mapping state with dynamic generation
 * - File upload state management
 * 
 * 🎯 KEY FUNCTIONALITY:
 * 1. **Dynamic Field Generation**: Creates mappable fields based on employee count
 * 2. **PDF Template Management**: Upload and manage form templates
 * 3. **Field Mapping Interface**: Maps app fields to PDF form fields
 * 4. **Document Configuration**: Selects required supporting documents
 * 5. **Estate Settings**: Basic estate information management
 * 6. **Cross-Estate Copying**: Copy configurations between estates
 * 
 * ⚠️ PRODUCTION ISSUES IDENTIFIED:
 * - **Console.error statements** on lines 165, 206, 238 (should use proper logging)
 * - Complex state management could benefit from useReducer
 * - Large component (475 lines) could be split into smaller components
 * 
 * 🔧 ARCHITECTURE COMPLEXITY:
 * - getMappableFields function generates dynamic field structure
 * - availableDocs constant defines selectable document types  
 * - Category grouping and ordering for field organization
 * - Debounced save with timeout management
 * - Promise.all for parallel data fetching
 * 
 * 🏷️ RECOMMENDATION: KEEP - Complex but essential functionality, minor refactoring beneficial
 */

'use client';

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Estate } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Upload, Trash2, CircleHelp, FileText, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/components/auth-provider';

interface MappableField {
  key: string;
  label: string;
  category: string;
}

const getMappableFields = (maxEmployees: number): MappableField[] => {
    const fields: MappableField[] = [];
    
    fields.push(
        { key: 'todaysDate', label: "Today's Date", category: 'Project' },
        { key: 'projectName', label: 'Project Name', category: 'Project' },
        { key: 'projectAddress', label: 'Project Address', category: 'Project' }
    );
    
    fields.push(
        { key: 'companyName', label: 'Name', category: 'Company Info' },
        { key: 'companyAddress', label: 'Address', category: 'Company Info' },
        { key: 'companyPhone', label: 'Phone', category: 'Company Info' },
        { key: 'companyEmail', label: 'Email', category: 'Company Info' },
        { key: 'companyOwnerName', label: 'Owner Name', category: 'Company Info' }
    );
    
    fields.push(
        { key: 'principalContractorCompanyName', label: 'Company Name', category: 'Principal Contractor' },
        { key: 'principalContractorContactName', label: 'Contact Name', category: 'Principal Contractor' },
        { key: 'principalContractorPhone', label: 'Phone', category: 'Principal Contractor' },
        { key: 'principalContractorEmail', label: 'Email', category: 'Principal Contractor' }
    );

    for (let i = 1; i <= maxEmployees; i++) {
        const empCategory = `Employee ${i}`;
        fields.push(
            { key: `employeeFullName_${i}`, label: `Full Name`, category: empCategory },
            { key: `employeeFirstName_${i}`, label: `First Name`, category: empCategory },
            { key: `employeeLastName_${i}`, label: `Last Name`, category: empCategory },
            { key: `employeeIdNumber_${i}`, label: `ID Number`, category: empCategory },
            { key: `employeeCompanyNumber_${i}`, label: `Company Number`, category: empCategory },
            { key: `employeePhone_${i}`, label: `Phone`, category: empCategory },
            { key: `employeeIsDriver_${i}`, label: `Is Driver`, category: empCategory }
        );

        const helperCategory = `Helper ${i}`;
        fields.push(
            { key: `helperFullName_${i}`, label: `Full Name`, category: helperCategory },
            { key: `helperFirstName_${i}`, label: `First Name`, category: helperCategory },
            { key: `helperLastName_${i}`, label: `Last Name`, category: helperCategory },
            { key: `helperIdNumber_${i}`, label: `ID Number`, category: helperCategory }
        );
    }
    return fields;
};

const availableDocs = [
    { id: 'photoUrl', label: 'Employee Photo' },
    { id: 'idCopyUrl', label: 'Employee ID Copy' },
    { id: 'medicalCertificateUrl', label: 'Employee Medical Certificate' },
    { id: 'helperPhotoUrl', label: 'Helper Photo' },
    { id: 'helperIdCopyUrl', label: 'Helper ID Copy' },
];


export default function EstateDetailPage({ estateId }: { estateId: string }) {
  const { user } = useAuth();
  const [estate, setEstate] = useState<Estate | null>(null);
  const [allEstates, setAllEstates] = useState<Estate[]>([]);
  const [selectedEstateToCopyFrom, setSelectedEstateToCopyFrom] = useState<string>('');
  const [initialFormUrl, setInitialFormUrl] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fieldMappings, setFieldMappings] = useState<{ [key: string]: string; }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Refs to hold the latest state for the debounced save function
  const estateRef = useRef(estate);
  useEffect(() => {
    estateRef.current = estate;
  }, [estate]);

  const fieldMappingsRef = useRef(fieldMappings);
  useEffect(() => {
    fieldMappingsRef.current = fieldMappings;
  }, [fieldMappings]);

  useEffect(() => {
    if (user && user.role === 'employee') {
      router.push('/');
    }
  }, [user, router]);

  const fetchEstateData = useCallback(async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'estates', estateId);
      const [docSnap, allEstatesSnap] = await Promise.all([
        getDoc(docRef),
        getDocs(collection(db, 'estates'))
      ]);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Estate;
        setEstate({
            ...data,
            formMaxEmployees: data.formMaxEmployees || 1,
            formFieldMappings: data.formFieldMappings || {},
            requiredDocuments: data.requiredDocuments || [],
        });
        setFieldMappings(data.formFieldMappings || {});
        setInitialFormUrl(data.formTemplateUrl);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Estate not found.' });
        router.push('/accesszen');
      }

      const allEstatesData = allEstatesSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Estate))
        .filter(e => e.id !== estateId); // Exclude current estate from copy list
      setAllEstates(allEstatesData);

    } catch (error) {
      console.error('Error fetching estate data: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch estate details.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [estateId, router, toast]);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      fetchEstateData();
    }
  }, [user, fetchEstateData]);

  const scheduleSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
        const currentEstate = estateRef.current;
        const currentMappings = fieldMappingsRef.current;

        if (!currentEstate) {
            setIsSaving(false);
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave: Partial<Estate> = {
                name: currentEstate.name,
                email: currentEstate.email,
                formTemplateUrl: currentEstate.formTemplateUrl ?? null,
                formMaxEmployees: (currentEstate.formMaxEmployees && currentEstate.formMaxEmployees >= 1) ? currentEstate.formMaxEmployees : 1,
                formFieldMappings: currentMappings,
                requiredDocuments: currentEstate.requiredDocuments || [],
            };
            
            await updateDoc(doc(db, 'estates', estateId), dataToSave);
        } catch (error) {
            console.error("Error saving estate:", error);
            toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save estate details.' });
        } finally {
            setIsSaving(false);
        }
    }, 1500);
  }, [estateId, toast]);


  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a PDF file.' });
        return;
      }
      
      if (!estate) return;

      setIsSaving(true);
      try {
        const newFileRef = ref(storage, `estates/${estateId}/form-templates/${file.name}`);
        await uploadBytes(newFileRef, file);
        const formUrl = await getDownloadURL(newFileRef);
        
        setEstate(prev => prev ? { ...prev, formTemplateUrl: formUrl } : null);
        setInitialFormUrl(formUrl);
        setSelectedFile(null);
        
        scheduleSave();

      } catch (error) {
         console.error("Error uploading new form:", error);
         toast({ variant: 'destructive', title: 'Upload Error', description: 'Could not upload the new form.' });
      } finally {
        setIsSaving(false);
      }
    }
  };


  const handleMappingChange = (appFieldName: string, pdfFieldName: string) => {
    setFieldMappings(prev => ({
        ...prev,
        [appFieldName]: pdfFieldName
    }));
    scheduleSave();
  };
  
  const handleRequiredDocChange = (docId: string, checked: boolean) => {
    setEstate(prev => {
        if (!prev) return null;
        const currentDocs = prev.requiredDocuments || [];
        const newDocs = checked 
            ? [...currentDocs, docId]
            : currentDocs.filter(id => id !== docId);
        
        return { ...prev, requiredDocuments: newDocs };
    });
    scheduleSave();
  }

  const handleStateChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEstate(prev => prev ? { ...prev, [name]: value } : null);
    scheduleSave();
  }
  
  const handleMaxEmployeeChange = (value: number | undefined) => {
    setEstate(prev => prev ? { ...prev, formMaxEmployees: value } : null);
    scheduleSave();
  }

  const handleCopyMapping = () => {
    if (!selectedEstateToCopyFrom) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select an estate to copy from.' });
        return;
    }
    const sourceEstate = allEstates.find(e => e.id === selectedEstateToCopyFrom);
    if (!sourceEstate || !estate) return;

    const mappingsToCopy = sourceEstate.formFieldMappings || {};
    
    setFieldMappings(mappingsToCopy);
    
    scheduleSave(); 
    
    toast({ title: 'Success', description: `Field mappings copied from ${sourceEstate.name}.`});
  };

  if (!user || user.role === 'employee' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!estate) return null;

  const mappableFields = getMappableFields(estate.formMaxEmployees || 1);
  const groupedFields = mappableFields.reduce((acc, field) => {
    (acc[field.category] = acc[field.category] || []).push(field);
    return acc;
  }, {} as { [key: string]: MappableField[] });

  const categoryOrder = ['Project', 'Company Info', 'Principal Contractor'];
  const remainingCategories = Object.keys(groupedFields).filter(cat => !categoryOrder.includes(cat) && (cat.startsWith('Employee') || cat.startsWith('Helper'))).sort();
  const finalCategoryOrder = [...categoryOrder, ...remainingCategories];

  return (
    <div className="container mx-auto py-8">
    <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/accesszen')}>
            <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-3xl font-bold">{estate.name}</h1>
        </div>
        </div>
        <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    </header>

    <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Access Form Field Mapper</CardTitle>
                <CardDescription>Enter the exact field name from your PDF for each data point below. Changes are saved automatically.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-2 mt-6">
                   <Accordion type="multiple" defaultValue={['Project']}>
                     {finalCategoryOrder.map(category => (
                        <AccordionItem value={category} key={category}>
                            <AccordionTrigger className="text-lg font-semibold">{category}</AccordionTrigger>
                            <AccordionContent className="space-y-3 pl-2">
                                {groupedFields[category].map(field => (
                                     <div key={field.key} className="grid grid-cols-2 gap-x-4 items-center p-2 rounded-md hover:bg-muted/50">
                                        <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                                        <Input 
                                            id={field.key}
                                            placeholder="PDF Field Name"
                                            value={fieldMappings[field.key] || ''}
                                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                     ))}
                   </Accordion>
                </div>
            </CardContent>
        </Card>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Estate Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Estate Name</Label>
                        <Input id="name" name="name" value={estate.name} onChange={handleStateChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <Input id="email" name="email" type="email" value={estate.email} onChange={handleStateChange} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Form Settings</CardTitle>
                    <CardDescription>Configure the form template and properties.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="maxEmployees">Max Employees Per Form Sheet
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1"><CircleHelp className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    <p>Set how many employees can fit on a single sheet of this form.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <Input 
                            id="maxEmployees" 
                            type="number" 
                            min="1"
                            value={estate.formMaxEmployees || ''}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                handleMaxEmployeeChange(isNaN(value) ? undefined : value);
                            }}
                        />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Form Template</Label>
                        {estate.formTemplateUrl && (
                            <div className="flex items-center gap-2 text-sm p-2 border rounded-md">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <a href={estate.formTemplateUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline flex-grow">
                                    Current Form PDF
                                </a>
                            </div>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2" /> {estate.formTemplateUrl ? 'Upload New Form' : 'Upload Form'}
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Copy Settings</CardTitle>
                    <CardDescription>Copy field mappings from another estate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="copy-from">Copy From</Label>
                    <div className="flex gap-2">
                        <Select value={selectedEstateToCopyFrom} onValueChange={setSelectedEstateToCopyFrom}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an estate..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allEstates.map(e => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCopyMapping} disabled={!selectedEstateToCopyFrom}><Copy className="mr-2" /> Copy</Button>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Supporting Documents</CardTitle>
                    <CardDescription>Select documents to bundle when generating access forms for this estate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {availableDocs.map(doc => (
                        <div key={doc.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={doc.id}
                                checked={estate.requiredDocuments?.includes(doc.id)}
                                onCheckedChange={(checked) => handleRequiredDocChange(doc.id, !!checked)}
                            />
                            <Label htmlFor={doc.id} className="font-normal">{doc.label}</Label>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
    </div>
  );
}

    
