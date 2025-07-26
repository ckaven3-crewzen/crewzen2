# File Overview: src/components/

This document lists every file in `src/components/` and its subfolders, with a plain-English description, module/feature, dependencies, and usage notes. This is a living document to help you understand, clean up, and maintain your codebase.

---

## Main Files

- **worker-signup-page.tsx**
  - **Description:** Worker self-signup page with form, validation, and photo upload. Handles onboarding for new workers.
  - **Module:** Onboarding / ConnectZen
  - **Used by:** Not directly imported (used as a page component)
  - **Possibly unused:** No (used as a route/page)

- **dashboard-page.tsx**
  - **Description:** Main dashboard UI for company users. Shows stats, quick actions, and navigation.
  - **Module:** CrewZen / ProZen
  - **Used by:** Not directly imported (used as a page component)
  - **Possibly unused:** No

- **auth-provider.tsx**
  - **Description:** Provides authentication context and hooks for the app. Used to get current user, sign in/out, etc.
  - **Module:** Shared / Auth
  - **Used by:** Many components (e.g., dashboard-page, settings-page, etc.)
  - **Possibly unused:** No

- **UnifiedProfileForm.tsx**
  - **Description:** Unified form for editing/creating worker or employee profiles. Used in onboarding and profile editing.
  - **Module:** Onboarding / Shared
  - **Used by:** worker-signup-page.tsx, viewProfile/page.tsx
  - **Possibly unused:** No

- **settings-page.tsx**
  - **Description:** Company/user settings page. Lets users update profile, appearance, and other settings.
  - **Module:** Shared / Settings
  - **Used by:** Not directly imported (used as a page component)
  - **Possibly unused:** No

- **TestFormPage.tsx**
  - **Description:** Minimal test page for forms. Likely used for development/testing only.
  - **Module:** Dev/Test
  - **Used by:** Not directly imported
  - **Possibly unused:** Yes (review if still needed)

- **BusinessMarketplacePage.tsx**
  - **Description:** Main business marketplace page. Shows workers, companies, suppliers for ConnectZen.
  - **Module:** ConnectZen
  - **Used by:** Not directly imported (used as a page component)
  - **Possibly unused:** No

- **header.tsx**
  - **Description:** App header/navigation bar. Used across most pages.
  - **Module:** Shared / UI
  - **Used by:** Most page components
  - **Possibly unused:** No

- **CompanyProfileForm.tsx**
  - **Description:** Form for editing company profile details.
  - **Module:** ConnectZen / Company
  - **Used by:** TeamTab.tsx
  - **Possibly unused:** No

- **EmployeeForm.tsx**
  - **Description:** Form for adding/editing employee details (CrewZen onboarding).
  - **Module:** CrewZen
  - **Used by:** employees-page.tsx
  - **Possibly unused:** No

- **CrewTab.tsx**
  - **Description:** Tab for viewing/managing crew members in a project or company.
  - **Module:** CrewZen / ProZen
  - **Used by:** project-detail-page.tsx
  - **Possibly unused:** No

- **WorkersTab.tsx**
  - **Description:** Tab for viewing/searching workers in the marketplace.
  - **Module:** ConnectZen
  - **Used by:** BusinessMarketplacePage.tsx
  - **Possibly unused:** No

- **ConnectZenMarketplacePage.tsx**
  - **Description:** Marketplace page for ConnectZen, showing workers, companies, suppliers.
  - **Module:** ConnectZen
  - **Used by:** Not directly imported (used as a page component)
  - **Possibly unused:** No

- **TasksTab.tsx**
  - **Description:** Tab for viewing and managing project tasks.
  - **Module:** ProZen
  - **Used by:** project-detail-page.tsx
  - **Possibly unused:** No

- **project-detail-page.tsx**
  - **Description:** Main page for viewing/editing a project's details, tasks, team, etc.
  - **Module:** ProZen
  - **Used by:** Not directly imported (used as a page component)
  - **Possibly unused:** No

### src/app/(modules)/prozen/page.tsx
- **Description:** Main entry point for the ProZen module. This file defines the route for `/prozen` and renders the `ProZenPage` component.
- **Module/Feature:** ProZen
- **Depends on:** `@/components/prozen-page`
- **Used by:** Next.js routing for `/prozen` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the ProZen module)

### src/app/(modules)/prozen/[projectId]/page.tsx
- **Description:** Dynamic route entry point for individual ProZen projects. This file defines the route for `/prozen/[projectId]` and renders the `ProjectDetailPage` component.
- **Module/Feature:** ProZen
- **Depends on:** `@/components/project-detail-page`
- **Used by:** Next.js routing for `/prozen/[projectId]` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for dynamic ProZen project pages)

### src/app/(modules)/prozen/dashboard/page.tsx
- **Description:** Dashboard route for the ProZen module. This file currently just redirects users to the main `/prozen` page.
- **Module/Feature:** ProZen
- **Depends on:** `next/navigation` (for redirect)
- **Used by:** Next.js routing for `/prozen/dashboard` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the ProZen dashboard, even though it redirects)

### src/app/(modules)/connectzen/page.tsx
- **Description:** Main entry point for the ConnectZen module. This file defines the route for `/connectzen` and renders the `BusinessMarketplacePage` component.
- **Module/Feature:** ConnectZen
- **Depends on:** `@/components/BusinessMarketplacePage`
- **Used by:** Next.js routing for `/connectzen` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the ConnectZen module)

### src/app/(modules)/connectzen/businessMarketplacePage/page.tsx
- **Description:** Main page for the ConnectZen business marketplace. Displays tabs for workers, companies, and suppliers, using card and tab components. Fetches and displays marketplace data from Firestore.
- **Module/Feature:** ConnectZen
- **Depends on:** `@/components/connectzen/tabs/WorkersTab`, `@/components/connectzen/tabs/CompaniesTab`, `@/components/connectzen/tabs/SuppliersTab`, `@/components/connectzen/cards/WorkerCard`, `@/components/connectzen/cards/CompanyCard`, `@/components/connectzen/cards/SupplierCard`, Firestore (`@/lib/firebase`)
- **Used by:** Next.js routing for `/connectzen/businessMarketplacePage` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the ConnectZen business marketplace)

### src/app/(modules)/connectzen/company/signin/page.tsx
- **Description:** Sign-in page for ConnectZen companies. This file defines the route for `/connectzen/company/signin` and renders the `CompanySignInForm` component.
- **Module/Feature:** ConnectZen
- **Depends on:** `@/components/company-signin-form`
- **Used by:** Next.js routing for `/connectzen/company/signin` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the ConnectZen company sign-in page)

### src/app/(modules)/connectzen/company/dashboard/page.tsx
- **Description:** Main dashboard page for ConnectZen companies. Displays company info, workers, suppliers, and allows activation of CrewZen/ProZen modules. Uses many UI components, hooks, and Firestore for data.
- **Module/Feature:** ConnectZen
- **Depends on:** UI components (`@/components/ui/*`), hooks (`@/components/auth-provider`), Firestore (`@/lib/firebase`), and more.
- **Used by:** Next.js routing for `/connectzen/company/dashboard` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the ConnectZen company dashboard)

### src/app/(modules)/connectzen/worker/[workerId]/viewProfile/page.tsx
- **Description:** Dynamic worker profile page for ConnectZen. Displays worker info, ratings, notes, and portfolio. Allows companies to rate and add notes, and workers to edit their own profile.
- **Module/Feature:** ConnectZen
- **Depends on:** `@/components/UnifiedProfileForm`, UI components (`@/components/ui/*`), hooks (`@/components/auth-provider`), Firestore (`@/lib/firebase`)
- **Used by:** Next.js routing for `/connectzen/worker/[workerId]/viewProfile` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for dynamic ConnectZen worker profile pages)

