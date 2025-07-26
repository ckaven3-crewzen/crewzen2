import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { dataUrl, path, userId } = await request.json();

    if (!dataUrl || !path || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: dataUrl, path, userId' },
        { status: 400 }
      );
    }

    // Convert data URL to buffer
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // IMPORTANT: Use the correct Firebase Storage bucket name for this project!
    // crewzen.firebasestorage.app is the correct bucket, NOT crewzen.appspot.com
    const bucket = admin.storage().bucket('crewzen.firebasestorage.app');
    
    // Create file reference
    const file = bucket.file(path);
    
    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    });

    // Get the public URL (with uniform bucket-level access, files are already publicly readable)
    // IMPORTANT: Use the correct bucket name in the public URL!
    const publicUrl = `https://storage.googleapis.com/crewzen.firebasestorage.app/${path}`;

    console.log(`File uploaded successfully: ${path}`);
    console.log(`Public URL: ${publicUrl}`);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: path 
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 