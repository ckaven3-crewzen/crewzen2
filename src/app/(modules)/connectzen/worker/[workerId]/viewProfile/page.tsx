/*
 * Worker View/Management Profile Page
 * 
 * PURPOSE: Comprehensive worker profile management with role-based access control
 * 
 * ✅ COMPONENT STATUS: ADVANCED IMPLEMENTATION - Multi-role functionality      } else {
        setAverageRating(0);
        setTotalRatings(0);
        
        // Clear rating from worker profile if no ratings exist
        if (workerIdStr) {
          const workerProfileRef = doc(db, 'workerProfiles', workerIdStr);
          await updateDoc(workerProfileRef, {
            averageRating: 0,
            totalRatings: 0,
            updatedAt: Date.now()
          });
          
          console.log(`Cleared ratings for worker ${workerIdStr}`);
        }
      }connectzen/worker/[workerId]/viewProfile
 * - Function: Advanced profile management for workers and companies
 * - Integration: Role-based access with editing, rating, and note-taking
 * 
 * 🔍 USAGE ANALYSIS:
 * - Standalone advanced profile management page
 * - No duplicates found - unique from publicProfile (which is public-facing)
 * - Uses 'workerProfiles' Firestore collection
 * - Different from publicProfile: this has authentication and role-based features
 * 
 * 🏗️ ADVANCED FEATURES:
 * - **Role-based Access Control**: Worker self-edit vs company view-only
 * - **Tabbed Interface**: Portfolio, ID & Photo, Documents, Details
 * - **Rating System**: Company rating functionality with aggregated scores
 * - **Private Notes**: Company-specific notes about workers
 * - **Portfolio Management**: Image upload/delete with Firebase Storage
 * - **Document Management**: Certificate and document handling
 * - **Profile Editing**: UnifiedProfileForm integration for workers
 * - **ID Management**: Profile photo and ID copy upload
 * 
 * 🎯 KEY DIFFERENTIATORS FROM publicProfile:
 * - Authentication required (useAuth integration)
 * - Role-based permissions (worker vs company access)
 * - Advanced management features (rating, notes, document management)
 * - Tabbed interface for organized data display
 * - Firebase Storage integration for file uploads
 * - Private company notes and rating system
 * 
 * 📊 COMPLEX FUNCTIONALITY:
 * ```tsx
 * // Role-based access control
 * const isWorkerSelf = user?.uid === workerIdStr && (user?.role === 'worker' || user?.role === 'employee');
 * 
 * // Company rating system
 * const handleRate = async (star: number) => {
 *   // Companies can rate workers with aggregated scoring
 * };
 * 
 * // Private notes per company
 * const handleSaveNote = async () => {
 *   // Company-specific notes stored separately
 * };
 * ```
 * 
 * 🔧 MINOR IMPROVEMENTS POSSIBLE (Low Priority):
 * - Replace 'any' types with proper interfaces
 * - Add breadcrumb navigation
 * - Error handling for failed operations
 * - Loading states for individual operations
 * - Better responsive design for mobile
 * 
 * 🏷️ RECOMMENDATION: KEEP - Advanced profile management, well-architected multi-role system
 */

