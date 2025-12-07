'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating social media posts based on a trending topic.
 *
 * The flow takes a trending topic as input and returns a generated social media post.
 * It exports the GenerateSocialMediaPostInput and GenerateSocialMediaPostOutput types, as well as the generateSocialMediaPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaPostInputSchema = z.object({
  topic: z.string().describe('The trending topic to generate a social media post about.'),
  platform: z.enum(['Twitter', 'LinkedIn']).default('Twitter').describe('The social media platform to generate the post for.'),
});
export type GenerateSocialMediaPostInput = z.infer<typeof GenerateSocialMediaPostInputSchema>;

const GenerateSocialMediaPostOutputSchema = z.object({
  post: z.string().describe('The generated social media post.'),
});
export type GenerateSocialMediaPostOutput = z.infer<typeof GenerateSocialMediaPostOutputSchema>;

export async function generateSocialMediaPost(input: GenerateSocialMediaPostInput): Promise<string> {
  const result = await generateSocialMediaPostFlow(input);
  return result.post;
}

const generateSocialMediaPostPrompt = ai.definePrompt({
  name: 'generateSocialMediaPostPrompt',
  input: {schema: GenerateSocialMediaPostInputSchema},
  output: {schema: GenerateSocialMediaPostOutputSchema},
  prompt: `You are a social media expert. Generate a social media post about the following topic for {{platform}}:

Topic: {{topic}}`,
});

const generateSocialMediaPostFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaPostFlow',
    inputSchema: GenerateSocialMediaPostInputSchema,
    outputSchema: GenerateSocialMediaPostOutputSchema,
  },
  async input => {
    const {output} = await generateSocialMediaPostPrompt(input);
    return output || {post: ''};
  }
);
