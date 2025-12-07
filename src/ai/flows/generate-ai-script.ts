'use server';

/**
 * @fileOverview An AI agent to generate a short video script from a trending topic.
 *
 * - generateAiScript - A function that handles the video script generation process.
 * - GenerateAiScriptInput - The input type for the generateAiScript function.
 * - GenerateAiScriptOutput - The return type for the generateAiScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiScriptInputSchema = z.object({
  topic: z.string().describe('The trending topic to generate a video script for.'),
});
export type GenerateAiScriptInput = z.infer<typeof GenerateAiScriptInputSchema>;

const GenerateAiScriptOutputSchema = z.array(
  z.object({
    time: z.string().describe('The time in the video script.'),
    text: z.string().describe('The text for the video script at the given time.'),
  })
);
export type GenerateAiScriptOutput = z.infer<typeof GenerateAiScriptOutputSchema>;

export async function generateAiScript(input: GenerateAiScriptInput): Promise<GenerateAiScriptOutput> {
  return generateAiScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiScriptPrompt',
  input: {schema: GenerateAiScriptInputSchema},
  output: {schema: GenerateAiScriptOutputSchema},
  prompt: `You are an expert video script writer. Generate a short video script based on the following trending topic:\n\n{{topic}}\n\nThe video script should include the time and the text for each segment of the video.\n\nExample output:\n[{
"time": "0:00",
"text": "Hook: Did you see this?"
},
{
"time": "0:05",
"text": "[Trending topic] is trending everywhere."
},
{
"time": "0:15",
"text": "Here is what you need to know."
}]`,
});

const generateAiScriptFlow = ai.defineFlow(
  {
    name: 'generateAiScriptFlow',
    inputSchema: GenerateAiScriptInputSchema,
    outputSchema: GenerateAiScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
