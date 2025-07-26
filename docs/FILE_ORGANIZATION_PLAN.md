# File Organization Plan

This document outlines the current location of files in the project and their proper locations based on the module structure. The goal is to organize files into a consistent structure that follows Next.js best practices and separates concerns by module (CrewZen, ConnectZen, ProZen, AccessZen).

## Organization Principles

1. **Pages**: Should be in the `src/app/(modules)/[module-name]/` directory
2. **Components**: 
   - Module-specific components should be in `src/app/(modules)/[module-name]/components/`
   - Shared components should be in `src/components/`
   - UI components should be in `src/components/ui/`
3. **API Routes**: Should be in `src/app/api/` directory
4. **Utility Functions**: Should be in `src/lib/` directory
5. **Hooks**: Should be in `src/hooks/` directory

## File Moves Required

### Pages to Move

| Current Location | Target Location | Notes |
|------------------|----------------|-------|
| ~~`src/app/form-test/page.tsx`~~ | ~~`src/app/(modules)/crewzen/form-test/page.tsx`~~ | ✅ MOVED - This is a test page for CrewZen forms |
| ~~`src/app/worker-test/page.tsx`~~ | ~~`src/app/(modules)/connectzen/worker-test/page.tsx`~~ | ✅ MOVED - This is a test page for ConnectZen worker profiles |
| ~~`src/components/crewzen/employees-page-new.tsx`~~ | ~~`src/app/(modules)/crewzen/employees/page.tsx`~~ | ✅ ALREADY MOVED - This page component is already in the correct location |
| ~~`src/components/crewzen/employees-page.tsx`~~ | ~~`src/app/(modules)/crewzen/employees/legacy-page.tsx`~~ | ✅ MOVED - This is an older version of the employees page |

### Components to Move

| Current Location | Target Location | Notes |
|------------------|----------------|-------|
| ~~`src/app/(modules)/connectzen/suppliers/SupplierProfileForm.tsx`~~ | ~~`src/app/(modules)/connectzen/suppliers/components/SupplierProfileForm.tsx`~~ | ✅ MOVED - Component is now in a components subfolder |
| ~~`src/components/crewzen/DocumentsUploader.tsx`~~ | ~~`src/components/DocumentsUploader.tsx`~~ | ✅ MOVED - This is now a shared component, not specific to CrewZen |
| ~~`src/components/crewzen/EditProfileForm.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EditProfileForm.tsx`~~ | ✅ MOVED - This is a CrewZen-specific component |
| ~~`src/components/crewzen/employee-debug-utils.ts`~~ | ~~`src/app/(modules)/crewzen/utils/employee-debug-utils.ts`~~ | ✅ MOVED - These are CrewZen-specific utilities |
| ~~`src/components/accesszen-page.tsx`~~ | ~~`src/app/(modules)/accesszen/components/AccessZenPage.tsx`~~ | ✅ MOVED - This is an AccessZen-specific component |
| ~~`src/components/ConnectZenMarketplacePage.tsx`~~ | ~~`src/app/(modules)/connectzen/components/MarketplacePage.tsx`~~ | ✅ MOVED - This is a ConnectZen-specific component |
| ~~`src/components/prozen-page.tsx`~~ | ~~`src/app/(modules)/prozen/components/ProZenPage.tsx`~~ | ✅ MOVED - This is a ProZen-specific component |
| ~~`src/components/CompanyProfileForm.tsx`~~ | ~~`src/app/(modules)/connectzen/company/components/CompanyProfileForm.tsx`~~ | ✅ MOVED - This is specific to ConnectZen companies |
| ~~`src/components/company-signin-form.tsx`~~ | ~~`src/app/(modules)/connectzen/company/components/CompanySignInForm.tsx`~~ | ✅ MOVED - This is specific to ConnectZen companies |
| ~~`src/components/connectzen-signup-page.tsx`~~ | ~~`src/app/(modules)/connectzen/components/SignupPage.tsx`~~ | ✅ MOVED - This is ConnectZen-specific |
| ~~`src/components/worker-signup-page.tsx`~~ | ~~`src/app/(modules)/connectzen/worker/components/WorkerSignupPage.tsx`~~ | ✅ MOVED - This is specific to ConnectZen workers |
| ~~`src/components/EmployeeForm.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeForm.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/EmployeeList.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeList.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/EmployeeCameraDialog.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeCameraDialog.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/EmployeeDeleteDialog.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeDeleteDialog.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/EmployeeDetailDialog.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeDetailDialog.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/EmployeeImageCropperDialog.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeImageCropperDialog.tsx`~~ | ⚠️ MOVED - File is empty, needs attention |
| ~~`src/components/EmployeeZoomedImageModal.tsx`~~ | ~~`src/app/(modules)/crewzen/components/EmployeeZoomedImageModal.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/UnifiedProfileForm.tsx`~~ | ~~`src/app/(modules)/crewzen/components/UnifiedProfileForm.tsx`~~ | ✅ MOVED - Full code present |
| ~~`src/components/estate-detail-page.tsx`~~ | ~~`src/app/(modules)/crewzen/estates/components/EstateDetailPage.tsx`~~ | ✅ MOVED - This is CrewZen-specific for estates |
| ~~`src/components/project-detail-page.tsx`~~ | ~~`src/app/(modules)/prozen/components/ProjectDetailPage.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/ProjectInfoTab.tsx`~~ | ~~`src/app/(modules)/prozen/components/ProjectInfoTab.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/TasksTab.tsx`~~ | ~~`src/app/(modules)/prozen/components/TasksTab.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/TaskTable.tsx`~~ | ~~`src/app/(modules)/prozen/components/TaskTable.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/TeamTab.tsx`~~ | ~~`src/app/(modules)/prozen/components/TeamTab.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/WorkersTab.tsx`~~ | ~~`src/app/(modules)/prozen/components/WorkersTab.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/ReportsTab.tsx`~~ | ~~`src/app/(modules)/prozen/components/ReportsTab.tsx`~~ | ✅ MOVED - This is ProZen-specific |
| ~~`src/components/AccessTab.tsx`~~ | ~~`src/app/(modules)/accesszen/components/AccessTab.tsx`~~ | ✅ MOVED - This is AccessZen-specific |
| ~~`src/components/CrewTab.tsx`~~ | ~~`src/app/(modules)/crewzen/components/CrewTab.tsx`~~ | ✅ MOVED - This is CrewZen-specific |

