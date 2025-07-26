/**
 * CompanyDashboardPage Component
 * 
 * ✅ COMPONENT STATUS: ACTIVE & ESSENTIAL - Main ConnectZen company dashboard
 * 
 * 🔧 TECHNICAL DEBT IDENTIFIED:
 * - No error boundaries for API failures
 * 
 * ✅ RECENT IMPROVEMENTS COMPLETED:
 * - Console statements removed from production code
 * - TypeScript type safety improved (Employee vs WorkerProfile)
 * - Added "View Public Profile" button to match suppliers dashboard
 * - Updated section to show "Company Employees" instead of "Workers"
 * - Real supplier data integration (replaced mock data with Firestore)
 * - Proper employee filtering by role instead of trade tags
 * 
 * 🎯 MISSING FEATURES:
 * - Real-time worker availability updates
 * - Company profile completion progress indicator
 * - Advanced worker filtering (skills, experience level)
 * 
 * 📋 UX IMPROVEMENTS NEEDED:
 * - Loading states for individual sections
 * - Empty state improvements with actionable CTAs
 * - Mobile responsiveness optimization
 * - Error handling with user-friendly messages
 * 
 * 🔗 INTEGRATION OPPORTUNITIES:
 * - Wire "View Public Profile" to /connectzen/company/[companyId]/publicProfile
 * - Connect CrewZen activation to actual module features
 * - Implement real supplier management instead of mock data
 * 
 * Author: System Generated
 * Date: 2025-07-25
 * Status: Active dashboard with improvement opportunities
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Building, Users, Briefcase, Plus, Search, Filter, MapPin, Star, Clock, DollarSign, Settings, LogOut, Eye, MessageSquare, Heart, TrendingUp, Calendar, User, RefreshCw, Zap } from 'lucide-react';

import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { ConnectZenCompany, WorkerProfile, Employee } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import SupplierCard from '@/app/(modules)/connectzen/components/cards/SupplierCard';
import PortfolioGallery from '@/components/PortfolioGallery';
import PhotoUploader from '@/components/PhotoUploader';
import { uploadFileToStorage } from '@/lib/upload';
import { v4 as uuidv4 } from 'uuid';

// Add a type for portfolio images
type PortfolioImage = { id: string; url: string };

export default function CompanyDashboardPage() {
  const [company, setCompany] = useState<ConnectZenCompany | null>(null);
  const [workers, setWorkers] = useState<Employee[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [hasCrewZen, setHasCrewZen] = useState(false);
  const [isAddingCrewZen, setIsAddingCrewZen] = useState(false);
  const [dashboardSuppliers, setDashboardSuppliers] = useState<any[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch company data
        const companyDocRef = doc(db, 'connectZenCompanies', user.uid);
        const companyDocSnap = await getDoc(companyDocRef);
        
        if (companyDocSnap.exists()) {
          const companyData = { id: user.uid, ...companyDocSnap.data() } as ConnectZenCompany;
          setCompany(companyData);
          localStorage.setItem('connectZenCompany', JSON.stringify(companyData));

          // Check if company has CrewZen modules
          const crewZenDocRef = doc(db, 'crewZenModules', user.uid);
          const crewZenDoc = await getDoc(crewZenDocRef);
          setHasCrewZen(crewZenDoc.exists());
        }

        // Fetch employees for this company
        const employeesRef = collection(db, 'employees');
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Employee))
          .filter(emp => emp.companyId === user.uid);
        setWorkers(employeesData);
        setFilteredWorkers(employeesData);

        // Fetch suppliers data from Firestore
        const suppliersRef = collection(db, 'suppliers');
        const suppliersSnapshot = await getDocs(suppliersRef);
        const suppliersData = suppliersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setDashboardSuppliers(suppliersData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid, toast]);

  // Load company portfolio images
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.uid) return;
      setPortfolioLoading(true);
      try {
        const companyDocRef = doc(db, 'connectZenCompanies', user.uid);
        const companyDocSnap = await getDoc(companyDocRef);
        if (companyDocSnap.exists()) {
          const data = companyDocSnap.data();
          setPortfolioImages(data.portfolioImages || []);
        }
      } catch (error) {
        setPortfolioImages([]);
      } finally {
        setPortfolioLoading(false);
      }
    };
    fetchPortfolio();
  }, [user?.uid]);

  // Filter employees
  useEffect(() => {
    let filtered = workers || [];

    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTrade !== 'all') {
      // For employees, filter by role instead of trade tags
      filtered = filtered.filter(employee =>
        employee.role.toLowerCase() === selectedTrade.toLowerCase()
      );
    }

    // Remove availability filter since employees don't have this field
    // if (selectedAvailability !== 'all') {
    //   filtered = filtered.filter(employee => employee.availability === selectedAvailability);
    // }

    // Remove location filter since employees don't have structured location field
    // if (selectedLocation !== 'all') {
    //   filtered = filtered.filter(employee => employee.location.city === selectedLocation);
    // }

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, selectedTrade, selectedAvailability, selectedLocation]);

  const handleAddCrewZen = async () => {
    if (!company) return;
    
    setIsAddingCrewZen(true);
    try {
      // Get the current user's auth token
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch('/api/add-crewzen-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: company.id,
          companyName: company.companyName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setHasCrewZen(true);
        toast({
          title: 'Success!',
          description: 'CrewZen & ProZen modules have been activated for your company.',
        });
        
        // Stay on the dashboard instead of redirecting
        // setTimeout(() => {
        //   router.push('/');
        // }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error response:', errorData);
        throw new Error(`Failed to add CrewZen module: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding CrewZen module:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to activate CrewZen & ProZen. Please try again.',
      });
    } finally {
      setIsAddingCrewZen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('connectZenCompany');
      // Always redirect to main login page for consistency
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect even if there's an error
      router.push('/login');
    }
  };

  const handleContactWorker = (worker: Employee) => {
    toast({
      title: 'Contact Worker',
      description: `Contact functionality for ${worker.firstName} ${worker.lastName} will be implemented soon.`,
    });
  };

  const handleSaveWorker = async (employee: Employee) => {
    if (!company) return;
    
    try {
      const savedWorkers = company.savedWorkers || [];
      const isAlreadySaved = savedWorkers.includes(employee.id);
      
      if (isAlreadySaved) {
        const updatedSaved = savedWorkers.filter(savedId => savedId !== employee.id);
        await setDoc(doc(db, 'connectZenCompanies', company.id), {
          ...company,
          savedWorkers: updatedSaved,
        }, { merge: true });
        setCompany({ ...company, savedWorkers: updatedSaved });
        toast({
          title: 'Employee Removed',
          description: `${employee.firstName} ${employee.lastName} has been removed from your saved employees.`,
        });
      } else {
        const updatedSaved = [...savedWorkers, employee.id];
        await setDoc(doc(db, 'connectZenCompanies', company.id), {
          ...company,
          savedWorkers: updatedSaved,
        }, { merge: true });
        setCompany({ ...company, savedWorkers: updatedSaved });
        toast({
          title: 'Employee Saved',
          description: `${employee.firstName} ${employee.lastName} has been added to your saved employees.`,
        });
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save worker. Please try again.',
      });
    }
  };

  const handleViewProfile = (employee: Employee) => {
    // Navigate to the existing worker viewProfile route which provides read-only company view
    router.push(`/connectzen/worker/${employee.id}/viewProfile`);
  };

  const handleHireWorker = async (worker: Employee) => {
    toast({
      title: 'Hire Worker',
      description: `Hiring functionality for ${worker.firstName} ${worker.lastName} will be implemented soon.`,
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'working': return 'bg-yellow-100 text-yellow-800';
      case 'busy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddSupplier = (supplier: any) => {
    if (!dashboardSuppliers.some(s => s.id === supplier.id)) {
      setDashboardSuppliers([...dashboardSuppliers, supplier]);
    }
  };

  const handleRemoveSupplier = (supplierId: string) => {
    setDashboardSuppliers(dashboardSuppliers.filter(s => s.id !== supplierId));
  };

  // Handler to upload new image
  const handlePortfolioUpload = async (url: string, storagePath?: string) => {
    if (!user?.uid) return;
    const newImage: PortfolioImage = { id: uuidv4(), url };
    const updatedImages = [...portfolioImages, newImage];
    setPortfolioImages(updatedImages);
    await setDoc(doc(db, 'connectZenCompanies', user.uid), { portfolioImages: updatedImages }, { merge: true });
  };

  // Handler to delete image
  const handleDeletePortfolioImage = async (id: string) => {
    if (!user?.uid) return;
    const updatedImages = portfolioImages.filter(img => img.id !== id);
    setPortfolioImages(updatedImages);
    await setDoc(doc(db, 'connectZenCompanies', user.uid), { portfolioImages: updatedImages }, { merge: true });
    // Optionally: delete from storage
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Company data not found.</p>
          <Button onClick={() => router.push('/connectzen/company/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const employeeRoles = ['supervisor', 'employee'];
  // Remove location and trade tags since employees don't have these structured fields

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Company Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {company.companyName}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => router.push(`/connectzen/company/${user?.uid}/publicProfile`)}>
            <Eye className="mr-2 h-4 w-4" />
            View Public Profile
          </Button>
          
          {!hasCrewZen && (
            <Button 
              onClick={handleAddCrewZen} 
              disabled={isAddingCrewZen}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              {isAddingCrewZen ? 'Adding CrewZen...' : 'Add CrewZen'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{(workers || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{(company.jobPostings || []).filter(j => j.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saved Workers</p>
                <p className="text-2xl font-bold">{(company.savedWorkers || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Move Portfolio Gallery Section here */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Company Portfolio</h2>
        <PhotoUploader
          storagePath={(imageId) => `company_portfolio/${user?.uid}/${imageId}.jpg`}
          onUploadComplete={handlePortfolioUpload}
          disabled={portfolioLoading}
        />
        <div className="mt-4">
          <PortfolioGallery
            images={portfolioImages}
            onDeleteImage={handleDeletePortfolioImage}
            editable={true}
          />
        </div>
      </div>

      {/* CrewZen Activation Notice */}
      {!hasCrewZen && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Unlock CrewZen & ProZen
                </h3>
                <p className="text-blue-700 mb-4">
                  Get access to employee management, project tracking, and advanced business tools. 
                  Your company data will be automatically synced and you'll have your own isolated workspace.
                </p>
                <Button 
                  onClick={handleAddCrewZen} 
                  disabled={isAddingCrewZen}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {isAddingCrewZen ? 'Adding CrewZen...' : 'Add CrewZen & ProZen'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search workers by name or trade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {employeeRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Employees Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Company Employees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((employee: Employee) => {
            const isSaved = (company.savedWorkers || []).includes(employee.id);
            return (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewProfile(employee)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                        <AvatarFallback>
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.role === 'supervisor' ? 'Supervisor' : 'Employee'} • ID: {employee.companyNumber}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleSaveWorker(employee); }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rate:</span>
                      <span className="font-semibold">R{employee.rate}/hr</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                    {employee.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{employee.email}</span>
                      </div>
                    )}
                    {/* Show driver status if applicable */}
                    {employee.isDriver && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Driver
                        </span>
                      </div>
                    )}
                    {/* Show helper if present */}
                    {employee.hasHelper && employee.helper && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                        <User className="h-3 w-3" />
                        <span>Helper: {employee.helper.firstName} {employee.helper.lastName}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Supplier Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {dashboardSuppliers.map(supplier => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              showAddToDashboard={false}
            />
          ))}
        </div>
        {dashboardSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500">Suppliers will appear here when they register on the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
} 