'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateWorkerAverageRating } from '@/lib/rating-utils';
import UnifiedProfileForm from '@/components/UnifiedProfileForm';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth-provider';
import PortfolioGallery, { PortfolioImage } from '@/components/PortfolioGallery';
import EmployeeCameraDialog from '@/app/(modules)/crewzen/components/EmployeeCameraDialog';
import EmployeeImageCropperDialog from '@/components/EmployeeImageCropperDialog';
import { Area, Point } from 'react-easy-crop';
import { uploadFileToStorage } from '@/lib/upload';
import { v4 as uuidv4 } from 'uuid';
import PhotoUploader from '@/components/PhotoUploader';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import DocumentsUploader, { DocumentFile } from '@/components/DocumentsUploader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const WorkerProfilePage = () => {
  const { workerId } = useParams();
  // Ensure workerId is a string
  const workerIdStr = Array.isArray(workerId) ? workerId[0] : workerId;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [showPhotoUploader, setShowPhotoUploader] = useState<'profile' | 'idCopy' | null>(null);

  // Determine if the current user is the worker (edit mode) or a company (view-only)
  const isWorkerSelf = user?.uid === workerIdStr && (user?.role === 'worker' || user?.role === 'employee');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!workerIdStr) {
          setProfile(null);
          setLoading(false);
          return;
        }
        const docRef = doc(db, 'workerProfiles', workerIdStr);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setDocuments(docSnap.data().documents || []);
        }
      } finally {
        setLoading(false);
      }
    };
    if (workerIdStr) fetchProfile();
  }, [workerIdStr]);

  // Fetch notes from Firestore (private to company)
  useEffect(() => {
    const fetchNotes = async () => {
      if (workerIdStr && user?.role === 'company') {
        const noteDocRef = doc(db, 'companyWorkerNotes', `${user.uid}_${workerIdStr}`);
        const noteSnap = await getDoc(noteDocRef);
        if (noteSnap.exists()) {
          setNotes(noteSnap.data().notes || '');
        } else {
          setNotes('');
        }
      }
    };
    fetchNotes();
  }, [workerIdStr, user]);

  // Fetch ratings from Firestore
  useEffect(() => {
    const fetchRatings = async () => {
      if (workerIdStr) {
        const ratingsRef = collection(db, 'workerRatings');
        const q = query(ratingsRef, where('workerId', '==', workerIdStr));
        const snapshot = await getDocs(q);
        const ratings = snapshot.docs.map(doc => doc.data().rating || 0);
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setAverageRating(avg);
          setTotalRatings(ratings.length);
        } else {
          setAverageRating(0);
          setTotalRatings(0);
        }
      }
    };
    fetchRatings();
  }, [workerIdStr]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    if (workerIdStr && user?.role === 'company') {
      const noteDocRef = doc(db, 'companyWorkerNotes', `${user.uid}_${workerIdStr}`);
      await setDoc(noteDocRef, {
        companyId: user.uid,
        workerId: workerIdStr,
        notes,
        updatedAt: Date.now(),
      }, { merge: true });
    }
    setTimeout(() => setSavingNote(false), 500);
  };

  const handleRate = async (star: number) => {
    setRating(star);
    if (workerIdStr && user?.role === 'company') {
      try {
        // Save the company's rating for this worker
        const ratingDocRef = doc(db, 'workerRatings', `${user.uid}_${workerIdStr}`);
        await setDoc(ratingDocRef, {
          companyId: user.uid,
          workerId: workerIdStr,
          rating: star,
          updatedAt: Date.now(),
        }, { merge: true });
        
        // Update the worker's average rating in their profile (for marketplace display)
        await updateWorkerAverageRating(workerIdStr);
        
        // Refresh local state to reflect the change
        const ratingsRef = collection(db, 'workerRatings');
        const q = query(ratingsRef, where('workerId', '==', workerIdStr));
        const snapshot = await getDocs(q);
        const ratings = snapshot.docs.map(doc => doc.data().rating || 0);
        
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setAverageRating(avg);
          setTotalRatings(ratings.length);
        } else {
          setAverageRating(0);
          setTotalRatings(0);
        }
        
        console.log(`Rating saved: ${star} stars for worker ${workerIdStr}`);
      } catch (error) {
        console.error('Error saving rating:', error);
      }
    }
  };

  const handlePortfolioUpload = async (url: string, storagePath?: string): Promise<void> => {
    setUploading(true);
    setUploadError(null);
    try {
      const imageId = storagePath ? storagePath.split('/').pop()?.replace('.jpg', '') : (url.split('/').pop()?.split('?')[0] || Date.now().toString());
      const workerProfileRef = doc(db, 'workerProfiles', workerIdStr);
      const currentPortfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
      const updatedPortfolio = [...currentPortfolio, { id: imageId, photoUrl: url, storagePath }];
      await setDoc(workerProfileRef, { portfolio: updatedPortfolio }, { merge: true });
      setProfile((prev: any) => ({ ...prev, portfolio: updatedPortfolio }));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to update portfolio.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolioImage = async (id: string) => {
    setUploading(true);
    setUploadError(null);
    try {
      const currentPortfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
      const image = currentPortfolio.find((img: any) => img.id === id);
      if (!image) throw new Error('Image not found');
      let path = image.storagePath;
      if (!path) {
        path = `workerProfiles/${workerIdStr}/portfolio/${id}.jpg`;
      }
      // Remove duplicate 'workerProfiles/' if present
      if ((path.match(/workerProfiles\//g) || []).length > 1) {
        path = path.replace(/^.*workerProfiles\//, 'workerProfiles/');
      }
      const imgRef = storageRef(storage, path);
      await deleteObject(imgRef);
      const updatedPortfolio = currentPortfolio.filter((img: any) => img.id !== id);
      const workerProfileRef = doc(db, 'workerProfiles', workerIdStr);
      await setDoc(workerProfileRef, { portfolio: updatedPortfolio }, { merge: true });
      setProfile((prev: any) => ({ ...prev, portfolio: updatedPortfolio }));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to delete image.');
    } finally {
      setUploading(false);
    }
  };

  // Handler for updating profile photo or ID copy
  const handleProfileImageUpload = async (url: string, _storagePath?: string) => {
    if (!profile) return;
    const workerProfileRef = doc(db, 'workerProfiles', workerIdStr);
    let update: any = {};
    if (showPhotoUploader === 'profile') {
      update.photoUrl = url;
    } else if (showPhotoUploader === 'idCopy') {
      update.idCopyUrl = url;
    }
    await setDoc(workerProfileRef, update, { merge: true });
    setProfile((prev: any) => ({ ...prev, ...update }));
    setShowPhotoUploader(null);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">Worker profile not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.photoUrl} alt={profile.firstName} />
          <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
          <p className="text-muted-foreground">{profile.location?.city}, {profile.location?.province}</p>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="mb-4 w-full flex">
          <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
          <TabsTrigger value="idphoto" className="flex-1">ID & Photo</TabsTrigger>
          <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          {isWorkerSelf && (
            <div className="mb-4">
              <PhotoUploader
                storagePath={(imageId) => `workerProfiles/${workerIdStr}/portfolio/${imageId}.jpg`}
                onUploadComplete={handlePortfolioUpload}
                disabled={uploading}
              />
              {uploadError && <div className="text-red-500 text-sm mt-2">{uploadError}</div>}
            </div>
          )}
          <PortfolioGallery
            images={
              Array.isArray(profile.portfolio)
                ? profile.portfolio.filter((img: any) => img && img.photoUrl && img.id).map((img: any) => ({ id: img.id, url: img.photoUrl, title: img.title }))
                : []
            }
            onDeleteImage={handleDeletePortfolioImage}
            editable={isWorkerSelf}
          />
        </TabsContent>

        <TabsContent value="idphoto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[{ key: 'profile', url: profile.photoUrl, title: 'Profile Photo' }, { key: 'idCopy', url: profile.idCopyUrl, title: 'ID Copy' }]
              .filter(img => img.url)
              .map(img => (
                <div key={img.key} className="flex flex-col items-center">
                  <img src={img.url} alt={img.title} className="object-cover w-32 h-32 rounded border mb-2" />
                  <div className="font-medium mb-1">{img.title}</div>
                  {isWorkerSelf && (
                    <Button size="sm" onClick={() => setShowPhotoUploader(img.key === 'profile' ? 'profile' : 'idCopy')}>
                      Change
                    </Button>
                  )}
                </div>
              ))}
          </div>
          <PhotoUploader
            storagePath={(imageId) =>
              showPhotoUploader === 'profile'
                ? `workerProfiles/${workerIdStr}/profile-photo.jpg`
                : `workerProfiles/${workerIdStr}/id-copy.jpg`
            }
            onUploadComplete={handleProfileImageUpload}
            disabled={!showPhotoUploader}
            maxImages={1}
            style={{ display: showPhotoUploader ? 'block' : 'none' }}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsUploader
            workerId={workerIdStr}
            documents={documents}
            onDocumentsChange={setDocuments}
            editable={isWorkerSelf}
          />
        </TabsContent>

        <TabsContent value="details">
          {/* UnifiedProfileForm in read-only mode for company, editable for worker self */}
          <UnifiedProfileForm
            mode="worker"
            initialValues={profile}
            onSubmit={() => {}}
            readOnly={!isWorkerSelf}
            hidePassword={!isWorkerSelf}
            showRate={true}
          />
          {/* Show rate as read-only for company users if not in the form */}
          {!isWorkerSelf && profile.rate && (
            <div className="mb-4">
              <span className="font-semibold">Rate:</span> R{profile.rate}/hr
            </div>
          )}
          {/* Certificates Section */}
          {profile.certificates && profile.certificates.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Certificates</h2>
              <ul className="space-y-2">
                {profile.certificates.map((cert: any, idx: number) => (
                  <li key={cert.id || idx} className="flex items-center gap-2">
                    <span className="truncate flex-1">{cert.name || cert.fileName || `Certificate ${idx + 1}`}</span>
                    <a
                      href={cert.url || cert}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                    <a
                      href={cert.url || cert}
                      download
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Rating Section */}
          <div>
            <h2 className="font-semibold mb-2">Rating</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({totalRatings} ratings)</span>
            </div>
            {user?.role === 'company' && (
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => handleRate(star)}
                  />
                ))}
                <span className="ml-2">Your rating</span>
              </div>
            )}
          </div>
          {/* Notes Section (company only) */}
          {user?.role === 'company' && (
            <div>
              <h2 className="font-semibold mb-2">Notes</h2>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Write notes about this worker..."
                rows={4}
              />
              <Button onClick={handleSaveNote} size="sm" className="mt-2" disabled={savingNote}>
                {savingNote ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkerProfilePage; 