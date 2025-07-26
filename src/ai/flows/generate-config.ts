'use server';

/**
 * @fileOverview A flow to generate the `allowedDevOrigins` configuration snippet for `next.config.js`.
 *
 * - generateConfigSnippet - A function that takes an array of origins and returns a code snippet.
 * - GenerateConfigSnippetInput - The input type for the flow.
 * - GenerateConfigSnippetOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateConfigSnippetInputSchema = z.object({
  origins: z
    .array(z.string())
    .describe('An array of origins to allow for development.'),
});
export type GenerateConfigSnippetInput = z.infer<
  typeof GenerateConfigSnippetInputSchema
>;

const GenerateConfigSnippetOutputSchema = z.object({
  configSnippet: z
    .string()
    .describe(
      'A JavaScript code snippet containing the allowedDevOrigins configuration.'
    ),
});
export type GenerateConfigSnippetOutput = z.infer<
  typeof GenerateConfigSnippetOutputSchema
>;

export async function generateConfigSnippet(
  input: GenerateConfigSnippetInput
): Promise<GenerateConfigSnippetOutput> {
  return generateConfigSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConfigSnippetPrompt',
  input: {schema: GenerateConfigSnippetInputSchema},
  output: {schema: GenerateConfigSnippetOutputSchema},
  prompt: `You are a Next.js configuration expert. Given a list of origins,
generate a JavaScript code snippet that adds these origins to the
allowedDevOrigins array in the next.config.js file.

Origins:
{{#each origins}}- {{{this}}}
{{/each}}

Ensure the code snippet is properly formatted and includes the
allowedDevOrigins configuration within the nextConfig object.  If
allowedDevOrigins already exists, merge the new origins into the existing
array.  Make sure the origins are strings.

If the array is empty, return an empty array.

Respond only with the JavaScript code.
`,
});

const generateConfigSnippetFlow = ai.defineFlow(
  {
    name: 'generateConfigSnippetFlow',
    inputSchema: GenerateConfigSnippetInputSchema,
    outputSchema: GenerateConfigSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
