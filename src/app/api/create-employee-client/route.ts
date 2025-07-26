import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('API: create-employee-client route called');
    const body = await request.json();
    console.log('API: Request body:', { 
      ...body, 
      password: body.password ? '********' : undefined 
    });
    
    const { email, password, firstName, lastName, phone, rate, idNumber, companyId, role, companyNumber } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 }
      );
    }

    // Try to create the user using Firebase Admin SDK
    console.log('API: Creating user in Firebase Auth using Admin SDK');
    try {
      // Create user with email and password using Admin SDK
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false,
      });
      
      console.log('API: User created successfully with UID:', userRecord.uid);
      
      const uid = userRecord.uid;
      
      // Create the employee document in Firestore using Admin SDK
      console.log('API: Creating employee document in Firestore');
      const employeeData = {
        authUid: uid,
        firstName,
        lastName,
        email,
        phone: phone || '',
        rate: rate || 0,
        idNumber: idNumber || '',
        companyId: companyId || '',
        role: role || 'employee',
        companyNumber: companyNumber || '',
        createdAt: new Date(),
        onboardingComplete: false, // Will be set to true after document upload
      };

      await adminDb.collection('employees').doc(uid).set(employeeData);
      console.log('API: Employee document created successfully');

      // Create a minimal workerProfile for marketplace compatibility
      console.log('API: Creating worker profile document in Firestore');
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

      await adminDb.collection('workerProfiles').doc(uid).set(workerProfileData);
      console.log('API: Worker profile document created successfully');

      console.log('API: Employee creation completed successfully');
      return NextResponse.json({
        success: true,
        uid,
        message: 'Employee created successfully'
      });
    } catch (authError: any) {
      console.error('API: Error creating user with Admin SDK:', authError);
      // Add more detailed error output
      return NextResponse.json(
        {
          error: 'Error creating user with Admin SDK',
          code: authError.code || null,
          message: authError.message || null,
          stack: authError.stack || null,
          raw: JSON.stringify(authError, Object.getOwnPropertyNames(authError))
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API: Error creating employee:', error);
    // Add more detailed error output
    return NextResponse.json(
      {
        error: 'General error in create-employee-client',
        code: error.code || null,
        message: error.message || null,
        stack: error.stack || null,
        raw: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}