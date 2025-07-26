import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, rate, idNumber, companyId } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 }
      );
    }

    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const uid = userRecord.uid;

    // Create the employee document in Firestore
    const employeeData = {
      authUid: uid,
      firstName,
      lastName,
      email,
      phone: phone || '',
      rate: rate || 0,
      idNumber: idNumber || '',
      companyId: companyId || '',
      role: 'employee',
      createdAt: new Date(),
      onboardingComplete: false, // Will be set to true after document upload
    };

    await db.collection('employees').doc(uid).set(employeeData);

    // Create a minimal workerProfile for marketplace compatibility
    const workerProfileData = {
      authUid: uid,
      firstName,
      lastName,
      email,
      phone: phone || '',
      rate: rate || 0,
      idNumber: idNumber || '',
      availability: 'available', // Default availability
      isPublic: true, // Default to public - workers can opt-out later
      allowDirectContact: true, // Allow direct contact by default
      autoAcceptJobs: false, // Require manual job acceptance
      createdAt: new Date(),
      onboardingComplete: false, // Will be set to true after document upload
    };

    await db.collection('workerProfiles').doc(uid).set(workerProfileData);

    return NextResponse.json({
      success: true,
      uid,
      message: 'Employee created successfully'
    });

  } catch (error: any) {
    console.error('Error creating employee:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password is too weak' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
} 