/**
 * SupplierCard Component
 * 
 * ✅ COMPONENT STATUS: ACTIVE BUT MULTIPLE INTEGRATION ISSUES
 * 
 * 🚨 CRITICAL INTEGRATION ISSUES:
 * - "View Profile" button is non-functional in SuppliersTab (same issue as CompanyCard)
 * - "Contact" button is non-functional in SuppliersTab (no handler passed)
 * - Component dashboard usage also lacks proper handlers
 * 
 * 🔧 TYPE SYSTEM ISSUES:
 * - Defines its own SupplierProfile interface instead of using shared types
 * - SuppliersTab imports different type: CompanyProfile aliased as SupplierProfile
 * - Type inconsistency between component definition and usage
 * 
 * 🎯 MISSING INTEGRATIONS:
 * 1. SuppliersTab.tsx needs handlers:
 *    - onViewProfile={() => router.push(`/connectzen/supplier/${supplier.id}/publicProfile`)}
 *    - onContact={() => handleContactSupplier(supplier)}
 * 
 * 2. Company Dashboard needs handlers:
 *    - Currently only passes showAddToDashboard={false}
 *    - Missing onViewProfile and onContact functionality
 * 
 * 📋 STRUCTURAL IMPROVEMENTS NEEDED:
 * - Move SupplierProfile interface to shared types.ts
 * - Create supplier public profile route (doesn't exist yet)
 * - Implement contact functionality
 * - Replace mock supplier data with real Firestore collection
 * 
 * 🔄 USAGE PATTERNS:
 * - SuppliersTab: No handlers passed (broken buttons)
 * - Company Dashboard: No handlers passed (broken buttons) 
 * - showAddToDashboard feature not implemented properly
 * 
 * Author: System Generated
 * Date: 2025-07-25
 * Status: Functional component with broken integrations
 */

import React from 'react';
// 🔧 TODO: Move SupplierProfile to shared types.ts instead of defining here
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SupplierProfile {
  id: string;
  name: string;
  logoUrl?: string;
  services?: string[];
  location?: { city?: string; province?: string; address?: string };
  description?: string;
}

interface SupplierCardProps {
  supplier: SupplierProfile;
  onViewProfile?: () => void;
  onContact?: () => void;
  showAddToDashboard?: boolean;
  onAddToDashboard?: () => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onViewProfile, onContact, showAddToDashboard = false, onAddToDashboard }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={supplier.logoUrl} alt={supplier.name} />
            <AvatarFallback>{supplier.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{supplier.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{supplier.location?.city || ''}{supplier.location?.province ? ', ' + supplier.location.province : ''}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Services Badges */}
          <div className="flex flex-wrap gap-1">
            {(supplier.services || []).map(service => (
              <Badge key={service} variant="secondary" className="text-xs">{service}</Badge>
            ))}
          </div>
          {/* Description */}
          {supplier.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {supplier.description}
            </p>
          )}
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {showAddToDashboard && (
              <Button
                size="sm"
                onClick={onAddToDashboard}
                variant="outline"
                type="button"
              >
                Add to Dashboard
              </Button>
            )}
            <Button
              size="sm"
              onClick={onViewProfile}
              variant="outline"
              type="button"
              // 🚨 CRITICAL: Non-functional in SuppliersTab - onViewProfile is undefined
            >
              View Profile
            </Button>
            <Button
              size="sm"
              onClick={onContact}
              variant="secondary"
              type="button"
              // 🚨 CRITICAL: Non-functional in SuppliersTab - onContact is undefined
            >
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;