### src/app/(modules)/accesszen/page.tsx
- **Description:** Main entry point for the AccessZen module. This file defines the route for `/accesszen` and renders the `AccessZenPage` component.
- **Module/Feature:** AccessZen
- **Depends on:** `@/components/accesszen-page`
- **Used by:** Next.js routing for `/accesszen` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the AccessZen module)

### src/app/(auth)/layout.tsx
- **Description:** Layout component for all (auth) routes. Wraps children with theme, auth, and mode providers, and renders the header and toaster.
- **Module/Feature:** Auth (shared layout)
- **Depends on:** `@/components/header`, `@/components/ui/toaster`, `@/components/theme-provider`, `@/components/auth-provider`, `@/components/mode-provider`
- **Used by:** All routes in the (auth) directory
- **Possibly unused:** No (it is the main layout for (auth) routes)

### src/app/(auth)/reporting/page.tsx
- **Description:** Reporting page for authenticated users. This file defines the route for `/reporting` and renders the `ReportingPage` component.
- **Module/Feature:** Auth (Reporting)
- **Depends on:** `@/components/reporting-page`
- **Used by:** Next.js routing for `/reporting` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the reporting page)

### src/app/(auth)/settings/page.tsx
- **Description:** Settings page for authenticated users. This file defines the route for `/settings` and renders the `SettingsPage` component.
- **Module/Feature:** Auth (Settings)
- **Depends on:** `@/components/settings-page`
- **Used by:** Next.js routing for `/settings` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the settings page)

### src/app/(auth)/login/page.tsx
- **Description:** Login page for the app. Handles sign-in for companies and workers, using Firebase Auth and Firestore, and renders a login form.
- **Module/Feature:** Auth (Login)
- **Depends on:** Firebase Auth/Firestore (`@/lib/firebase`), UI components (`@/components/ui/*`), hooks (`@/hooks/use-toast`), React Hook Form, Zod
- **Used by:** Next.js routing for `/login` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the login page)

### src/app/(public)/layout.tsx
- **Description:** Layout component for all (public) routes. Wraps children with theme, auth, and mode providers, and renders the toaster.
- **Module/Feature:** Public (shared layout)
- **Depends on:** `@/components/ui/toaster`, `@/components/theme-provider`, `@/components/auth-provider`, `@/components/mode-provider`
- **Used by:** All routes in the (public) directory
- **Possibly unused:** No (it is the main layout for (public) routes)

### src/app/(public)/page.tsx
- **Description:** Landing page for the public area. Currently just redirects to `/connectzen` as the main entry point.
- **Module/Feature:** Public (Landing)
- **Depends on:** `next/navigation` (for redirect)
- **Used by:** Next.js routing for `/` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the public landing page)

### src/app/(public)/complete-profile/page.tsx
- **Description:** Public profile completion page for workers. Allows workers to fill in their skills, trade, and other info. Uses Firebase, AuthProvider, and handles sign out.
- **Module/Feature:** Public (Worker Profile)
- **Depends on:** Firebase (`@/lib/firebase`), AuthProvider (`@/components/auth-provider`)
- **Used by:** Next.js routing for `/complete-profile` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the public profile completion page)

### src/app/(public)/marketplace/page.tsx
- **Description:** Public marketplace page. Renders the `ConnectZenMarketplacePage` component.
- **Module/Feature:** Public (Marketplace)
- **Depends on:** `@/components/ConnectZenMarketplacePage`
- **Used by:** Next.js routing for `/marketplace` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the public marketplace page)

### src/app/(public)/worker-register/page.tsx
- **Description:** Worker registration page. Renders the `WorkerSignupPage` component.
- **Module/Feature:** Public (Worker Registration)
- **Depends on:** `@/components/worker-signup-page`
- **Used by:** Next.js routing for `/worker-register` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the worker registration page)

### src/app/(public)/company-signup/page.tsx
- **Description:** Company sign-up page. Handles company registration, validation, and profile creation. Uses Firebase, CompanyProfileForm, and UI components.
- **Module/Feature:** Public (Company Signup)
- **Depends on:** Firebase (`@/lib/firebase`), CompanyProfileForm (`@/components/CompanyProfileForm`), UI components (`@/components/ui/*`)
- **Used by:** Next.js routing for `/company-signup` (not directly imported elsewhere)
- **Possibly unused:** No (it is the main route handler for the company sign-up page)

### src/app/api/email-access-bundle.ts
- **Description:** API route for emailing access bundles as PDFs. Handles POST requests, downloads a PDF, and sends it to the specified email using Nodemailer and SMTP environment variables.
- **Module/Feature:** API (Access Bundle Email)
- **Depends on:** Nodemailer, Next.js API types, environment variables for SMTP
- **Used by:** API requests to `/api/email-access-bundle`
- **Possibly unused:** No (it is an active API route for sending access bundles)

### src/app/api/add-crewzen-module/route.ts
- **Description:** API route for enabling CrewZen modules for companies. Handles POST requests, verifies authentication, and writes to Firestore to enable CrewZen for a company. Uses Firebase Admin and Firestore.
- **Module/Feature:** API (CrewZen Module Enable)
- **Depends on:** Firebase Admin, Firestore, Next.js API types, environment variables
- **Used by:** API requests to `/api/add-crewzen-module`
- **Possibly unused:** No (it is an active API route for enabling CrewZen modules)

### src/app/api/upload-file/route.ts
- **Description:** API route for uploading files (images) to Firebase Storage. Handles POST requests with a data URL, path, and userId, uploads the file, and returns a public URL. Uses Firebase Admin.
- **Module/Feature:** API (File Upload)
- **Depends on:** Firebase Admin, Next.js API types, environment variables
- **Used by:** API requests to `/api/upload-file`
- **Possibly unused:** No (it is an active API route for file uploads)

### src/app/api/sync-profile-photos/route.ts
- **Description:** API route for syncing profile photos and ID copies for employees and workers. Handles POST requests, updates Firestore records by authUid in both employees and workerProfiles collections.
- **Module/Feature:** API (Profile Photo Sync)
- **Depends on:** Firebase Admin, Next.js API types
- **Used by:** API requests to `/api/sync-profile-photos`
- **Possibly unused:** No (it is an active API route for syncing profile photos)

### src/app/api/create-employee/route.ts
- **Description:** API route for creating new employees. Handles POST requests, creates users in Firebase Auth, and writes employee and workerProfile records to Firestore.
- **Module/Feature:** API (Employee Creation)
- **Depends on:** Firebase Admin, Firestore, Next.js API types
- **Used by:** API requests to `/api/create-employee`
- **Possibly unused:** No (it is an active API route for employee creation)

### src/app/api/generate-tasks/route.ts
- **Description:** API route for generating tasks from audio transcripts. Handles POST requests, calls the generateTasksFromAudio AI flow, and returns generated tasks.
- **Module/Feature:** API (Task Generation)
- **Depends on:** `@/ai/flows/generate-tasks-from-audio`, Next.js API types
- **Used by:** API requests to `/api/generate-tasks`
- **Possibly unused:** No (it is an active API route for task generation)

### src/app/layout.tsx
- **Description:** Root layout for the app. Sets up the HTML structure, metadata, viewport, and global styles. Used by all routes in the app.
- **Module/Feature:** App (Root Layout)
- **Depends on:** `./globals.css`, Next.js Metadata
- **Used by:** All routes in the app
- **Possibly unused:** No (it is the main root layout for the app)

### src/app/globals.css
- **Description:** Global stylesheet for the app. Includes Tailwind base, components, utilities, and custom styles for mobile, dark mode, and UI.
- **Module/Feature:** App (Global Styles)
- **Depends on:** Tailwind CSS
- **Used by:** All routes in the app
- **Possibly unused:** No (it is the main global stylesheet for the app)

