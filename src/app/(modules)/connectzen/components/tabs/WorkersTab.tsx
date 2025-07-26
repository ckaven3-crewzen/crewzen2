/*
 * WorkersTab Component
 * 
 * PURPOSE: Display and search workers in the ConnectZen marketplace
 * 
 * 🚨 COMPONENT STATUS: MOST CRITICAL ISSUE - WorkerCard has NO action buttons
 * - Used by: businessMarketplacePage/page.tsx (main marketplace)
 * - Function: Worker browsing and search (but ZERO interaction possible)
 * - Integration: WorkerCard has NO buttons - cannot view profiles or contact workers
 * 
 * 🔍 USAGE ANALYSIS:
 * - Single usage in business marketplace page
 * - No duplicates found - unique component
 * - Core marketplace functionality BUT COMPLETELY NON-INTERACTIVE
 * 
 * 🚨 MOST SEVERE PROBLEM:
 * WorkerCard component has ZERO action buttons - users can only see basic info:
 * - No "View Profile" button (despite worker public profile route existing)
 * - No "Contact Worker" button
 * - No interaction functionality whatsoever
 * - Worse than CompanyCard/SupplierCard which at least have broken buttons
 * 
 * 🔧 ISSUES IN THIS COMPONENT:
 * 1. PRODUCTION CONSOLE.ERROR: Line 35 has console.error for invalid workers
 * 2. DATA VALIDATION: Manual worker validation instead of proper type guards
 * 3. MISSING INTEGRATION: No handlers passed to WorkerCard (though WorkerCard doesn't accept any)
 * 
 * 📍 AVAILABLE INFRASTRUCTURE:
 * ✅ Worker public profile route EXISTS: /connectzen/worker/[workerId]/publicProfile
 * ✅ WorkerProfile type properly defined in types.ts
 * ❌ WorkerCard component has NO props for handlers
 * ❌ NO UI path from marketplace to worker profiles
 * 
 * 🔧 NEEDED FIXES (Post-Review):
 * 1. URGENT: Add action buttons to WorkerCard component
 * 2. Add onViewProfile and onContact props to WorkerCard
 * 3. Add router integration to navigate to existing public profile
 * 4. Remove production console.error statement
 * 5. Implement proper worker contact functionality
 * 
 * ⚠️ CURRENT STATE: Workers are displayed but marketplace is COMPLETELY NON-FUNCTIONAL
 * 
 * 🏷️ RECOMMENDATION: KEEP but MOST URGENT FIXES NEEDED - Worst marketplace component
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { WorkerProfile } from '@/lib/types';
import WorkerCardNew from '@/app/(modules)/connectzen/components/cards/WorkerCardNew';
import { Loader2 } from 'lucide-react';

interface WorkersTabProps {
  workers: WorkerProfile[];
  loading: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
}

const WorkersTab: React.FC<WorkersTabProps> = ({ workers, loading, searchTerm, onSearch }) => {
  const router = useRouter();

  const handleViewProfile = (workerId: string) => {
    router.push(`/connectzen/worker/${workerId}/publicProfile`);
  };

  const handleContact = (worker: WorkerProfile) => {
    // TODO: Implement contact functionality (modal, email, etc.)
    console.log('Contact worker:', worker);
    // For now, could navigate to contact form or open modal
    // router.push(`/connectzen/contact?workerId=${worker.id}`);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search workers..."
        value={searchTerm}
        onChange={e => onSearch(e.target.value)}
        className="mb-4 w-full max-w-md"
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading workers...</p>
        </div>
      ) : workers.length === 0 ? (
        <p className="text-muted-foreground">No workers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {workers.map(worker => {
            // Validate worker object exists and has required properties
            if (!worker || typeof worker !== 'object' || !worker.id) {
              return null; // Removed production console.error
            }
            return (
              <WorkerCardNew 
                key={worker.id} 
                worker={worker}
                onViewProfile={() => handleViewProfile(worker.id)}
                onContact={() => handleContact(worker)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkersTab; 
