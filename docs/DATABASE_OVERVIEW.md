# CrewZen Database Overview

This document explains how your backend database (Firestore) is organized, in simple terms.

---

## What is Firestore?
Firestore is a cloud database from Google. It stores your app's data as "collections" (like folders) and "documents" (like files with info). Each document is a set of key-value pairs (like a mini-JSON file). It's real-time, so changes show up instantly in your app.

---

## Main Collections

| Collection Name         | What It Stores / Purpose                                 |
|------------------------|----------------------------------------------------------|
| `employees`            | Each document is an employee (name, email, company, etc.)|
| `workerProfiles`       | Public profiles for workers (skills, bio, photo, etc.)   |
| `connectZenCompanies`  | Company profiles (name, contact, industry, etc.)         |
| `settings`             | Company-wide or app-wide settings                        |
| `estates`              | Info about estates (for access control, forms, etc.)     |
| `projects`             | Project details (name, status, tasks, team, etc.)        |
| `reports`              | Reports generated in the app                             |
| `accessBundles`        | Bundles for estate access (PDFs, etc.)                   |
| `emailAccessBundles`   | Bundles sent by email                                    |
| `companyWorkerNotes`   | Private notes companies keep about workers               |
| `workerRatings`        | Ratings companies give to workers                        |
| `crewZenModules`       | Which companies have CrewZen enabled                     |
| `crewZenAttendance`    | Attendance records for employees                         |
| ...                    | (You may have more, but these are the main ones)         |

---

## Example Document Structures

**employees/{employeeId}**
```json
{
  "authUid": "abc123",
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "companyId": "company123",
  "role": "employee",
  "photoUrl": "...",
  "onboardingComplete": true
}
```

**workerProfiles/{workerId}**
```json
{
  "id": "worker123",
  "firstName": "Bob",
  "skills": ["Plumbing", "Electrical"],
  "bio": "Experienced plumber.",
  "photoUrl": "...",
  "availability": "available",
  "companyId": "company123"
}
```

**connectZenCompanies/{companyId}**
```json
{
  "companyName": "BuildCo",
  "contactPerson": "Jane Doe",
  "email": "contact@buildco.com",
  "industry": "Construction",
  "isVerified": true
}
```

**projects/{projectId}**
```json
{
  "name": "Downtown Office Building",
  "status": "In Progress",
  "companyId": "company123",
  "tasks": [
    { "id": "task1", "description": "Install plumbing", "status": "To Do" }
  ]
}
```

---

## How Data is Linked
- **Employees** have a `companyId` field to show which company they belong to.
- **WorkerProfiles** may have a `companyId` and are linked to employees by `authUid`.
- **Projects** have a `companyId` and may list employee IDs in their team/tasks.
- **Companies** are referenced by `companyId` in other collections.
- **Attendance, notes, ratings, etc.** are linked by employee or worker IDs.

---

*This doc is a simple map of your Firestore database. Update it as your collections or data structures change!* 