### src/app/connectzen/settings/page.tsx
- **Description:** This file appears to be a code fragment, not a valid page component. It contains logic for deleting user ID copy and profile photo from storage, but does not export a React component.
- **Module/Feature:** ConnectZen (Settings)
- **Depends on:** Firebase Storage (deleteObject, ref)
- **Used by:** Not used as a route or component (incomplete or leftover file)
- **Possibly unused:** Yes (does not export a page component; review for cleanup)

### src/hooks/use-toast.ts
- **Description:** Custom React hook and utility for managing toast notifications. Inspired by react-hot-toast, provides toast, dismiss, and update functions for user feedback.
- **Module/Feature:** Shared (Hooks/Utilities)
- **Depends on:** React, Toast UI components
- **Used by:** Any component or page needing toast notifications
- **Possibly unused:** No (it is a shared utility used throughout the app)

### src/lib/firebase-admin.ts
- **Description:** Initializes and exports Firebase Admin SDK, auth, and Firestore for server-side use. Ensures correct project and storage bucket are used.
- **Module/Feature:** Shared (Firebase Admin)
- **Depends on:** firebase-admin
- **Used by:** API routes and server utilities
- **Possibly unused:** No (it is a core shared library)

### src/lib/upload.ts
- **Description:** Utility function to upload files to Firebase Storage and return the download URL. Used by components and actions that upload files.
- **Module/Feature:** Shared (Upload Utility)
- **Depends on:** Firebase Storage
- **Used by:** Components and actions that upload files
- **Possibly unused:** No (it is a shared utility)

### src/lib/types.ts
- **Description:** Defines TypeScript types and schemas for employees, workers, companies, projects, tasks, and more. Used throughout the app for type safety and validation.
- **Module/Feature:** Shared (Types)
- **Depends on:** TypeScript, Zod
- **Used by:** All parts of the app for type safety
- **Possibly unused:** No (it is a core shared types file)

### src/lib/utils.ts
- **Description:** Utility function for merging Tailwind and clsx class names. Used by UI components for class name management.
- **Module/Feature:** Shared (Utils)
- **Depends on:** clsx, tailwind-merge
- **Used by:** UI components
- **Possibly unused:** No (it is a shared utility)

### src/lib/data.ts
- **Description:** Provides mock project data and a function to generate imaginary worker profiles for testing. Used for development and testing.
- **Module/Feature:** Shared (Mock Data)
- **Depends on:** Firebase, Firestore, types
- **Used by:** Development and testing scripts
- **Possibly unused:** No (it is used for test data)

### src/lib/stt-utils.ts
- **Description:** Provides speech-to-text utilities using the Web Speech API, including a singleton service for browser-based STT and helper functions. Used by AI and voice features.
- **Module/Feature:** Shared (Speech-to-Text)
- **Depends on:** Web Speech API (browser), TypeScript
- **Used by:** AI and voice features in the app
- **Possibly unused:** No (it is used for speech-to-text functionality)

### src/lib/firebase.ts
- **Description:** Initializes and exports the Firebase client SDK, including app, db, storage, and auth. Used by all client-side code for database, storage, and authentication.
- **Module/Feature:** Shared (Firebase Client)
- **Depends on:** firebase/app, firebase/auth, firebase/firestore, firebase/storage
- **Used by:** All client-side code
- **Possibly unused:** No (it is a core shared library)

### src/ai/genkit.ts
- **Description:** Configures and exports the Genkit AI instance, loading environment variables and setting up the Google AI plugin. Used by AI flows for task generation and analysis.
- **Module/Feature:** AI (Genkit Setup)
- **Depends on:** genkit, @genkit-ai/googleai, dotenv, environment variables
- **Used by:** AI flows and features
- **Possibly unused:** No (it is the main AI setup file)

### src/ai/dev.ts
- **Description:** Loads environment variables and imports AI flow scripts for development/testing. Not used in production.
- **Module/Feature:** AI (Development)
- **Depends on:** dotenv, AI flow scripts
- **Used by:** Development and testing of AI flows
- **Possibly unused:** No (used for AI development)

### src/actions/form-actions.ts
- **Description:** Provides client-side functions for handling form actions, PDF generation, and Firestore updates for projects, employees, and estates. Used by components for onboarding and access forms.
- **Module/Feature:** Actions (Form Handling)
- **Depends on:** Firebase, Firestore, Storage, pdf-lib, date-fns, types
- **Used by:** Components for onboarding and access forms
- **Possibly unused:** No (it is a core actions utility)

### src/ai/flows/generate-tasks-from-audio.ts
- **Description:** Defines the AI flow for generating structured tasks from audio transcripts, using Genkit and Google AI. Used by the generate-tasks API route.
- **Module/Feature:** AI (Task Generation Flow)
- **Depends on:** Genkit, Google AI, dotenv, zod, types
- **Used by:** generate-tasks API route and AI features
- **Possibly unused:** No (it is a core AI flow)

### src/ai/flows/analyze-server-logs.ts
- **Description:** Defines an AI flow for analyzing Next.js server logs to suggest allowed origins for CORS, using Genkit and Google AI.
- **Module/Feature:** AI (Server Log Analysis Flow)
- **Depends on:** Genkit, Google AI, zod
- **Used by:** AI features for server log analysis
- **Possibly unused:** No (it is a core AI flow)

### src/ai/flows/generate-config.ts
- **Description:** Defines an AI flow for generating allowedDevOrigins config snippets for next.config.js, using Genkit and Google AI.
- **Module/Feature:** AI (Config Generation Flow)
- **Depends on:** Genkit, Google AI, zod
- **Used by:** AI features for config generation
- **Possibly unused:** No (it is a core AI flow)

### src/next.config.ts
- **Description:** Main Next.js configuration file. Sets up TypeScript and ESLint options, allowed image domains, and security headers for the app.
- **Module/Feature:** Config (Next.js)
- **Depends on:** Next.js
- **Used by:** Next.js build and runtime
- **Possibly unused:** No (it is the main config file for the app)

### README.md
- **Description:** Main project readme. Provides setup instructions, feature overview, and links to documentation for the CrewZen platform.
- **Module/Feature:** Documentation
- **Depends on:** None
- **Used by:** All contributors and users
- **Possibly unused:** No (it is the main readme for the project)

### test-firebase.js
- **Description:** Script for testing Firebase Admin authentication and decoding ID tokens. Used for development and debugging.
- **Module/Feature:** Scripts/Utilities
- **Depends on:** firebase-admin
- **Used by:** Developers for testing Firebase authentication
- **Possibly unused:** No (it is a useful dev script)

### fix-admin-role.js
- **Description:** Script to fix admin roles in the Firestore database for ConnectZen companies. Used for data migration and cleanup.
- **Module/Feature:** Scripts/Utilities
- **Depends on:** firebase-admin
- **Used by:** Developers for data migration/cleanup
- **Possibly unused:** No (it is a useful migration script)

### fix-company-ids.js
- **Description:** Script to fix or assign company IDs for employees in Firestore. Used for data migration and cleanup.
- **Module/Feature:** Scripts/Utilities
- **Depends on:** firebase-admin
- **Used by:** Developers for data migration/cleanup
- **Possibly unused:** No (it is a useful migration script)

### cleanup-for-dynamic-dimensions.js
- **Description:** Script to clean up test/demo data in Firestore collections (workers, employees, projects, tasks, attendance) for a fresh start. Used before major migrations or demos.
- **Module/Feature:** Scripts/Utilities
- **Depends on:** firebase/app, firebase/firestore
- **Used by:** Developers for database cleanup
- **Possibly unused:** No (it is a useful cleanup script)

