'use server';

/**
 * @fileOverview A flow to generate structured tasks from voice notes using AI transcription and analysis.
 *
 * - generateTasksFromAudio - A function that takes audio data and returns structured tasks.
 * - GenerateTasksFromAudioInput - The input type for the generateTasksFromAudio function.
 * - GenerateTasksFromAudioOutput - The return type for the generateTasksFromAudio function.
 */

import { config } from 'dotenv';
import path from 'path';
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {AITask} from '@/lib/types';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const GenerateTasksFromAudioInputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the user\'s voice note'),
});
export type GenerateTasksFromAudioInput = z.infer<typeof GenerateTasksFromAudioInputSchema>;

const GenerateTasksFromAudioOutputSchema = z.object({
  tasks: z.array(z.object({
    description: z.string().describe('The full, detailed description of a single, actionable task.'),
    trade: z.string().describe('The trade skill required for this task (e.g., Painting, Tiling, Plumbing, Electrical, Carpentry, General Labor).'),
  })).describe('Array of structured tasks extracted from the voice note'),
});
export type GenerateTasksFromAudioOutput = z.infer<typeof GenerateTasksFromAudioOutputSchema>;

export async function generateTasksFromAudio(input: GenerateTasksFromAudioInput): Promise<AITask[]> {
  try {
    // Check if AI is properly configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY not configured. AI features are disabled.');
      throw new Error('AI service not configured. Please set up GOOGLE_AI_API_KEY in your environment variables.');
    }

    const result = await generateTasksFromAudioFlow(input);
    return result.tasks;
  } catch (error) {
    console.error('Error generating tasks from audio:', error);
    
    // Return a helpful error message as a task
    if (error instanceof Error && error.message.includes('AI service not configured')) {
      return [{
        description: 'AI service not configured. Please set up GOOGLE_AI_API_KEY in your environment variables.',
        trade: 'System'
      }];
    }
    
    return [{
      description: 'Failed to process voice note. Please try again or check your internet connection.',
      trade: 'System'
    }];
  }
}

const generateTasksFromAudioFlow = ai.defineFlow(
  {
    name: 'generateTasksFromAudioFlow',
    inputSchema: GenerateTasksFromAudioInputSchema,
    outputSchema: GenerateTasksFromAudioOutputSchema,
  },
  async input => {
    const transcript = input.transcript;
    if (!transcript || transcript.trim() === '') {
      return { tasks: [{ description: 'No transcript provided. Please try again.', trade: 'System' }] };
    }
    const prompt = `You are an expert construction project manager. A user has recorded a voice note about construction tasks. Here is the transcript: "${transcript}"

Extract ONLY the specific task or tasks that the user explicitly mentions in the transcript. Do NOT infer, expand, or add extra steps. Return only what the user actually said, as clear, actionable tasks. For each task, provide:
1. A clear, concise description (use the user's wording as much as possible)
2. The appropriate trade (Painting, Tiling, Plumbing, Electrical, Carpentry, General Labor, etc.)

If the transcript does not contain a clear task, return an empty list.`;
    console.log('AI TASK GENERATION DEBUG:');
    console.log('Transcript:', transcript);
    console.log('Prompt sent to AI:', prompt);
    const taskAnalysis = await ai.generate({
      prompt,
      output: {schema: GenerateTasksFromAudioOutputSchema},
    });
    console.log('AI raw output:', taskAnalysis);
    const tasks = taskAnalysis.output?.tasks ?? [];
    console.log('Parsed tasks returned to frontend:', tasks);
    return { tasks };
  }
); 