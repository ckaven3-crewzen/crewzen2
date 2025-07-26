# Files for Review (July 2025)

This document lists files in the CrewZen codebase that are candidates for review, refactor, or removal. Please review these files and determine if they should be unified, updated, or deleted.

## CrewZen Employee Profile Forms

- `src/components/EmployeeForm.tsx`  
  - **Status:** Marked for removal. Not used anywhere else in the codebase. Legacy onboarding/admin edit form.
- `src/app/(modules)/crewzen/components/EditProfileForm.tsx`  
  - **Status:** Used for editing employee profiles. Should be unified with onboarding form and refactored to use shared uploaders.
- `src/app/(modules)/crewzen/components/EmployeeProfileForm.tsx`  
  - **Status:** Used for onboarding and admin editing. Should be unified with edit form and refactored to use shared uploaders.

## Recommendations

- **Unify** onboarding and editing flows to use a single `EmployeeProfileForm` with props for add/edit mode.
- **Replace** all custom file input logic with `PhotoUploader` and `DocumentsUploader` components.
- **Remove** `EmployeeForm.tsx` after confirming no usages remain.
- **Move** all employee logic under `/app/(modules)/crewzen/employees/` for tidiness.
- **Update** all imports and usages to use the new unified form and shared uploaders.

---

_Last updated: July 24, 2025_