### firestore.rules
- **Description:** Firestore security rules file. Defines access control for all Firestore collections, including employees, workerProfiles, companies, projects, and more.
- **Module/Feature:** Config (Firestore Security)
- **Depends on:** Firestore
- **Used by:** Firestore security enforcement
- **Possibly unused:** No (it is the main Firestore rules file)

### storage.rules
- **Description:** Firebase Storage security rules file. Currently allows wide open access for development (read/write for all paths). **Warning: Not for production!**
- **Module/Feature:** Config (Storage Security)
- **Depends on:** Firebase Storage
- **Used by:** Storage security enforcement
- **Possibly unused:** No (it is the main storage rules file)

### firebase.json
- **Description:** Firebase project configuration file. Specifies Firestore and Storage rules, database location, and index file.
- **Module/Feature:** Config (Firebase)
- **Depends on:** Firebase
- **Used by:** Firebase CLI and deployment
- **Possibly unused:** No (it is the main Firebase config file)

### components.json
- **Description:** Configuration file for shadcn/ui component library. Sets up style, Tailwind config, aliases, and icon library for UI components.
- **Module/Feature:** Config (UI Components)
- **Depends on:** shadcn/ui, Tailwind CSS
- **Used by:** UI component generator and tooling
- **Possibly unused:** No (it is the main shadcn/ui config file)

### cors.json
- **Description:** CORS configuration file. Specifies allowed origins, methods, response headers, and max age for cross-origin requests.
- **Module/Feature:** Config (CORS)
- **Depends on:** None
- **Used by:** Server or deployment scripts for CORS setup
- **Possibly unused:** No (it is the main CORS config file)

### postcss.config.mjs
- **Description:** PostCSS configuration file. Sets up Tailwind CSS as a PostCSS plugin for processing styles.
- **Module/Feature:** Config (PostCSS)
- **Depends on:** PostCSS, Tailwind CSS
- **Used by:** Build process for CSS
- **Possibly unused:** No (it is the main PostCSS config file)

### package.json
- **Description:** Main Node.js package manifest. Lists dependencies, scripts, and project metadata for the CrewZen platform.
- **Module/Feature:** Config (Node.js/Project)
- **Depends on:** Node.js, npm/yarn
- **Used by:** All developers and build tools
- **Possibly unused:** No (it is the main package manifest)

### package-lock.json
- **Description:** npm lockfile. Records the exact dependency tree for reproducible installs. Used by npm/yarn to ensure consistent dependency versions.
- **Module/Feature:** Config (Node.js/Dependencies)
- **Depends on:** npm/yarn
- **Used by:** All developers and build tools
- **Possibly unused:** No (it is the main lockfile for the project)

### public/offline.html
- **Description:** Offline fallback page for the PWA. Shown when the user is offline. Used by the service worker.
- **Module/Feature:** Public (PWA/Offline)
- **Depends on:** None
- **Used by:** Service worker and browser when offline
- **Possibly unused:** No (it is the main offline page)

### public/sw.js
- **Description:** Service worker script for offline support and caching. Handles install, fetch, and activate events for the PWA.
- **Module/Feature:** Public (PWA/Service Worker)
- **Depends on:** None
- **Used by:** Browser for PWA features
- **Possibly unused:** No (it is the main service worker script)

### public/manifest.json
- **Description:** Web app manifest for the PWA. Defines app name, icons, theme color, and start URL for installable PWA features.
- **Module/Feature:** Public (PWA/Manifest)
- **Depends on:** None
- **Used by:** Browser for PWA installation and theming
- **Possibly unused:** No (it is the main manifest file)

### public/icons/icon-192x192.svg
- **Description:** 192x192 SVG icon for the PWA. Used in the web app manifest and as a favicon for various devices.
- **Module/Feature:** Public (PWA/Icon)
- **Depends on:** None
- **Used by:** Web app manifest, browser, and devices
- **Possibly unused:** No (it is a main app icon)

### public/icons/icon-512x512.svg
- **Description:** 512x512 SVG icon for the PWA. Used in the web app manifest and as a favicon for various devices.
- **Module/Feature:** Public (PWA/Icon)
- **Depends on:** None
- **Used by:** Web app manifest, browser, and devices
- **Possibly unused:** No (it is a main app icon)

### docs/PROJECT_DOCUMENTATION.md
- **Description:** Main project documentation. Provides an overview, setup instructions, folder structure, usage guide, development and deployment instructions, and testing guide for CrewZen.
- **Module/Feature:** Documentation
- **Depends on:** None
- **Used by:** All contributors and users
- **Possibly unused:** No (it is the main project documentation)

### docs/ONBOARDING_DATA_FLOW.md
- **Description:** Documentation and diagrams for onboarding and data flow. Includes mermaid diagrams for onboarding, module communication, and sync mechanisms.
- **Module/Feature:** Documentation
- **Depends on:** None
- **Used by:** Developers and contributors for understanding onboarding/data flow
- **Possibly unused:** No (it is a key documentation file)

### docs/FIREBASE_ADMIN_DEBUG.md
- **Description:** Debug and setup guide for Firebase Admin. Covers environment variables, credential setup, troubleshooting, and common errors for authentication.
- **Module/Feature:** Documentation
- **Depends on:** None
- **Used by:** Developers for Firebase Admin setup and debugging
- **Possibly unused:** No (it is a key debug/setup doc)

### docs/blueprint.md
- **Description:** Blueprint for the OriginConfigurator tool. Outlines core features, style guidelines, and user experience for a tool to manage allowed origins in Next.js.
- **Module/Feature:** Documentation/Blueprint
- **Depends on:** None
- **Used by:** Developers for planning/configuration tools
- **Possibly unused:** No (it is a reference blueprint)

### tests/worker-signup.spec.ts
- **Description:** (Currently empty) test file for worker signup functionality. Intended for automated tests of the worker registration flow.
- **Module/Feature:** Tests
- **Depends on:** None (yet)
- **Used by:** Test runner (when implemented)
- **Possibly unused:** Yes (currently empty placeholder)

### workspace/patches/next-themes+0.3.0.patch
- **Description:** Patch file for next-themes to add React 19 support to peerDependencies. Duplicate or backup of the patch in the root patches directory.
- **Module/Feature:** Patches/Dependencies
- **Depends on:** patch-package, next-themes
- **Used by:** Dependency patching tools during install
- **Possibly unused:** No (it is an active patch for dependency compatibility)

---

**Note:**
- Files marked as "Possibly unused" should be reviewed for deletion or archiving.
- This doc will be expanded to cover all files in the project, including `src/app/`, `src/lib/`, etc.

## src/lib/ Directory Preview

- **firebase-admin.ts**
  - **Description:** Initializes and exports the Firebase Admin SDK for server-side operations (e.g., admin API routes).
  - **Module:** Shared / Backend
  - **Used by:** API routes, server-side scripts
  - **Possibly unused:** No

- **firebase.ts**
  - **Description:** Initializes and exports the Firebase client SDK, including app, db, storage, and auth. Used by all client-side code for database, storage, and authentication.
  - **Module:** Shared / Frontend
  - **Used by:** Most client-side components and pages
  - **Possibly unused:** No

- **types.ts**
  - **Description:** Central location for all TypeScript types and interfaces used throughout the app (Employee, Project, etc.).
  - **Module:** Shared / Types
  - **Used by:** Most files in the project
  - **Possibly unused:** No

- **utils.ts**
  - **Description:** General utility functions (e.g., class name helpers, formatting, etc.).
  - **Module:** Shared / Utilities
  - **Used by:** Various components and pages
  - **Possibly unused:** No

- **data.ts**
  - **Description:** Contains static or mock data for development/testing, or shared data helpers.
  - **Module:** Shared / Data
  - **Used by:** Components, tests, or dev scripts
  - **Possibly unused:** No

