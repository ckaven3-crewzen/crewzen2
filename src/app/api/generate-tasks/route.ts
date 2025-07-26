import { NextRequest, NextResponse } from 'next/server';
import { generateTasksFromAudio } from '@/ai/flows/generate-tasks-from-audio';

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  if (!transcript) {
    return NextResponse.json({ error: 'No transcript provided.' }, { status: 400 });
  }
  const tasks = await generateTasksFromAudio({ transcript });
  return NextResponse.json({ tasks });
} 