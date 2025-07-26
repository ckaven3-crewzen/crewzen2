/*
 * SuppliersTab Component
 * 
 * PURPOSE: Display and search suppliers in the ConnectZen marketplace
 * 
 * 🚨 COMPONENT STATUS: CRITICAL INTEGRATION ISSUES - Multiple broken buttons
 * - Used by: businessMarketplacePage/page.tsx (main marketplace)
 * - Function: Supplier browsing and search (but NO profile access or contact)
 * - Integration: SupplierCard has broken onViewProfile and onContact handlers
 * 
 * 🔍 USAGE ANALYSIS:
 * - Single usage in business marketplace page
 * - No duplicates found - unique component
 * - Core marketplace functionality BUT BUTTONS DON'T WORK
 * 
 * 🚨 CRITICAL PROBLEMS:
 * 1. TYPE CONFUSION: Uses `CompanyProfile as SupplierProfile` type alias
 * 2. MISSING HANDLERS: SupplierCard expects onViewProfile + onContact but gets NONE
 * 3. NO SUPPLIER ROUTES: No public profile pages for suppliers (unlike companies/workers)
 * 4. BROKEN UX: Users see supplier cards but cannot interact with them
 * 
 * 🔧 NEEDED FIXES (Post-Review):
 * - Create proper SupplierProfile type in types.ts
 * - Add useRouter integration for navigation  
 * - Create supplier public profile routes
 * - Add onViewProfile and onContact handlers to SupplierCard usage
 * - Implement supplier contact functionality
 * 
 * ⚠️ CURRENT STATE: Component displays suppliers but marketplace is NON-FUNCTIONAL
 * 
 * 🏷️ RECOMMENDATION: KEEP but URGENT FIXES NEEDED - Core marketplace broken
 */

import React from 'react';
import type { CompanyProfile as SupplierProfile } from '@/lib/types';
import SupplierCard from '../cards/SupplierCard';
import { Loader2 } from 'lucide-react';

interface SuppliersTabProps {
  suppliers: SupplierProfile[];
  loading: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, loading, searchTerm, onSearch }) => {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search suppliers..."
        value={searchTerm}
        onChange={e => onSearch(e.target.value)}
        className="mb-4 w-full max-w-md"
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading suppliers...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <p className="text-muted-foreground">No suppliers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {suppliers.map(supplier => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuppliersTab; 