- **stt-utils.ts**
  - **Description:** Utilities for speech-to-text (STT) features, including audio transcription helpers.
  - **Module:** AI / Voice
  - **Used by:** speech-to-text.tsx, AI flows
  - **Possibly unused:** No

- **upload.ts**
  - **Description:** Helper functions for uploading files to Firebase Storage.
  - **Module:** Shared / Upload
  - **Used by:** Components that handle file uploads (e.g., profile photo, documents)
  - **Possibly unused:** No

## src/app/ Directory Preview

- **layout.tsx**
  - **Description:** Root layout for the Next.js app. Sets up global providers, theme, and structure for all pages.
  - **Module:** Shared / App Shell
  - **Used by:** All pages in the app
  - **Possibly unused:** No

- **globals.css**
  - **Description:** Global CSS styles for the entire app.
  - **Module:** Shared / Styles
  - **Used by:** All pages and components
  - **Possibly unused:** No

- **favicon.ico**
  - **Description:** App favicon (browser tab icon).
  - **Module:** Shared / Assets
  - **Used by:** All pages (via Next.js)
  - **Possibly unused:** No

### Main Folders

- **(modules)/**
  - **Description:** Contains all main feature modules (CrewZen, ProZen, AccessZen, ConnectZen). Each subfolder is a feature area with its own pages and logic.
  - **Module:** Modular Features
  - **Used by:** App routing and navigation

- **(auth)/**
  - **Description:** Auth-related pages (login, reporting, settings, etc.).
  - **Module:** Auth / User Management
  - **Used by:** App routing

- **(public)/**
  - **Description:** Public-facing pages (marketplace, worker register, company signup, complete profile, etc.).
  - **Module:** Public / Onboarding / Marketplace
  - **Used by:** App routing

- **api/**
  - **Description:** API route handlers for backend logic (employee creation, file upload, sync, etc.).
  - **Module:** Backend / API
  - **Used by:** Client and server-side API calls

- **connectzen/**
  - **Description:** ConnectZen-specific settings and pages.
  - **Module:** ConnectZen
  - **Used by:** App routing 

## src/app/(modules)/crewzen/ Directory Preview

- **page.tsx**
  - **Description:** Entry point for the CrewZen module. Likely sets up routing or layout for CrewZen features.
  - **Module:** CrewZen
  - **Used by:** App routing
  - **Possibly unused:** No

### Subfolders

- **employees/page.tsx**
  - **Description:** Main page for managing/viewing employees in CrewZen.
  - **Module:** CrewZen / Employees
  - **Used by:** CrewZen module routing
  - **Possibly unused:** No

- **dashboard/page.tsx**
  - **Description:** Main dashboard page for CrewZen, showing company-specific stats and actions.
  - **Module:** CrewZen / Dashboard
  - **Used by:** CrewZen module routing
  - **Possibly unused:** No 

## Recent Updates (June 2025)

- **Componentization:** Many UI elements (trade dropdowns, cards, galleries) are now reusable components in `src/components/ui/` or `src/components/connectzen/cards/`.
- **TradeSelect:** New `TradeSelect` component fetches trades from Firestore and is used for filtering workers and companies in the marketplace.
- **Marketplace Data:** The business marketplace page (`businessMarketplacePage/page.tsx`) now fetches real data for workers, companies, and suppliers from Firestore. All mock data has been removed.
- **Public Profile Pages:** There are now dedicated public profile pages for workers (`worker/[workerId]/publicProfile/page.tsx`), with company and supplier public profiles coming soon. These pages use the same gallery, info, and contact components as the main app, but in read-only mode.
- **Portfolio & Documents:** PortfolioGallery and DocumentsUploader components are used for managing and displaying images and documents, with editing disabled in public views.
- **Navigation:** The main nav and dashboard buttons are now role-aware and route to the correct dashboard/profile for each user type.
- **Filtering:** All trade/industry dropdowns in the marketplace use the new TradeSelect component, ensuring consistency and up-to-date options from the database.

## Employee Profile Forms: Usage Trace (for Refactor)

### EmployeeForm (src/components/EmployeeForm.tsx)
- **Description:** Main form for adding/editing employee details (CrewZen onboarding and admin edit).
- **Used by:**
  - `src/components/crewzen/employees-page.tsx` (imported as EmployeeForm, used for onboarding and editing employees in CrewZen admin flow)
- **Notes:**
  - Handles onboarding and admin editing of employees.
  - Uses react-hook-form and Zod for validation.
  - (As of July 2025) Modern uploaders (PhotoUploader, DocumentsUploader) are being integrated here.

### EditProfileForm (src/components/crewzen/EditProfileForm.tsx)
- **Description:** Form for editing an employee's profile (possibly self-service or a different admin flow).
- **Used by:**
  - `src/components/crewzen/employees-page.tsx` (imported as EditProfileForm, used for edit flow)
  - `src/components/TestFormPage.tsx` (for testing)
- **Notes:**
  - Handles profile editing, with custom file input logic for photo, ID copy, and medical certificate.
  - Not currently using shared uploaders (should be refactored).

### Recommendation for Refactor
- **Unify these forms into a single, shared EmployeeProfileForm** with props to control which fields/sections are shown (onboarding, admin edit, self-edit, etc.).
- **Remove duplication** to make maintenance and feature updates easier.
- **Integrate shared uploaders** (PhotoUploader, DocumentsUploader) in the unified form. 

## CrewZen EmployeesPage Deep Dive: Onboarding vs. Editing Flows (July 2025)

### Onboarding (Add New Employee)
- **Step 1:**
  - Lines ~600–700: Renders `<UnifiedProfileForm mode="employee" ... />` for new employee info (name, contact, etc.).
  - Handles creation of new employee in Firestore and Auth.
- **Step 2:**
  - Lines ~710–740: Renders custom file inputs for profile photo and ID copy (not using shared uploaders yet).
  - Handles file upload and updates Firestore with photo/ID URLs.
- **Live Logic:**
  - UnifiedProfileForm is the live form for onboarding.
  - Custom file input logic is still live for onboarding step 2 (should be replaced with PhotoUploader/DocumentsUploader).

### Editing (Edit Existing Employee)
- **Dialog:**
  - Lines ~750–900: Renders `<EditProfileForm ... />` for editing an existing employee.
  - Handles profile editing, file uploads (photo, ID, medical certificate), and updates Firestore.
- **Live Logic:**
  - EditProfileForm is the live form for editing employees.
  - Uses custom file input logic for uploads (should be replaced with shared uploaders).

### Leftover/Legacy Logic
- **EmployeeForm.tsx:**
  - Not used anywhere else in the codebase. **Marked for removal.**
- **Custom file input logic:**
  - Present in both onboarding step 2 and EditProfileForm; should be unified and replaced with shared uploaders.

### Recommendations
- **Unify onboarding and editing flows to use a single EmployeeProfileForm** (with props for add/edit mode).
- **Replace all custom file input logic with PhotoUploader and DocumentsUploader.**
- **Remove EmployeeForm.tsx (marked for removal; not used anywhere else).**
- **Move all employee logic under /app/(modules)/crewzen/employees** for tidiness.

## Next Steps
- **Scan all usages** of employee forms/components in CrewZen and remove/replace any leftover or unused logic.
- **Unify to a single EmployeeProfileForm** for all onboarding/edit/edit flows.
- **Move all employee logic under /app/(modules)/crewzen/employees** for tidiness.
- **Update all imports and usages** to use the new unified form and shared uploaders. 

## Component File Relocation Mapping (July 2025)

This section maps all relevant files in `src/components` to their future locations for CrewZen, ProZen, ConnectZen, and AccessZen modularization.

### CrewZen (move to `/app/(modules)/crewzen/employees/`):
- crewzen/employees-page.tsx
- crewzen/EditProfileForm.tsx
- crewzen/employee-debug-utils.ts
- EmployeeList.tsx
- EmployeeDetailDialog.tsx
- EmployeeDeleteDialog.tsx
- EmployeeCameraDialog.tsx
- EmployeeImageCropperDialog.tsx
- EmployeeZoomedImageModal.tsx
- *(Remove: EmployeeForm.tsx — not used anywhere)*

### ProZen (move to `/app/(modules)/prozen/`):
- prozen-page.tsx *(main ProZen dashboard/page)*
- ProjectInfoTab.tsx *(if only used in ProZen)*
- project-detail-page.tsx *(if only used in ProZen)*
- TaskTable.tsx *(if only used in ProZen)*
- TeamTab.tsx *(if only used in ProZen projects)*
- ReportsTab.tsx *(if only used in ProZen reporting)*

### ConnectZen (move to `/app/(modules)/connectzen/`):
- connectzen/cards/CompanyCard.tsx
- connectzen/cards/WorkerCard.tsx
- connectzen/cards/SupplierCard.tsx
- connectzen/tabs/CompaniesTab.tsx
- connectzen/tabs/SuppliersTab.tsx
- connectzen/tabs/WorkersTab.tsx
- ConnectZenMarketplacePage.tsx
- CompanyProfileForm.tsx
- connectzen-signup-page.tsx
- company-signin-form.tsx
- worker-signup-page.tsx
- TestFormPage.tsx *(if only used for ConnectZen/worker testing)*

### AccessZen (move to `/app/(modules)/accesszen/`):
- AccessTab.tsx
- accesszen-page.tsx
- estate-detail-page.tsx
- *(Any other estate/AccessZen-specific files)*

### Shared/Reusable (should remain in `src/components/`):
- DocumentsUploader.tsx
- PhotoUploader.tsx
- PortfolioGallery.tsx
- UnifiedProfileForm.tsx *(if used by multiple modules)*
- header.tsx
- dashboard-page.tsx *(if used by multiple modules)*
- settings-page.tsx *(if used by multiple modules)*
- All files in `ui/` (generic UI components)
- mode-provider.tsx
- appearance-settings.tsx
- service-worker-registration.tsx
- speech-to-text.tsx
- auth-provider.tsx

---

**Note:**
- Files marked as "Possibly unused" should be reviewed for deletion or archiving.
- This doc will be expanded to cover all files in the project, including `src/app/`, `src/lib/`, etc.

## src/lib/ Directory Preview

- **firebase-admin.ts**
  - **Description:** Initializes and exports the Firebase Admin SDK for server-side operations (e.g., admin API routes).
  - **Module:** Shared / Backend
  - **Used by:** API routes, server-side scripts
  - **Possibly unused:** No

- **firebase.ts**
  - **Description:** Initializes and exports the Firebase client SDK, including app, db, storage, and auth. Used by all client-side code for database, storage, and authentication.
  - **Module:** Shared / Frontend
  - **Used by:** Most client-side components and pages
  - **Possibly unused:** No

- **types.ts**
  - **Description:** Central location for all TypeScript types and interfaces used throughout the app (Employee, Project, etc.).
  - **Module:** Shared / Types
  - **Used by:** Most files in the project
  - **Possibly unused:** No

- **utils.ts**
  - **Description:** General utility functions (e.g., class name helpers, formatting, etc.).
  - **Module:** Shared / Utilities
  - **Used by:** Various components and pages
  - **Possibly unused:** No

- **data.ts**
  - **Description:** Contains static or mock data for development/testing, or shared data helpers.
  - **Module:** Shared / Data
  - **Used by:** Components, tests, or dev scripts
  - **Possibly unused:** No

- **stt-utils.ts**
  - **Description:** Utilities for speech-to-text (STT) features, including audio transcription helpers.
  - **Module:** AI / Voice
  - **Used by:** speech-to-text.tsx, AI flows
  - **Possibly unused:** No

- **upload.ts**
  - **Description:** Helper functions for uploading files to Firebase Storage.
  - **Module:** Shared / Upload
  - **Used by:** Components that handle file uploads (e.g., profile photo, documents)
  - **Possibly unused:** No

## src/app/ Directory Preview

- **layout.tsx**
  - **Description:** Root layout for the Next.js app. Sets up global providers, theme, and structure for all pages.
  - **Module:** Shared / App Shell
  - **Used by:** All pages in the app
  - **Possibly unused:** No

- **globals.css**
  - **Description:** Global CSS styles for the entire app.
  - **Module:** Shared / Styles
  - **Used by:** All pages and components
  - **Possibly unused:** No

- **favicon.ico**
  - **Description:** App favicon (browser tab icon).
  - **Module:** Shared / Assets
  - **Used by:** All pages (via Next.js)
  - **Possibly unused:** No

### Main Folders

- **(modules)/**
  - **Description:** Contains all main feature modules (CrewZen, ProZen, AccessZen, ConnectZen). Each subfolder is a feature area with its own pages and logic.
  - **Module:** Modular Features
  - **Used by:** App routing and navigation

- **(auth)/**
  - **Description:** Auth-related pages (login, reporting, settings, etc.).
  - **Module:** Auth / User Management
  - **Used by:** App routing

- **(public)/**
  - **Description:** Public-facing pages (marketplace, worker register, company signup, complete profile, etc.).
  - **Module:** Public / Onboarding / Marketplace
  - **Used by:** App routing

- **api/**
  - **Description:** API route handlers for backend logic (employee creation, file upload, sync, etc.).
  - **Module:** Backend / API
  - **Used by:** Client and server-side API calls

- **connectzen/**
  - **Description:** ConnectZen-specific settings and pages.
  - **Module:** ConnectZen
  - **Used by:** App routing 

## src/app/(modules)/crewzen/ Directory Preview

- **page.tsx**
  - **Description:** Entry point for the CrewZen module. Likely sets up routing or layout for CrewZen features.
  - **Module:** CrewZen
  - **Used by:** App routing
  - **Possibly unused:** No

### Subfolders

- **employees/page.tsx**
  - **Description:** Main page for managing/viewing employees in CrewZen.
  - **Module:** CrewZen / Employees
  - **Used by:** CrewZen module routing
  - **Possibly unused:** No

- **dashboard/page.tsx**
  - **Description:** Main dashboard page for CrewZen, showing company-specific stats and actions.
  - **Module:** CrewZen / Dashboard
  - **Used by:** CrewZen module routing
  - **Possibly unused:** No 

## Recent Updates (June 2025)

- **Componentization:** Many UI elements (trade dropdowns, cards, galleries) are now reusable components in `src/components/ui/` or `src/components/connectzen/cards/`.
- **TradeSelect:** New `TradeSelect` component fetches trades from Firestore and is used for filtering workers and companies in the marketplace.
- **Marketplace Data:** The business marketplace page (`businessMarketplacePage/page.tsx`) now fetches real data for workers, companies, and suppliers from Firestore. All mock data has been removed.
- **Public Profile Pages:** There are now dedicated public profile pages for workers (`worker/[workerId]/publicProfile/page.tsx`), with company and supplier public profiles coming soon. These pages use the same gallery, info, and contact components as the main app, but in read-only mode.
- **Portfolio & Documents:** PortfolioGallery and DocumentsUploader components are used for managing and displaying images and documents, with editing disabled in public views.
- **Navigation:** The main nav and dashboard buttons are now role-aware and route to the correct dashboard/profile for each user type.
- **Filtering:** All trade/industry dropdowns in the marketplace use the new TradeSelect component, ensuring consistency and up-to-date options from the database.

## Employee Profile Forms: Usage Trace (for Refactor)

### EmployeeForm (src/components/EmployeeForm.tsx)
- **Description:** Main form for adding/editing employee details (CrewZen onboarding and admin edit).
- **Used by:**
  - `src/components/crewzen/employees-page.tsx` (imported as EmployeeForm, used for onboarding and editing employees in CrewZen admin flow)
- **Notes:**
  - Handles onboarding and admin editing of employees.
  - Uses react-hook-form and Zod for validation.
  - (As of July 2025) Modern uploaders (PhotoUploader, DocumentsUploader) are being integrated here.

### EditProfileForm (src/components/crewzen/EditProfileForm.tsx)
- **Description:** Form for editing an employee's profile (possibly self-service or a different admin flow).
- **Used by:**
  - `src/components/crewzen/employees-page.tsx` (imported as EditProfileForm, used for edit flow)
  - `src/components/TestFormPage.tsx` (for testing)
- **Notes:**
  - Handles profile editing, with custom file input logic for photo, ID copy, and medical certificate.
  - Not currently using shared uploaders (should be refactored).

### Recommendation for Refactor
- **Unify these forms into a single, shared EmployeeProfileForm** with props to control which fields/sections are shown (onboarding, admin edit, self-edit, etc.).
- **Remove duplication** to make maintenance and feature updates easier.
- **Integrate shared uploaders** (PhotoUploader, DocumentsUploader) in the unified form. 

## CrewZen EmployeesPage Deep Dive: Onboarding vs. Editing Flows (July 2025)

### Onboarding (Add New Employee)
- **Step 1:**
  - Lines ~600–700: Renders `<UnifiedProfileForm mode="employee" ... />` for new employee info (name, contact, etc.).
  - Handles creation of new employee in Firestore and Auth.
- **Step 2:**
  - Lines ~710–740: Renders custom file inputs for profile photo and ID copy (not using shared uploaders yet).
  - Handles file upload and updates Firestore with photo/ID URLs.
- **Live Logic:**
  - UnifiedProfileForm is the live form for onboarding.
  - Custom file input logic is still live for onboarding step 2 (should be replaced with PhotoUploader/DocumentsUploader).

### Editing (Edit Existing Employee)
- **Dialog:**
  - Lines ~750–900: Renders `<EditProfileForm ... />` for editing an existing employee.
  - Handles profile editing, file uploads (photo, ID, medical certificate), and updates Firestore.
- **Live Logic:**
  - EditProfileForm is the live form for editing employees.
  - Uses custom file input logic for uploads (should be replaced with shared uploaders).

### Leftover/Legacy Logic
- **EmployeeForm.tsx:**
  - Not used anywhere else in the codebase. **Marked for removal.**
- **Custom file input logic:**
  - Present in both onboarding step 2 and EditProfileForm; should be unified and replaced with shared uploaders.

### Recommendations
- **Unify onboarding and editing flows to use a single EmployeeProfileForm** (with props for add/edit mode).
- **Replace all custom file input logic with PhotoUploader and DocumentsUploader.**
- **Remove EmployeeForm.tsx (marked for removal; not used anywhere else).**
- **Move all employee logic under /app/(modules)/crewzen/employees** for tidiness.

## Next Steps
- **Scan all usages** of employee forms/components in CrewZen and remove/replace any leftover or unused logic.
- **Unify to a single EmployeeProfileForm** for all onboarding/edit/edit flows.
- **Move all employee logic under /app/(modules)/crewzen/employees** for tidiness.
- **Update all imports and usages** to use the new unified form and shared uploaders. 

## Summary of ConnectZen-Related Changes (July 2025)

- Company dashboard now features a portfolio gallery with photo upload/take buttons, above the workers section.
- 'View Profile' button on company cards in the business marketplace now navigates to the public company profile page.
- Supplier flow is fully implemented: signup, dashboard, portfolio, document upload, and correct login/redirect.
- SupplierProfileForm is modular and located in /app/(modules)/connectzen/suppliers/.
- DocumentsUploader is now a shared component.
- All relevant fixes (logo upload bug, services optional, supplier profile lookup in auth-provider, etc.) are in place.
- See CONNECTZEN_FLOW.md for a summary of these changes.

## Component File Relocation Mapping (July 2025)

This section maps all relevant files in `src/components` to their future locations for CrewZen, ProZen, ConnectZen, and AccessZen modularization.

### CrewZen (move to `/app/(modules)/crewzen/employees/`):
- crewzen/employees-page.tsx
- crewzen/EditProfileForm.tsx
- crewzen/employee-debug-utils.ts
- EmployeeList.tsx
- EmployeeDetailDialog.tsx
- EmployeeDeleteDialog.tsx
- EmployeeCameraDialog.tsx
- EmployeeImageCropperDialog.tsx
- EmployeeZoomedImageModal.tsx
- *(Remove: EmployeeForm.tsx — not used anywhere)*

### ProZen (move to `/app/(modules)/prozen/`):
- prozen-page.tsx *(main ProZen dashboard/page)*
- ProjectInfoTab.tsx *(if only used in ProZen)*
- project-detail-page.tsx *(if only used in ProZen)*
- TaskTable.tsx *(if only used in ProZen)*
- TeamTab.tsx *(if only used in ProZen projects)*
- ReportsTab.tsx *(if only used in ProZen reporting)*

### ConnectZen (move to `/app/(modules)/connectzen/`):
- connectzen/cards/CompanyCard.tsx
- connectzen/cards/WorkerCard.tsx
- connectzen/cards/SupplierCard.tsx
- connectzen/tabs/CompaniesTab.tsx
- connectzen/tabs/SuppliersTab.tsx
- connectzen/tabs/WorkersTab.tsx
- ConnectZenMarketplacePage.tsx
- CompanyProfileForm.tsx
- connectzen-signup-page.tsx
- company-signin-form.tsx
- worker-signup-page.tsx
- TestFormPage.tsx *(if only used for ConnectZen/worker testing)*

### AccessZen (move to `/app/(modules)/accesszen/`):
- AccessTab.tsx
- accesszen-page.tsx
- estate-detail-page.tsx
- *(Any other estate/AccessZen-specific files)*

### Shared/Reusable (should remain in `src/components/`):
- DocumentsUploader.tsx
- PhotoUploader.tsx
- PortfolioGallery.tsx
- UnifiedProfileForm.tsx *(if used by multiple modules)*
- header.tsx
- dashboard-page.tsx *(if used by multiple modules)*
- settings-page.tsx *(if used by multiple modules)*
- All files in `ui/` (generic UI components)
- mode-provider.tsx
- appearance-settings.tsx
- service-worker-registration.tsx
- speech-to-text.tsx
- auth-provider.tsx

---

**Note:**
- Files marked as "Possibly unused" should be reviewed for deletion or archiving.
- This doc will be expanded to cover all files in the project, including `src/app/`, `src/lib/`, etc.

## src/lib/ Directory Preview

- **firebase-admin.ts**
  - **Description:** Initializes and exports the Firebase Admin SDK for server-side operations (e.g., admin API routes).
  - **Module:** Shared / Backend
  - **Used by:** API routes, server-side scripts
  - **Possibly unused:** No

- **firebase.ts**
  - **Description:** Initializes and exports the Firebase client SDK, including app, db, storage, and auth. Used by all client-side code for database, storage, and authentication.
  - **Module:** Shared / Frontend
  - **Used by:** Most client-side components and pages
  - **Possibly unused:** No

- **types.ts**
  - **Description:** Central location for all TypeScript types and interfaces used throughout the app (Employee, Project, etc.).
  - **Module:** Shared / Types
  - **Used by:** Most files in the project
  - **Possibly unused:** No

- **utils.ts**
  - **Description:** General utility functions (e.g., class name helpers, formatting, etc.).
  - **Module:** Shared / Utilities
  - **Used by:** Various components and pages
  - **Possibly unused:** No

- **data.ts**
  - **Description:** Contains static or mock data for development/testing, or shared data helpers.
  - **Module:** Shared / Data
  - **Used by:** Components, tests, or dev scripts
  - **Possibly unused:** No

- **stt-utils.ts**
  - **Description:** Utilities for speech-to-text (STT) features, including audio transcription helpers.
  - **Module:** AI / Voice
  - **Used by:** speech-to-text.tsx, AI flows
  - **Possibly unused:** No

- **upload.ts**
  - **Description:** Helper functions for uploading files to Firebase Storage.
  - **Module:** Shared / Upload
  - **Used by:** Components that handle file uploads (e.g., profile photo, documents)
  - **Possibly unused:** No

## src/app/ Directory Preview

- **layout.tsx**
  - **Description:** Root layout for the Next.js app. Sets up global providers, theme, and structure for all pages.
  - **Module:** Shared / App Shell
  - **Used by:** All pages in the app
  - **Possibly unused:** No

- **globals.css**
  - **Description:** Global CSS styles for the entire app.
  - **Module:** Shared / Styles
  - **Used by:** All pages and components
  - **Possibly unused:** No

- **favicon.ico**
  - **Description:** App favicon (browser tab icon).
  - **Module:** Shared / Assets
  - **Used by:** All pages (via Next.js)
  - **Possibly unused:** No

### Main Folders

- **(modules)/**
  - **Description:** Contains all main feature modules (CrewZen, ProZen, AccessZen, ConnectZen). Each subfolder is a feature area with its own pages and logic.
  - **Module:** Modular Features
  - **Used by:** App routing and navigation

- **(auth)/**
  - **Description:** Auth-related pages (login, reporting, settings, etc.).
  - **Module:** Auth / User Management
  - **Used by:** App routing

- **(public)/**
  - **Description:** Public-facing pages (marketplace, worker register, company signup, complete profile, etc.).
  - **Module:** Public / Onboarding / Marketplace
  - **Used by:** App routing

- **api/**
  - **Description:** API route handlers for backend logic (employee creation, file upload, sync, etc.).
  - **Module:** Backend / API
  - **Used by:** Client and server-side API calls

- **connectzen/**
  - **Description:** ConnectZen-specific settings and pages.
  - **Module:** ConnectZen
  - **Used by:** App routing 

## src/app/(modules)/crewzen/ Directory Preview

- **page.tsx**
  - **Description:** Entry point for the CrewZen module. Likely sets up routing or layout for CrewZen features.
  - **Module:** CrewZen
  - **Used by:** App routing
  - **Possibly unused:** No

### Subfolders

- **employees/page.tsx**
  - **Description:** Main page for managing/viewing employees in CrewZen.
  - **Module:** CrewZen / Employees
  - **Used by:** CrewZen module routing
  - **Possibly unused:** No

- **dashboard/page.tsx**
  - **Description:** Main dashboard page for CrewZen, showing company-specific stats and actions.
  - **Module:** CrewZen / Dashboard
  - **Used by:** CrewZen module routing
  - **Possibly unused:** No 

## Recent Updates (June 2025)

- **Componentization:** Many UI elements (trade dropdowns, cards, galleries) are now reusable components in `src/components/ui/` or `src/components/connectzen/cards/`.
- **TradeSelect:** New `TradeSelect` component fetches trades from Firestore and is used for filtering workers and companies in the marketplace.
- **Marketplace Data:** The business marketplace page (`businessMarketplacePage/page.tsx`) now fetches real data for workers, companies, and suppliers from Firestore. All mock data has been removed.
- **Public Profile Pages:** There are now dedicated public profile pages for workers (`worker/[workerId]/publicProfile/page.tsx`), with company and supplier public profiles coming soon. These pages use the same gallery, info, and contact components as the main app, but in read-only mode.
- **Portfolio & Documents:** PortfolioGallery and DocumentsUploader components are used for managing and displaying images and documents, with editing disabled in public views.
- **Navigation:** The main nav and dashboard buttons are now role-aware and route to the correct dashboard/profile for each user type.
- **Filtering:** All trade/industry dropdowns in the marketplace use the new TradeSelect component, ensuring consistency and up-to-date options from the database.

## Employee Profile Forms: Usage Trace (for Refactor)

### EmployeeForm (src/components/EmployeeForm.tsx)
- **Description:** Main form for adding/editing employee details (CrewZen onboarding and admin edit).
- **Used by:**
  - `src/components/crewzen/employees-page.tsx` (imported as EmployeeForm, used for onboarding and editing employees in CrewZen admin flow)
- **Notes:**
  - Handles onboarding and admin editing of employees.
  - Uses react-hook-form and Zod for validation.
  - (As of July 2025) Modern uploaders (PhotoUploader, DocumentsUploader) are being integrated here.

### EditProfileForm (src/components/crewzen/EditProfileForm.tsx)
- **Description:** Form for editing an employee's profile (possibly self-service or a different admin flow).
- **Used by:**
  - `src/components/crewzen/employees-page.tsx` (imported as EditProfileForm, used for edit flow)
  - `src/components/TestFormPage.tsx` (for testing)
- **Notes:**
  - Handles profile editing, with custom file input logic for photo, ID copy, and medical certificate.
  - Not currently using shared uploaders (should be refactored).

### Recommendation for Refactor
- **Unify these forms into a single, shared EmployeeProfileForm** with props to control which fields/sections are shown (onboarding, admin edit, self-edit, etc.).
- **Remove duplication** to make maintenance and feature updates easier.
- **Integrate shared uploaders** (PhotoUploader, DocumentsUploader) in the unified form. 

## CrewZen EmployeesPage Deep Dive: Onboarding vs. Editing Flows (July 2025)

### Onboarding (Add New Employee)
- **Step 1:**
  - Lines ~600–700: Renders `<UnifiedProfileForm mode="employee" ... />` for new employee info (name, contact, etc.).
  - Handles creation of new employee in Firestore and Auth.
- **Step 2:**
  - Lines ~710–740: Renders custom file inputs for profile photo and ID copy (not using shared uploaders yet).
  - Handles file upload and updates Firestore with photo/ID URLs.
- **Live Logic:**
  - UnifiedProfileForm is the live form for onboarding.
  - Custom file input logic is still live for onboarding step 2 (should be replaced with PhotoUploader/DocumentsUploader).

### Editing (Edit Existing Employee)
- **Dialog:**
  - Lines ~750–900: Renders `<EditProfileForm ... />` for editing an existing employee.
  - Handles profile editing, file uploads (photo, ID, medical certificate), and updates Firestore.
- **Live Logic:**
  - EditProfileForm is the live form for editing employees.
  - Uses custom file input logic for uploads (should be replaced with shared uploaders).

### Leftover/Legacy Logic
- **EmployeeForm.tsx:**
  - Not used anywhere else in the codebase. **Marked for removal.**
- **Custom file input logic:**
  - Present in both onboarding step 2 and EditProfileForm; should be unified and replaced with shared uploaders.

### Recommendations
- **Unify onboarding and editing flows to use a single EmployeeProfileForm** (with props for add/edit mode).
- **Replace all custom file input logic with PhotoUploader and DocumentsUploader.**
- **Remove EmployeeForm.tsx (marked for removal; not used anywhere else).**
- **Move all employee logic under /app/(modules)/crewzen/employees** for tidiness.

## Next Steps
- **Scan all usages** of employee forms/components in CrewZen and remove/replace any leftover or unused logic.
- **Unify to a single EmployeeProfileForm** for all onboarding/edit/edit flows.
- **Move all employee logic under /app/(modules)/crewzen/employees** for tidiness.
- **Update all imports and usages** to use the new unified form and shared uploaders. 