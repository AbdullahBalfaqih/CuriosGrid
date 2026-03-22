'use server';

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const EstimateContentValueInputSchema = z.object({
  topic: z.string().describe('The topic of the content to be valued.'),
  hash: z.string().describe('The unique hash of the content.'),
});
export type EstimateContentValueInput = z.infer<typeof EstimateContentValueInputSchema>;

const EstimateContentValueOutputSchema = z.object({
  estimatedValue: z.number().describe('The estimated auction value in SOL.'),
  justification: z.string().describe('A brief justification for the estimated value.'),
});
export type EstimateContentValueOutput = z.infer<typeof EstimateContentValueOutputSchema>;

export async function estimateContentValue(input: EstimateContentValueInput): Promise<EstimateContentValueOutput> {
  return estimateContentValueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateContentValuePrompt',
  input: {schema: EstimateContentValueInputSchema},
  output: {schema: EstimateContentValueOutputSchema},
  prompt: `You are a digital asset valuation expert specializing in the Solana NFT market.
  Your task is to estimate the potential starting auction price for a piece of AI-generated content based on its topic.

  Topic: "{{topic}}"

  Consider factors like:
  - The topic's current relevance and potential for viral spread.
  - The likely demand for content related to this topic.
  - Rarity and uniqueness of AI-generated assets.

  Provide an estimated value in SOL and a short, one-sentence justification. The value should be a number between 0.5 and 15.0 SOL. Be realistic but optimistic.
  `,
  model: 'googleai/gemini-2.5-flash',
});

const estimateContentValueFlow = ai.defineFlow(
  {
    name: 'estimateContentValueFlow',
    inputSchema: EstimateContentValueInputSchema,
    outputSchema: EstimateContentValueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
