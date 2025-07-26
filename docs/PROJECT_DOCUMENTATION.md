# Project Documentation

## 1. Project Overview
CrewZen is a modular project management platform for construction and workforce management. It is built with Next.js, Firebase, TypeScript, and Genkit AI. The platform supports:
- Project tracking and management (ProZen)
- Employee onboarding and management (CrewZen)
- Company and worker marketplace (ConnectZen)
- AI-powered voice-to-task (create tasks from voice notes)
- Real-time updates, notifications, and document/photo uploads

**Tech stack:** Next.js, Firebase (Firestore, Auth, Storage), Genkit AI (Google AI), Radix UI, TypeScript

## 2. Getting Started
- **Prerequisites:**
  - Node.js v18+
  - npm or yarn
- **Installation:**
  1. Clone the repo: `git clone <your-repo-url>`
  2. Install dependencies: `npm install` or `yarn install`
- **Environment Variables:**
  - Copy `.env.example` to `.env`
  - Add your API keys (see below for details)
- **Run Locally:**
  - `npm run dev` or `yarn dev`
  - Open [http://localhost:3000](http://localhost:3000)

## 3. Folder Structure
- `src/` - Main source code
  - `app/` - Next.js app structure (routes, pages, API endpoints)
    - `(modules)/prozen/` - Project management (ProZen)
    - `(modules)/crewzen/` - Employee management (CrewZen)
    - `(modules)/connectzen/` - Company/worker marketplace (ConnectZen)
    - `api/` - API routes (e.g., AI, onboarding, sync)
  - `components/` - UI components (modular tabs, forms, dialogs, etc.)
  - `ai/` - AI flows and Genkit setup (voice-to-task, config)
  - `lib/` - Utilities, Firebase config, types
  - `hooks/` - Custom React hooks
- `docs/` - Documentation and diagrams
- `public/` - Static assets (icons, manifest, etc.)
- `tests/` - Test files and assets

## 4. Configuration
- **Environment Variables:**
  - `GOOGLE_AI_API_KEY` — Required for AI voice-to-task (Google AI)
  - `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc. — Your Firebase project keys
  - (See `.env.example` for a full list)
- **Config Files:**
  - `firebase.json` — Firebase project config
  - `firestore.rules`, `storage.rules` — Security rules for Firestore and Storage
  - `next.config.ts` — Next.js configuration
- **Secrets Management:**
  - Never commit `.env` or `.env.local` to git (they are in `.gitignore`)
  - Store secrets securely in your deployment environment (e.g., Vercel dashboard)

## 5. Usage Guide
### Main Features
- **Project Management (ProZen):**
  - Create, view, and manage projects
  - Add, edit, and delete tasks (with photo upload)
  - Use the AI voice-to-task feature to generate tasks from voice notes
  - Assign team members and track project progress
- **Employee Onboarding (CrewZen):**
  - Add new employees with a step-by-step onboarding flow
  - Upload profile photos and ID documents
  - Edit employee details and sync with worker profiles
  - Delete employees (with confirmation)
- **Company & Worker Marketplace (ConnectZen):**
  - Companies can browse and hire workers
  - Workers can sign up and create profiles
- **AI Voice-to-Task:**
  - Click the "Voice Note" button in the Tasks tab of a project
  - Speak your tasks; the AI will transcribe and generate actionable tasks
  - Tasks are added to the project automatically

### Employee Onboarding & Editing Flow (CrewZen)
- **Add New Employee:**
  - Click "Add Employee" to open the onboarding dialog.
  - Step 1: Fill in personal info (name, email, password, etc.) and submit.
    - The system creates a Firebase Auth user and Firestore documents for both employee and worker profile.
    - If successful, moves to Step 2.
  - Step 2: Upload required documents (profile photo, ID copy).
    - Files are uploaded to Firebase Storage and URLs are saved in Firestore.
    - On completion, onboarding is marked as complete and the dialog closes.
- **First Login (Two-Step Onboarding):**
  - When a company adds an employee, the worker profile is created with availability: 'working'.
  - After onboarding, when the employee logs in for the first time, they are shown the attendance toggle.
  - After submitting attendance, the system checks if their WorkerProfile (public profile) is complete (fields: availability, tradeTags, skills, yearsExperience, preferredRate, bio, location).
  - If incomplete, the employee is redirected to a "Complete Your Profile" form to fill in public fields.
  - After completing their profile, the employee is redirected to the Business Marketplace.
- **Edit Employee:**
  - Click the edit button on an employee in the list.
  - Edit details and upload new files if needed (photo, ID, medical certificate).
  - Only changed files are uploaded; URLs are updated in Firestore.
  - Modular dialogs handle cropping, camera capture, and file selection.
  - Toast notifications provide feedback for all actions.
- **Delete Employee:**
  - Click the delete button and confirm in the dialog.
  - Employee data and files are removed from Firestore and Storage.
- **Modular Dialogs Used:**
  - `EmployeeDeleteDialog`, `EmployeeCameraDialog`, `EmployeeImageCropperDialog`, `EmployeeZoomedImageModal`, and `UnifiedProfileForm` for onboarding/editing.

> **Note:** The onboarding flow now includes a profile completion check after attendance. Employees must complete their public WorkerProfile before accessing the Business Marketplace.

### UI Walkthrough
- The app uses a tabbed interface for easy navigation between Projects, Employees, Reports, etc.
- Dialogs and steppers guide users through onboarding and task creation
- Toast notifications provide feedback for all major actions

### API Endpoints
- `/api/generate-tasks` — POST endpoint for AI voice-to-task
- `/api/create-employee` — Create a new employee (used in onboarding)
- `/api/sync-profile-photos` — Syncs photo URLs between collections

## 6. Development Guide
- **Coding Standards:**
  - Use TypeScript for all code (type safety is enforced)
  - Use functional React components and hooks
  - Keep components modular and focused (one feature per file)
  - Use toast notifications for user feedback
  - Keep business logic out of UI components when possible (use `lib/` or hooks)
- **TypeScript Usage:**
  - Define types and interfaces in `src/lib/types.ts`
  - Use Zod for schema validation (especially for forms and API inputs)
- **Component Structure:**
  - Each major tab/page is a self-contained component (e.g., `TasksTab.tsx`, `TeamTab.tsx`)
  - Reusable dialogs and forms are in `components/`
- **How to Add a New Feature:**
  1. Create a new component in `components/` or a new route in `app/`
  2. Add any new types to `lib/types.ts`
  3. Add state and handlers in the new component (not in parent pages)
  4. Use toast notifications for errors/success
  5. Add/update tests in `tests/`
- **How to Write and Run Tests:**
  - Place test files in `tests/`
  - Use your preferred test runner (e.g., Jest, Playwright)
  - Run tests with `npm test` or `yarn test`

## 7. Deployment Instructions
- **Build Steps:**
  - Run `npm run build` or `yarn build` to create a production build
- **Deployment:**
  - **Vercel:**
    - Connect your repo to Vercel
    - Set environment variables in the Vercel dashboard
    - Deploy with one click or on push to `main`
  - **Firebase Hosting:**
    - Set up Firebase CLI (`npm install -g firebase-tools`)
    - Run `firebase login` and `firebase init`
    - Deploy with `firebase deploy`
- **CI/CD:**
  - Set up GitHub Actions or Vercel's built-in CI for automated deploys

## 8. Testing
- **How to Run Tests:**
  - Place test files in the `tests/` directory
  - Run `npm test` or `yarn test` (configure your test runner as needed)
- **Test Coverage:**
  - Aim to cover all major features and flows (onboarding, task management, AI, etc.)
- **How to Write New Tests:**
  - Use descriptive test names
  - Test both success and error cases
  - Use test assets in `tests/assets/`