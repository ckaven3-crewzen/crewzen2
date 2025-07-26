# Firebase Admin Debug & Setup Guide (CrewZen)

## 1. Required Environment Variables

Add this to your `.env.local` (do **not** commit to git):
```
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\<your-username>\AppData\Roaming\gcloud\application_default_credentials.json
GOOGLE_CLOUD_PROJECT=crewzen
```
- Replace `<your-username>` with your Windows username.
- Do **not** add any other Firebase Admin env vars unless specifically needed.

## 2. Setting Up ADC (Application Default Credentials)

1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Run in terminal:
   ```
   gcloud auth application-default login
   ```
   - This will open a browser for you to log in.
   - It creates the ADC file at the path above.

## 3. Testing Token Verification (Node.js Script)

Create a file `test-firebase.js`:
```js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({ credential: applicationDefault() });

// Paste a real Firebase ID token here (from browser network tab, after 'Bearer ')
const idToken = 'PASTE_YOUR_ID_TOKEN_HERE';

getAuth().verifyIdToken(idToken)
  .then(decoded => console.log('Decoded:', decoded))
  .catch(err => console.error('Error:', err));
```
- Run with: `node test-firebase.js`
- If you see `Decoded: ...`, your setup is correct.

## 4. Common Errors & Solutions

- **Missing/invalid GOOGLE_APPLICATION_CREDENTIALS:**
  - Make sure `.env.local` is correct and restart dev server.
- **Missing GOOGLE_CLOUD_PROJECT:**
  - Add to `.env.local` and restart dev server.
- **"Decoding Firebase ID token failed":**
  - Make sure you pasted the full ID token, no line breaks or spaces.
- **401 Unauthorized in API route:**
  - Make sure frontend and backend use the same Firebase project.
  - Make sure you are signed in and sending the correct token.

## 5. Debug Log Lines for API Route

Add to the top of your API route for troubleshooting:
```js
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
```
Add before verifying the token:
```js
console.log('DEBUG: companyId from body:', companyId, 'companyName:', companyName, 'decodedToken.uid:', decodedToken.uid);
```

## 6. Restarting the Dev Server

- Always restart your dev server after changing `.env.local`:
  - `Ctrl+C` to stop
  - `npm run dev` to start

## 7. Locking Down Settings

- Do **not** change these settings or credentials without admin approval.
- Save this document for future reference.
- If you need to debug again, follow these steps exactly.

---
**This doc is your "break glass in case of emergency" guide for Firebase Admin authentication issues.** 