### Shared Components (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/components/ui/*` | All UI components are correctly located |
| `src/components/DocumentsUploader.tsx` | This is a shared component |
| `src/components/PhotoUploader.tsx` | This is a shared component |
| `src/components/PortfolioGallery.tsx` | This is a shared component |
| `src/components/auth-provider.tsx` | This is a shared component |
| `src/components/header.tsx` | This is a shared component |
| `src/components/login-page.tsx` | This is a shared component |
| `src/components/mode-provider.tsx` | This is a shared component |
| `src/components/theme-provider.tsx` | This is a shared component |
| `src/components/service-worker-registration.tsx` | This is a shared component |
| `src/components/settings-page.tsx` | This is a shared component |
| `src/components/reporting-page.tsx` | This is a shared component |
| `src/components/appearance-settings.tsx` | This is a shared component |
| `src/components/dashboard-page.tsx` | This is a shared component |
| `src/components/speech-to-text.tsx` | This is a shared component |
| `src/components/TestFormPage.tsx` | This is a shared component |

### ConnectZen Components (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/components/connectzen/cards/CompanyCard.tsx` | This is correctly located |
| `src/components/connectzen/cards/SupplierCard.tsx` | This is correctly located |
| `src/components/connectzen/cards/WorkerCard.tsx` | This is correctly located |
| `src/components/connectzen/tabs/CompaniesTab.tsx` | This is correctly located |
| `src/components/connectzen/tabs/SuppliersTab.tsx` | This is correctly located |
| `src/components/connectzen/tabs/WorkersTab.tsx` | This is correctly located |

### AI Components (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/components/ai/AIVoiceToTask.tsx` | This is correctly located |

