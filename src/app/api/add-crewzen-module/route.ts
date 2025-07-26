console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { db } from '@/lib/firebase';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    const { companyId, companyName } = await req.json();
    console.log('DEBUG: companyId from body:', companyId, 'companyName:', companyName, 'decodedToken.uid:', decodedToken.uid);
    if (!companyId || !companyName) {
      return NextResponse.json({ error: 'Missing companyId or companyName' }, { status: 400 });
    }
    // Only allow the company itself to enable CrewZen
    if (decodedToken.uid !== companyId) {
      return NextResponse.json({ error: 'Unauthorized: You can only enable CrewZen for your own company.' }, { status: 403 });
    }
    // Write to Firestore: crewZenModules/{companyId}
    await setDoc(doc(db, 'crewZenModules', companyId), {
      companyName,
      enabled: true,
      updatedAt: Date.now(),
    }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
} 