/*
 * AccessZen Main Page Component
 * 
 * PURPOSE: Estate management dashboard for AccessZen module
 * 
 * ✅ COMPONENT STATUS: WELL-IMPLEMENTED - Clean estate management interface
 * - Used by: /accesszen main page route
 * - Function: Estate listing, creation, and navigation hub
 * - Integration: Firebase Firestore, authentication, navigation
 * 
 * 🔍 USAGE ANALYSIS:
 * - Single usage in /accesszen/page.tsx (main dashboard)
 * - No duplicates found - unique estate management component
 * - Central hub for AccessZen module functionality
 * - Role-based access control (excludes employee role)
 * 
 * ✅ EXCELLENT FEATURES:
 * - **Role-Based Access**: Automatic redirect for employee users
 * - **Estate Listing**: Grid display with responsive design
 * - **Estate Creation**: Modal dialog with form validation
 * - **Loading States**: Skeleton placeholders and loading indicators
 * - **Error Handling**: Toast notifications for user feedback
 * - **Navigation Integration**: Links to individual estate details
 * - **Clean UX**: Empty states, hover effects, proper spacing
 * 
 * 🏗️ ARCHITECTURE HIGHLIGHTS:
 * - Authentication integration with role checking
 * - Firebase Firestore CRUD operations
 * - Modal dialog pattern for estate creation
 * - Responsive grid layout with proper breakpoints
 * - Loading and error state management
 * - Toast notification system
 * 
 * 📊 TECHNICAL IMPLEMENTATION:
 * - Role-based access control with automatic redirects
 * - Estate creation with validation and error handling
 * - Firebase Firestore integration for data persistence
 * - Responsive UI with loading states and feedback
 * 
 * ⚠️ PRODUCTION ISSUES IDENTIFIED:
 * - **Console.error statements** on lines 53 and 100 (should use proper logging)
 * - Basic email validation (just type="email", no pattern validation)
 * 
 * 🔧 MINOR IMPROVEMENTS POSSIBLE (Low Priority):
 * - Replace console.error with proper logging service
 * - Enhanced email validation with regex pattern
 * - Add estate search/filter functionality
 * - Implement estate sorting options
 * - Add batch operations (delete multiple)
 * 
 * 🏷️ RECOMMENDATION: KEEP - Well-implemented estate management, minor cleanup needed
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Estate } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';

export default function AccessZenPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [estates, setEstates] = useState<Estate[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEstateName, setNewEstateName] = useState('');
  const [newEstateEmail, setNewEstateEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'employee') {
      router.push('/');
    }
  }, [user, router]);

  const fetchEstates = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'estates'));
      const estatesData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Estate)
      );
      estatesData.sort((a, b) => a.name.localeCompare(b.name));
      setEstates(estatesData);
    } catch (error) {
      console.error('Error fetching estates: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch estates.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'employee') {
        fetchEstates();
    }
  }, [user]);

  const handleOpenDialog = () => {
    setNewEstateName('');
    setNewEstateEmail('');
    setIsAddDialogOpen(true);
  };

  const handleSaveNewEstate = async () => {
    if (!newEstateName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Estate name cannot be empty.',
      });
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'estates'), {
        name: newEstateName.trim(),
        email: newEstateEmail.trim(),
        requiredDocuments: [],
        formTemplateUrl: null,
      });
      toast({
        title: 'Success',
        description: 'New estate has been added.',
      });
      setIsAddDialogOpen(false);
      await fetchEstates(); // Refresh the list
    } catch (error) {
      console.error('Error saving new estate: ', error);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Could not save the new estate.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.role === 'employee') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Estates</h1>
          <Button onClick={handleOpenDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Estate
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : estates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {estates.map((estate) => (
              <Link href={`/accesszen/${estate.id}`} key={estate.id} className="block">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{estate.name}</CardTitle>
                      <CardDescription>{estate.email}</CardDescription>
                    </CardHeader>
                  </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center text-muted-foreground">
            <p className="font-semibold">No Estates Found</p>
            <p className="text-sm mt-2">Click "Add Estate" to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Estate</DialogTitle>
            <DialogDescription>
              Enter the name and email for the new estate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="estateName">Estate Name</Label>
              <Input
                id="estateName"
                value={newEstateName}
                onChange={(e) => setNewEstateName(e.target.value)}
                placeholder="e.g. Silver Lakes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estateEmail">Contact Email</Label>
              <Input
                id="estateEmail"
                type="email"
                value={newEstateEmail}
                onChange={(e) => setNewEstateEmail(e.target.value)}
                placeholder="e.g. admin@estate.co.za"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewEstate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Estate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
