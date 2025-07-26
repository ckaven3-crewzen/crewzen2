/**
 * TeamMemberSelect Component
 *
 * Reusable dropdown component for selecting team members (professionals/subcontractors)
 * from Firebase ConnectZen companies collection.
 *
 * Features:
 * - Fetches companies from Firebase based on type
 * - Displays company name and contact person
 * - Handles "Add New" option
 * - Reusable for both professionals and subcontractors
 * - Cross-module implementation for use across ProZen, ConnectZen, etc.
 *
 * Author: GitHub Copilot
 * Date: 2025-07-26
 */
import React, { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConnectZenCompany } from '@/lib/types';

interface TeamMemberSelectProps {
  /** Type of team member to select */
  type: 'professional' | 'subcontractor';
  /** Label text for the dropdown */
  label: string;
  /** Placeholder text */
  placeholder: string;
  /** Callback when a member is selected */
  onSelect: (memberId: string) => void;
  /** Optional filter function for companies */
  filter?: (company: ConnectZenCompany) => boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Default filters for different team member types
 */
const defaultFilters = {
  professional: (company: ConnectZenCompany) => 
    company.industry && (
      company.industry.toLowerCase().includes('professional') ||
      company.industry.toLowerCase().includes('architect') ||
      company.industry.toLowerCase().includes('engineer') ||
      company.industry.toLowerCase().includes('consultant')
    ),
  subcontractor: (company: ConnectZenCompany) => 
    company.industry && (
      company.industry.toLowerCase().includes('construction') ||
      company.industry.toLowerCase().includes('contractor') ||
      company.industry.toLowerCase().includes('trades') ||
      company.industry.toLowerCase().includes('specialist')
    )
};

/**
 * TeamMemberSelect component for selecting team members from Firebase
 */
const TeamMemberSelect: React.FC<TeamMemberSelectProps> = ({
  type,
  label,
  placeholder,
  onSelect,
  filter,
  disabled = false
}) => {
  const [companies, setCompanies] = useState<ConnectZenCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const snapshot = await getDocs(collection(db, 'connectZenCompanies'));
        const allCompanies = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            companyName: data.companyName || '',
            contactPerson: data.contactPerson || '',
            email: data.email || '',
            phone: data.phone || '',
            password: '',
            logoUrl: data.logoUrl || '',
            industry: data.industry || '',
            companySize: data.companySize || 'small',
            description: data.description || '',
            website: data.website || '',
            location: data.location || { city: '', province: '', address: '' },
            isVerified: data.isVerified || false,
            verificationDocuments: data.verificationDocuments || { 
              businessRegistration: false, 
              taxClearance: false 
            },
            isPublic: data.isPublic || false,
            allowDirectContact: data.allowDirectContact || false,
            autoPostJobs: data.autoPostJobs || false,
            jobPostings: data.jobPostings || [],
            savedWorkers: data.savedWorkers || [],
            hiredWorkers: data.hiredWorkers || [],
            createdAt: data.createdAt || 0,
            updatedAt: data.updatedAt || 0,
            lastActive: data.lastActive || 0,
          } as ConnectZenCompany;
        });

        // Apply filter (use custom filter or default based on type)
        const filterFn = filter || defaultFilters[type];
        const filteredCompanies = allCompanies.filter(filterFn);

        setCompanies(filteredCompanies);
      } catch (err) {
        console.error(`Error fetching ${type}s:`, err);
        setError(`Failed to load ${type}s`);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [type, filter]);

  return (
    <div className="space-y-2">
      <label className="block font-medium text-sm">{label}</label>
      <Select onValueChange={onSelect} disabled={disabled || loading}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? 'Loading...' : error || placeholder} />
        </SelectTrigger>
        <SelectContent>
          {companies.map(company => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex flex-col">
                <span className="font-medium">{company.companyName}</span>
                <span className="text-sm text-muted-foreground">
                  {company.contactPerson} • {company.industry}
                </span>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="add-new" className="border-t mt-2 pt-2">
            <span className="font-medium text-primary">+ Add New {type}</span>
          </SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default TeamMemberSelect;
