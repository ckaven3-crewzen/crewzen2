/**
 * PublicCompanyProfilePage Component
 * 
 * ⚠️ COMPONENT STATUS: IMPLEMENTED BUT NOT INTEGRATED
 * 
 * 🔧 URGENT INTEGRATION NEEDED:
 * - Wire CompanyCard "View Profile" button to this route
 * - Add "View Public Profile" button to company dashboard (like suppliers have)
 * - Update CompaniesTab to pass onViewProfile handler to CompanyCard
 * - Ensure route is discoverable through normal user flow
 * 
 * 🎯 MISSING NAVIGATION LINKS:
 * - CompanyCard.tsx has "View Profile" button but no onClick handler
 * - Company dashboard missing "View Public Profile" button
 * - Business marketplace CompanyCard doesn't link to public profiles
 * 
 * 📋 TECHNICAL IMPROVEMENTS NEEDED:
 * - Add TypeScript interface for profile data (currently using 'any')
 * - Add SEO meta tags for public profile pages
 * - Consider adding social sharing capabilities
 * - Add structured data/schema markup for company profiles
 * 
 * 🔗 ROUTE PATTERN: /connectzen/company/[companyId]/publicProfile
 * 📚 SIMILAR TO: /connectzen/worker/[workerId]/publicProfile (working example)
 * 
 * Author: System Generated
 * Date: 2025-07-25
 * Status: Functional but needs UI integration
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PortfolioGallery from '@/components/PortfolioGallery';
import { Button } from '@/components/ui/button';

const PublicCompanyProfilePage = () => {
  const { companyId } = useParams();
  const companyIdStr = Array.isArray(companyId) ? companyId[0] : companyId;
  // 🔧 TODO: Replace 'any' with proper TypeScript interface for company profile
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!companyIdStr) {
          setProfile(null);
          setLoading(false);
          return;
        }
        const docRef = doc(db, 'connectZenCompanies', companyIdStr);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } finally {
        setLoading(false);
      }
    };
    if (companyIdStr) fetchProfile();
  }, [companyIdStr]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">Company profile not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Logo and Basic Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.logoUrl} alt={profile.companyName} />
          <AvatarFallback>{profile.companyName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.companyName}</h1>
          <p className="text-muted-foreground font-medium">
            {profile.location?.city}{profile.location?.province ? ', ' + profile.location.province : ''}
          </p>
          {profile.industry && (
            <div className="text-xs text-muted-foreground mt-1">Industry: {profile.industry}</div>
          )}
          {profile.companySize && (
            <div className="text-xs text-muted-foreground">Size: {profile.companySize}</div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 items-center">
        {profile.email && (
          <Button size="sm" variant="outline" asChild>
            <a href={`mailto:${profile.email}`}>Email</a>
          </Button>
        )}
        {profile.phone && (
          <Button size="sm" variant="outline" asChild>
            <a href={`tel:${profile.phone}`}>Call</a>
          </Button>
        )}
        {profile.website && (
          <Button size="sm" variant="outline" asChild>
            <a href={profile.website} target="_blank" rel="noopener noreferrer">Website</a>
          </Button>
        )}
      </div>

      {/* About/Description */}
      {profile.description && (
        <div className="bg-muted rounded p-4">
          <h2 className="font-semibold mb-1">About</h2>
          <p className="text-sm whitespace-pre-line">{profile.description}</p>
        </div>
      )}

      {/* Portfolio Gallery */}
      <PortfolioGallery
        images={
          Array.isArray(profile.portfolioImages)
            ? profile.portfolioImages.filter((img: any) => img && img.url && img.id).map((img: any) => ({ id: img.id, url: img.url, title: img.title }))
            : []
        }
        onDeleteImage={async () => {}}
        editable={false}
      />

      {/* (Optional) Job Postings or Certificates can be added here later */}
    </div>
  );
};

export default PublicCompanyProfilePage; 