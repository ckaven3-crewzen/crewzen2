/*
 * CompaniesTab Component
 * 
 * PURPOSE: Display and search companies in the ConnectZen marketplace
 * 
 * ✅ COMPONENT STATUS: ESSENTIAL - ACTIVELY USED
 * - Used by: businessMarketplacePage/page.tsx (main marketplace)
 * - Function: Company browsing, search, and profile navigation
 * - Integration: Recently fixed onViewProfile handler for navigation
 * 
 * 🔍 USAGE ANALYSIS:
 * - Single usage in business marketplace page
 * - No duplicates found - unique component
 * - Core marketplace functionality
 * 
 * 🎯 QUALITY ASSESSMENT:
 * - Well-structured React functional component
 * - Proper TypeScript interfaces
 * - Good prop separation (companies, loading, search)
 * - Clean responsive grid layout
 * - Proper error states (loading, no results)
 * 
 * ✅ RECENT IMPROVEMENTS:
 * - Added useRouter integration for profile navigation
 * - Fixed CompanyCard onViewProfile handler
 * - Now provides functional "View Profile" buttons
 * 
 * 💡 FUTURE ENHANCEMENTS:
 * - Could add onContact handler for company communication
 * - Search could be enhanced with filters (industry, location)
 * - Add sorting options (name, size, rating)
 * 
 * 🏷️ RECOMMENDATION: KEEP - Essential marketplace component, recently improved
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ConnectZenCompany } from '@/lib/types';
import CompanyCard from '../cards/CompanyCard';
import { Loader2 } from 'lucide-react';

interface CompaniesTabProps {
  companies: ConnectZenCompany[];
  loading: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
}

const CompaniesTab: React.FC<CompaniesTabProps> = ({ companies, loading, searchTerm, onSearch }) => {
  const router = useRouter();

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search companies..."
        value={searchTerm}
        onChange={e => onSearch(e.target.value)}
        className="mb-4 w-full max-w-md"
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <p className="text-muted-foreground">No companies found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {companies.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              onViewProfile={() => router.push(`/connectzen/company/${company.id}/publicProfile`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesTab; 
