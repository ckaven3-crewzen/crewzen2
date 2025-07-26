/*
 * Public Worker Profile Page
 * 
 * PURPOSE: Public-facing profile display for workers accessible from marketplace
 * 
 * ✅ COMPONENT STATUS: WORKING - Essential marketplace destination page
 * - Route: /connectzen/worker/[workerId]/publicProfile
 * - Function: Display worker information for public viewing
 * - Integration: Target for WorkerCard navigation (currently missing)
 * 
 * 🔍 USAGE ANALYSIS:
 * - Standalone public profile page (no authentication required)
 * - No duplicates found - unique functionality
 * - Different from viewProfile (which appears to be for editing/management)
 * - Uses 'workerProfiles' Firestore collection
 * 
 * ✅ EXCELLENT FEATURES:
 * - Comprehensive worker information display
 * - Star rating system with visual indicators
 * - WhatsApp contact integration (smart phone number formatting)
 * - Portfolio gallery integration (read-only mode)
 * - Skills and experience display with badges
 * - Certificates with view links
 * - Responsive design with good layout
 * - Proper error states (loading, not found)
 * 
 * 🔗 INTEGRATION STATUS:
 * ✅ Route exists and works properly
 * ❌ NOT accessible from WorkerCard marketplace (WorkerCard has no buttons)
 * ❌ Users cannot navigate here despite functional page
 * 
 * 🏗️ ARCHITECTURE HIGHLIGHTS:
 * - Clean parameter handling (workerId from URL)
 * - Proper Firebase data fetching
 * - Type safety issue: profile uses 'any' type
 * - Good data validation for optional fields
 * - WhatsApp URL encoding for special characters
 * 
 * 🎯 COMPARISON TO OTHER PROFILES:
 * - Similar structure to company publicProfile
 * - More comprehensive than basic display pages
 * - Professional presentation suitable for client viewing
 * 
 * 🔧 MINOR IMPROVEMENTS POSSIBLE (Low Priority):
 * - Replace 'any' type with proper WorkerProfile type
 * - Add breadcrumb navigation
 * - Add social media links if available
 * - Contact form instead of just WhatsApp
 * - SEO meta tags for better discoverability
 * 
 * 🏷️ RECOMMENDATION: KEEP - Well-implemented profile page, needs marketplace integration
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PortfolioGallery from '@/components/PortfolioGallery';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const PublicWorkerProfilePage = () => {
  const { workerId } = useParams();
  const workerIdStr = Array.isArray(workerId) ? workerId[0] : workerId;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        }
      } finally {
        setLoading(false);
      }
    };
    if (workerIdStr) fetchProfile();
  }, [workerIdStr]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">Worker profile not found.</div>;

  // Helper to render stars for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`inline h-4 w-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.photoUrl} alt={profile.firstName} />
          <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
          <p className="text-muted-foreground font-medium">
            {profile.location?.city}{profile.location?.province ? ', ' + profile.location.province : ''}
          </p>
          {/* Rating */}
          {typeof profile.averageRating === 'number' && profile.averageRating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {renderStars(profile.averageRating)}
              <span className="text-xs text-muted-foreground ml-2">({profile.averageRating.toFixed(1)})</span>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Button */}
      {profile.phone && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <a
              href={`https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I found your profile on CrewZen!')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="bg-muted rounded p-4">
          <h2 className="font-semibold mb-1">About</h2>
          <p className="text-sm whitespace-pre-line">{profile.bio}</p>
        </div>
      )}

      <PortfolioGallery
        images={
          Array.isArray(profile.portfolio)
            ? profile.portfolio.filter((img: any) => img && img.photoUrl && img.id).map((img: any) => ({ id: img.id, url: img.photoUrl, title: img.title }))
            : []
        }
        onDeleteImage={async () => {}}
        editable={false}
      />

      <div>
        <h2 className="font-semibold mb-2">Experience & Skills</h2>
        <div className="mb-2">
          {typeof profile.yearsExperience === 'number' && profile.yearsExperience > 0 && (
            <span>{profile.yearsExperience} yrs experience</span>
          )}
        </div>
        {Array.isArray(profile.skills) && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string, idx: number) => (
              <span key={idx} className="bg-muted px-2 py-1 rounded text-xs">{skill}</span>
            ))}
          </div>
        )}
      </div>

      {profile.certificates && profile.certificates.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Certificates</h2>
          <ul className="space-y-2">
            {profile.certificates.map((cert: any, idx: number) => (
              <li key={cert.id || idx} className="flex items-center gap-2">
                <span className="truncate flex-1">{cert.name || cert.fileName || `Certificate ${idx + 1}`}</span>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PublicWorkerProfilePage; 