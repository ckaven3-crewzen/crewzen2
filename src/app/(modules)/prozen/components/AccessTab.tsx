/**
 * AccessTab Component - ProZen Module
 *
 * PURPOSE: Generate and email access bundles for project/estate employee management
 *
 * ✅ COMPONENT STATUS: WELL-IMPLEMENTED - Minor cleanup needed
 * - Function: Access bundle generation and email delivery for project employees
 * - Integration: Core ProZen project management workflow
 * - Dependencies: PDF generation service, email API, estate management
 *
 * 🔍 USAGE ANALYSIS:
 * - Used in ProZen project management interface
 * - Handles PDF form generation for employee access documents
 * - Integrates with estate email system and project employee lists
 * - No duplicates found - unique ProZen functionality
 *
 * ✅ EXCELLENT FEATURES:
 * - **PDF Generation**: Access bundle creation with employee data
 * - **Email Integration**: Automated delivery to estate contacts
 * - **Error Handling**: Comprehensive try-catch with user feedback
 * - **Loading States**: Proper async operation feedback
 * - **Validation**: Employee list and project validation
 * - **Responsive Design**: Mobile-friendly button layouts
 *
 * 🔧 MINOR IMPROVEMENTS NEEDED:
 * - **Development Debug**: Remove yellow debug banner (line 52)
 * - **Type Safety**: Replace 'any' types with proper interfaces
 * - **API Integration**: Standardize error responses from email API
 *
 * 🏗️ ARCHITECTURE BENEFITS:
 * - Clean separation of concerns (generation vs email delivery)
 * - Proper async state management
 * - Good user experience with loading states and feedback
 * - Integration with existing estate and project systems
 *
 * 📝 COMPONENT CONTEXT:
 * - Part of ProZen project management module
 * - Connects project data with AccessZen estate management
 * - Bridges employee management with document generation
 * - Critical for project access control workflow
 *
 * 🏷️ RECOMMENDATION: KEEP - Remove debug banner, improve types, otherwise excellent
 *
 * TODO: MINOR CLEANUP NEEDED
 * - Remove development debug banner (line 52)
 * - Improve TypeScript interfaces (replace 'any' types)
 * - Add proper error boundary for API failures
 * - Consider extracting email logic to separate service
 *
 * Author: [Your Name]
 * Date: 2025-07-24
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';


/**
 * Props for AccessTab
 * @property {string | null} estateName - Name of the estate
 * @property {any} project - Project object (should include employeeIds)
 * @property {string} projectId - Project ID
 * @property {any} toast - Toast notification handler
 * @property {(args: any) => Promise<any>} fillAccessForm - Function to generate access bundle
 * @property {(estateId: string) => Promise<string | null>} getEstateEmail - Function to get estate email
 */
interface AccessTabProps {
  estateName: string | null;
  project: any;
  projectId: string;
  toast: any;
  fillAccessForm: (args: any) => Promise<any>;
  getEstateEmail: (estateId: string) => Promise<string | null>;
}

/**
 * AccessTab component for generating and emailing access bundles for a project/estate.
 * @param {AccessTabProps} props
 */
const AccessTab: React.FC<AccessTabProps> = ({
  estateName,
  project,
  projectId,
  toast,
  fillAccessForm,
  getEstateEmail,
}) => {
  const [isGeneratingAccess, setIsGeneratingAccess] = useState(false);
  const [accessBundleUrl, setAccessBundleUrl] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isEmailingAccess, setIsEmailingAccess] = useState(false);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-6">Access</h2>
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <span className="font-medium text-sm">Estate:</span> {estateName || 'None selected'}
      </div>
      <Button
        variant="default"
        disabled={isGeneratingAccess || !project?.employeeIds || project.employeeIds.length === 0}
        onClick={async () => {
          if (!projectId || !project?.employeeIds) return;
          setIsGeneratingAccess(true);
          setAccessError(null);
          setAccessBundleUrl(null);
          try {
            const result = await fillAccessForm({ projectId, employeeIds: project.employeeIds });
            if (result.success && result.formUrl) {
              setAccessBundleUrl(result.formUrl);
              toast({ title: 'Access bundle generated!' });
            } else {
              setAccessError(result.error || 'Failed to generate access bundle.');
            }
          } catch (err: any) {
            setAccessError(err.message || 'Failed to generate access bundle.');
          } finally {
            setIsGeneratingAccess(false);
          }
        }}
        className="w-full sm:w-auto"
      >
        {isGeneratingAccess ? 'Generating...' : 'Generate Access Bundle'}
      </Button>
      {accessBundleUrl && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <a href={accessBundleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm sm:text-base">Download Access Bundle PDF</a>
          </div>
          <div>
            <Button
              variant="secondary"
              disabled={isEmailingAccess}
              onClick={async () => {
                if (!accessBundleUrl || !estateName || !project?.estateId) return;
                setIsEmailingAccess(true);
                try {
                  // Fetch estate email using provided function
                  const estateEmail = await getEstateEmail(project.estateId);
                  if (!estateEmail) throw new Error('No email found for this estate.');
                  const res = await fetch('/api/email-access-bundle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      pdfUrl: accessBundleUrl,
                      estateName,
                      email: estateEmail,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast({ title: 'Access bundle emailed!' });
                  } else {
                    throw new Error(data.error || 'Failed to email access bundle.');
                  }
                } catch (err: any) {
                  toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to email access bundle.' });
                } finally {
                  setIsEmailingAccess(false);
                }
              }}
              className="w-full sm:w-auto"
            >
              {isEmailingAccess ? 'Emailing...' : 'Email Access Bundle'}
            </Button>
          </div>
        </div>
      )}
      {accessError && (
        <div className="mt-4 text-red-600">{accessError}</div>
      )}
    </div>
  );
};

export default AccessTab; 