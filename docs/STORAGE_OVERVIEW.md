# CrewZen Storage Overview

This document explains how your app uses **Firebase Storage** to handle files and uploads, in simple terms.

---

## What is Firebase Storage?
Firebase Storage is a cloud file storage system from Google. It's like a big online hard drive for your app. You use it to store files: photos, PDFs, ID documents, and more. Each file is stored at a "path" (like a folder structure).

---

## What Does Your App Store?
- **Profile photos** (for employees and workers)
- **ID copies** (scanned documents)
- **Medical certificates**
- **PDFs** (like access bundles for estates)
- **Other uploaded documents** (for onboarding, verification, etc.)

**Example storage paths:**
- `users/{userId}/profile.jpg` (profile photo)
- `users/{userId}/id-copy.jpg` (ID document)
- `accessBundles/{bundleId}.pdf` (PDFs for estate access)
- `workerProfiles/{workerId}/certificate.pdf` (worker certificates)

---

## How Do Uploads Work?
1. User selects a file (photo, document, etc.) in the app.
2. The app uploads it to a specific path in Firebase Storage.
3. The app gets a public URL or download link and saves it in Firestore (so you can display or download it later).

**Example:**
- Employee uploads a profile photo → stored at `users/abc123/profile.jpg` → URL saved in their Firestore profile.

---

## Storage Rules (Who Can Access What?)
**Current rules (for development):**
```js
rules_version = '2';
service firebase.storage {
  match /b/crewzen.firebasestorage.app/o {
    // DEVELOPMENT: WIDE OPEN ACCESS - ALLOW EVERYTHING
    // WARNING: This is for development only. Do NOT use in production!
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
- **Right now, anyone can read or write any file.**
- This is fine for development, but **not safe for production!**
- In production, you should lock it down so only the right users can access their own files.

**Example secure rule for production:**
```js
match /users/{userId}/{fileName} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

---

## Summary Table
| What's Stored                | Example Path                        | Who Should Access?         |
|------------------------------|-------------------------------------|----------------------------|
| Profile photo                | users/{userId}/profile.jpg          | That user, their company   |
| ID copy                      | users/{userId}/id-copy.jpg          | That user, their company   |
| Access bundle PDF            | accessBundles/{bundleId}.pdf        | Company, estate admin      |
| Worker certificate           | workerProfiles/{workerId}/certificate.pdf | That worker, company |
| ...                          | ...                                 | ...                        |

---

## In Plain English
- **Firebase Storage** is where all your app's files live.
- Each file has a path (like a folder and filename).
- You upload files, get a link, and save that link in Firestore.
- **Right now, your storage is wide open for dev.** For production, you'll want to lock it down so only the right people can see or upload files.

---

*Update this doc as your storage paths or rules change!* 