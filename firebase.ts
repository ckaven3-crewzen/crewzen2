
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAid5pJTNJ7BPXSIee2czPC5epvIHB4Kr4",
  authDomain: "crewzen.firebaseapp.com",
  projectId: "crewzen",
  storageBucket: "crewzen.firebasestorage.app",
  messagingSenderId: "274536388714",
  appId: "1:274536388714:web:7e3d7b6b5d73c220cb5213"
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const auth: Auth = getAuth(app);

export { app, db, storage, auth };
