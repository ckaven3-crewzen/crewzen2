/*
 * Supplier Dashboard Page
 * 
 * PURPOSE: Private dashboard for suppliers to manage their profiles and portfolios
 * 
 * ⚠️ COMPONENT STATUS: FUNCTIONAL BUT HAS CRITICAL BROKEN LINKS
 * - Route: /connectzen/suppliers/dashboard
 * - Function: Profile management, portfolio upload, document management
 * - Integration: Works but has broken navigation buttons
 * 
 * 🔍 USAGE ANALYSIS:
 * - Standalone dashboard page for authenticated suppliers
 * - No duplicates found - unique functionality
 * - Uses 'suppliers' Firestore collection (separate from companies)
 * 
 * ✅ WORKING FEATURES:
 * - Profile display with avatar, contact info, services
 * - Portfolio image gallery with upload/delete functionality
 * - Document management system
 * - Authentication integration
 * - Responsive design
 * 
 * 🚨 CRITICAL BROKEN LINKS:
 * 1. "Edit Profile" button → '/connectzen/suppliers/edit-profile' (PAGE DOESN'T EXIST)
 * 2. "View Public Profile" button → '/connectzen/suppliers/${userId}/publicProfile' (ROUTE DOESN'T EXIST)
 * 
 * 💡 ARCHITECTURE NOTES:
 * - Uses separate 'suppliers' Firestore collection (not 'companies')
 * - Has portfolio images and documents arrays in data structure
 * - Uses same components as company/worker dashboards (PhotoUploader, DocumentsUploader)
 * - Type safety issue: profile state uses 'any' type
 * 
 * 🔧 NEEDED FIXES (Post-Review):
 * 1. Create missing edit-profile page for suppliers
 * 2. Create supplier public profile route structure
 * 3. Fix type safety - replace 'any' with proper SupplierProfile type
 * 4. Error handling for failed uploads/operations
 * 
 * 🏷️ RECOMMENDATION: KEEP - Core supplier functionality, needs missing route creation
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import PortfolioGallery from '@/components/PortfolioGallery';
import PhotoUploader from '@/components/PhotoUploader';
import { uploadFileToStorage } from '@/lib/upload';
import { v4 as uuidv4 } from 'uuid';
import DocumentsUploader, { DocumentFile } from '@/components/DocumentsUploader';

type PortfolioImage = { id: string; url: string };

const SupplierDashboardPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!user?.uid) {
          setProfile(null);
          setLoading(false);
          return;
        }
        const docRef = doc(db, 'suppliers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.uid) fetchProfile();
  }, [user?.uid]);

  // Load supplier portfolio images
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.uid) return;
      setPortfolioLoading(true);
      try {
        const docRef = doc(db, 'suppliers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
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

  // Load supplier documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'suppliers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        setDocuments([]);
      }
    };
    fetchDocuments();
  }, [user?.uid]);

  // Handler to upload new image
  const handlePortfolioUpload = async (url: string, storagePath?: string) => {
    if (!user?.uid) return;
    const newImage: PortfolioImage = { id: uuidv4(), url };
    const updatedImages = [...portfolioImages, newImage];
    setPortfolioImages(updatedImages);
    await setDoc(doc(db, 'suppliers', user.uid), { portfolioImages: updatedImages }, { merge: true });
  };

  // Handler to delete image
  const handleDeletePortfolioImage = async (id: string) => {
    if (!user?.uid) return;
    const updatedImages = portfolioImages.filter((img: PortfolioImage) => img.id !== id);
    setPortfolioImages(updatedImages);
    await setDoc(doc(db, 'suppliers', user.uid), { portfolioImages: updatedImages }, { merge: true });
    // Optionally: delete from storage
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">Supplier profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {profile.logoUrl ? <AvatarImage src={profile.logoUrl} alt={profile.name} /> : null}
          <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
          <p className="text-muted-foreground font-medium">
            {profile.location?.city}{profile.location?.province ? ', ' + profile.location.province : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div><strong>Contact:</strong> {profile.email} {profile.phone && <>| {profile.phone}</>}</div>
        {profile.services && profile.services.length > 0 && (
          <div><strong>Services:</strong> {profile.services.join(', ')}</div>
        )}
        {profile.website && (
          <div><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{profile.website}</a></div>
        )}
        {profile.description && (
          <div><strong>About:</strong> {profile.description}</div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={() => router.push('/connectzen/suppliers/edit-profile')}>Edit Profile</Button>
        <Button variant="outline" onClick={() => router.push(`/connectzen/suppliers/${user?.uid}/publicProfile`)}>View Public Profile</Button>
      </div>

      {/* Portfolio Gallery Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Supplier Portfolio</h2>
        <PhotoUploader
          storagePath={(imageId) => `supplier_portfolio/${user?.uid}/${imageId}.jpg`}
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

      {/* Documents Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Documents</h2>
        <DocumentsUploader
          workerId={user?.uid || ''}
          documents={documents}
          onDocumentsChange={async (updatedDocs) => {
            setDocuments(updatedDocs);
            if (user?.uid) {
              await setDoc(doc(db, 'suppliers', user.uid), { documents: updatedDocs }, { merge: true });
            }
          }}
          editable={true}
        />
      </div>
    </div>
  );
};

export default SupplierDashboardPage; 