### API Routes (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/app/api/create-employee/route.ts` | This is correctly located |
| `src/app/api/create-employee-client/route.ts` | This is correctly located |
| `src/app/api/create-employee-direct/route.ts` | This is correctly located |
| `src/app/api/sync-profile-photos/route.ts` | This is correctly located |
| `src/app/api/upload-file/route.ts` | This is correctly located |
| `src/app/api/generate-tasks/route.ts` | This is correctly located |
| `src/app/api/add-crewzen-module/route.ts` | This is correctly located |
| `src/app/api/email-access-bundle.ts` | This is correctly located |

### Library Files (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/lib/firebase-admin.ts` | This is correctly located |
| `src/lib/firebase.ts` | This is correctly located |
| `src/lib/types.ts` | This is correctly located |
| `src/lib/utils.ts` | This is correctly located |
| `src/lib/upload.ts` | This is correctly located |
| `src/lib/data.ts` | This is correctly located |
| `src/lib/stt-utils.ts` | This is correctly located |

### Hooks (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/hooks/use-toast.ts` | This is correctly located |

### AI Flows (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/ai/flows/analyze-server-logs.ts` | This is correctly located |
| `src/ai/flows/generate-config.ts` | This is correctly located |
| `src/ai/flows/generate-tasks-from-audio.ts` | This is correctly located |
| `src/ai/dev.ts` | This is correctly located |
| `src/ai/genkit.ts` | This is correctly located |

### Actions (Already in Correct Location)

| Current Location | Notes |
|------------------|-------|
| `src/actions/form-actions.ts` | This is correctly located |

## Duplicate Components Audit (CrewZen vs Shared)

| Component Name                | CrewZen Module Location                                      | Shared Location                        | Status/Notes                                                                 |
|-------------------------------|--------------------------------------------------------------|----------------------------------------|------------------------------------------------------------------------------|
| EmployeeList.tsx              | src/app/(modules)/crewzen/components/EmployeeList.tsx        | src/components/EmployeeList.tsx        | ✅ Both exist, similar code, CrewZen version is active                        |
| EmployeeForm.tsx              | src/app/(modules)/crewzen/components/EmployeeForm.tsx        | src/components/EmployeeForm.tsx        | ⚠️ Shared version deprecated, CrewZen version is active                      |
| EditProfileForm.tsx           | src/app/(modules)/crewzen/components/EditProfileForm.tsx     | src/components/EditProfileForm.tsx     | ⚠️ Shared version empty, CrewZen version is active                           |
| EmployeeZoomedImageModal.tsx  | src/app/(modules)/crewzen/components/EmployeeZoomedImageModal.tsx | src/components/EmployeeZoomedImageModal.tsx | ⚠️ Both exist, different implementations (Dialog vs custom modal)            |
| UnifiedProfileForm.tsx        | src/app/(modules)/crewzen/components/UnifiedProfileForm.tsx  | src/components/UnifiedProfileForm.tsx  | ⚠️ Both exist, CrewZen version is simplified, shared is more complex         |

**Legend:**
- ✅ = Both files exist and are similar/identical
- ⚠️ = Files exist but are different, deprecated, or only one is active

> Recommendation: Remove deprecated/empty shared files, keep only the correct module-specific or shared version as per the plan. Review for logic differences before deleting any shared file.

## Implementation Plan

To minimize disruption, we should move files in the following order:

1. First, move components that are not directly imported by pages
2. Then move components that are imported by pages
3. Finally, move pages themselves

For each file move:
1. Create the target directory if it doesn't exist
2. Copy the file to the new location
3. Update all imports in the codebase that reference the old location
4. Verify the application still works
5. Delete the old file

## Import Update Strategy

When moving files, we'll need to update imports throughout the codebase. Here's how to handle different types of imports:

1. **Relative imports**: Update the path to reflect the new file location
2. **Absolute imports**: Update the path to reflect the new file location (e.g., `@/components/...` to `@/app/(modules)/...`)
3. **Dynamic imports**: Update any `import()` statements that reference the moved files
4. **String literals**: Check for any string literals that might reference file paths (e.g., in Next.js router)

## Conclusion

Following this plan will help organize the codebase into a more maintainable structure, making it easier to understand and extend. The modular approach will separate concerns by module (CrewZen, ConnectZen, ProZen, AccessZen) while keeping shared components accessible to all modules.