# Saving Issues and Fixes: CompanyProfileForm (and Similar Forms)

## Problem: Save Button Not Working Due to Hidden Password Field

### Context
- In forms using **react-hook-form** and **Zod** (like CompanyProfileForm), you may have fields (e.g., password) that are only shown in certain modes (e.g., signup, not edit).
- If the Zod schema requires a field (like `password`) but the field is hidden in the UI, the form will fail validation and the submit handler will never be called.

### Symptoms
- Clicking the Save button does nothing (no errors, no network requests, no console logs from onSubmit).
- No visible error messages, but the form does not submit.
- Adding `console.log(form.formState.errors)` shows `{ password: { ... } }` even though the password field is not visible.

### Diagnosis
- The Zod schema is requiring a field that is not present in the form.
- In edit mode, the password field is hidden, but the schema still expects it.

### Solution
- Make the password (and confirmPassword) fields truly optional in the Zod schema.
- Only require a minimum length if a password is actually entered.

#### Example Zod Schema Fix
```typescript
const companyProfileSchema = z.object({
  // ... other fields ...
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  // ...
}).refine((data) => {
  // Only require min length if password is present and not empty
  if (data.password && data.password.length > 0 && data.password.length < 6) {
    return false;
  }
  return true;
}, {
  message: 'Password must be at least 6 characters.',
  path: ['password'],
})
.refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### General Advice
- Always ensure your validation schema matches the fields actually present in the form for the current mode.
- Use `.optional().or(z.literal(''))` for fields that may be hidden.
- Log `form.formState.errors` to debug silent validation failures.

---

### Current Status
- Added detailed logging to track the issue

---

## Issue: Onboarding Fails with "Profile Photo is Required" Even After Upload

### Problem
- When uploading a profile photo and ID copy during employee onboarding, clicking Finish would still show an error: "A profile photo is required for onboarding."
- The form cleared the uploaded file after upload and only kept the URL, but the save logic still expected a file to be present.

### Solution
- Updated the onboarding save logic to accept either a new file or an already uploaded photo URL (same for ID copy).
- Now, if a photo or ID copy has already been uploaded and a URL is present, onboarding proceeds without error.
- Only uploads a new file if one is present; otherwise, uses the existing URL.

### Status
- **Fixed** as of 2025-07-24.

---

## TODO
- Re-enable duplicate ID number check after onboarding/save issues are fully stable.
- Refreshed the application default credentials
- Modified the Firebase Admin SDK initialization to use a service account key file as a fallback
- Testing the employee creation process with the new authentication method

## Issue: Document Upload Not Working

### Symptoms
- Error message: "No user ID found. Please complete Step 1 first."
- createdUid state is null in step 2

### Debugging Steps
1. Added logging to track the createdUid state
2. Checked if the API response includes the uid
3. Verified the state management between steps

### Potential Causes
1. **State Management**
   - The createdUid state might not be properly updated after step 1
   - Solution: Ensure the state is updated correctly

2. **API Response**
   - The API response might not include the uid
   - Solution: Check the API response and ensure it includes the uid

### Current Status
- Added logging to track the createdUid state
- Testing the document upload process
