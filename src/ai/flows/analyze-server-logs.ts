'use server';

/**
 * @fileOverview A flow to analyze Next.js server logs for cross-origin request errors and suggest origins for `allowedDevOrigins`.
 *
 * - analyzeServerLogs - A function that takes server logs as input and returns suggested origins.
 * - AnalyzeServerLogsInput - The input type for the analyzeServerLogs function.
 * - AnalyzeServerLogsOutput - The return type for the analyzeServerLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeServerLogsInputSchema = z.object({
  serverLogs: z
    .string()
    .describe('The Next.js server logs to analyze.'),
});
export type AnalyzeServerLogsInput = z.infer<typeof AnalyzeServerLogsInputSchema>;

const AnalyzeServerLogsOutputSchema = z.object({
  suggestedOrigins: z.array(z.string()).describe('The suggested origins to add to `allowedDevOrigins`.'),
});
export type AnalyzeServerLogsOutput = z.infer<typeof AnalyzeServerLogsOutputSchema>;

export async function analyzeServerLogs(input: AnalyzeServerLogsInput): Promise<AnalyzeServerLogsOutput> {
  return analyzeServerLogsFlow(input);
}

const analyzeServerLogsFlow = ai.defineFlow(
  {
    name: 'analyzeServerLogsFlow',
    inputSchema: AnalyzeServerLogsInputSchema,
    outputSchema: AnalyzeServerLogsOutputSchema,
  },
  async input => {
    const prompt = `You are an expert Next.js server log analyzer.

    Your job is to analyze the provided server logs and identify any cross-origin request errors.
    Extract the origins from the error messages and return them as a list of suggested origins to add to the \`allowedDevOrigins\` configuration in next.config.js.

    Here are the server logs:
    ${input.serverLogs}

    If there are no cross-origin request errors, return an empty list.
    Origins should be returned without any surrounding characters like quotes.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {schema: AnalyzeServerLogsOutputSchema},
    });

    const suggestedOrigins = llmResponse.output?.suggestedOrigins ?? [];

    return {suggestedOrigins};
  }
);
