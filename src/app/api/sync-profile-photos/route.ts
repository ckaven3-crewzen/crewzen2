import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { authUid, photoUrl, idCopyUrl } = await request.json();
    if (!authUid) {
      return NextResponse.json({ error: 'Missing authUid' }, { status: 400 });
    }
    const updates: any = {};
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (idCopyUrl !== undefined) updates.idCopyUrl = idCopyUrl;

    // Update employees collection
    const empQuery = db.collection('employees').where('authUid', '==', authUid);
    const empSnap = await empQuery.get();
    empSnap.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      doc.ref.update(updates);
    });

    // Update workerProfiles collection
    let workerQuery = db.collection('workerProfiles').where('authUid', '==', authUid);
    let workerSnap = await workerQuery.get();
    if (workerSnap.empty) {
      // Backward compatibility: also check for 'id' field
      workerQuery = db.collection('workerProfiles').where('id', '==', authUid);
      workerSnap = await workerQuery.get();
    }
    workerSnap.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      doc.ref.update(updates);
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to sync profile photos' }, { status: 500 });
  }
} 