/**
 * CompanyCard Component
 * 
 * ✅ COMPONENT STATUS: ACTIVE BUT INCOMPLETE INTEGRATION
 * 
 * 🚨 CRITICAL INTEGRATION ISSUE:
 * - "View Profile" button exists but has NO onClick handler when used in CompaniesTab
 * - Component accepts onViewProfile prop but CompaniesTab doesn't pass it
 * - Users can see button but clicking does nothing (broken UX)
 * 
 * 🔗 MISSING INTEGRATION:
 * - Should link to: /connectzen/company/[companyId]/publicProfile
 * - CompaniesTab needs to pass: onViewProfile={() => router.push(`/connectzen/company/${company.id}/publicProfile`)}
 * - Similar pattern exists and works for WorkerCard → worker public profiles
 * 
 * 💡 INTEGRATION SOLUTION:
 * Update CompaniesTab.tsx to include:
 * ```tsx
 * const router = useRouter();
 * <CompanyCard 
 *   key={company.id} 
 *   company={company} 
 *   onViewProfile={() => router.push(`/connectzen/company/${company.id}/publicProfile`)}
 *   onContact={() => handleContactCompany(company)}
 * />
 * ```
 * 
 * 🎯 CODE QUALITY ISSUES:
 * - TODO comment about company.trade property (line 37)
 * - Inconsistent badge usage (companySize instead of industry/services)
 * - Missing proper fallbacks for optional company properties
 * 
 * Author: System Generated
 * Date: 2025-07-25
 * Status: Functional component needs integration wiring
 */

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ConnectZenCompany } from '@/lib/types';

interface CompanyCardProps {
  company: ConnectZenCompany;
  onViewProfile?: () => void;
  onContact?: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onViewProfile, onContact }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={company.logoUrl} alt={company.companyName} />
            <AvatarFallback>{company.companyName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{company.companyName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{company.location?.city || ''}{company.location?.province ? ', ' + company.location.province : ''}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Trade Badge (was Industry) */}
          <div className="flex flex-wrap gap-1">
            {/* 🔧 TODO: Update this if company.trade is not present - consider using industry or services */}
            <Badge variant="outline" className="text-xs">{company.companySize}</Badge>
          </div>
          {/* Description */}
          {company.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {company.description}
            </p>
          )}
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onViewProfile}
              type="button"
              // 🚨 CRITICAL: This button is non-functional in CompaniesTab - onViewProfile is undefined
            >
              View Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={onContact}
              type="button"
            >
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
