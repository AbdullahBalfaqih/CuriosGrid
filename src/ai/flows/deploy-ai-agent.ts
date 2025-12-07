'use server';

/**
 * @fileOverview This file defines a Genkit flow for deploying an AI agent to monitor and auto-reply to trending content.
 *
 * - deployAIAgent - An asynchronous function that deploys an AI agent based on the provided input.
 * - DeployAIAgentInput - The input type for the deployAIAgent function.
 * - DeployAIAgentOutput - The output type for the deployAIAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeployAIAgentInputSchema = z.object({
  topic: z.string().describe('The topic that the AI agent will monitor.'),
  language: z.string().describe('The language of the content to monitor (e.g., English, Arabic).'),
});

export type DeployAIAgentInput = z.infer<typeof DeployAIAgentInputSchema>;

const DeployAIAgentOutputSchema = z.object({
  name: z.string().describe('The name of the AI agent.'),
  status: z.string().describe('The status of the AI agent (e.g., Active, Inactive).'),
  preview: z.string().describe('A preview or summary of the AI agent configuration and actions.'),
});

export type DeployAIAgentOutput = z.infer<typeof DeployAIAgentOutputSchema>;

export async function deployAIAgent(input: DeployAIAgentInput): Promise<DeployAIAgentOutput> {
  return deployAIAgentFlow(input);
}

const deployAIAgentPrompt = ai.definePrompt({
  name: 'deployAIAgentPrompt',
  input: {schema: DeployAIAgentInputSchema},
  output: {schema: DeployAIAgentOutputSchema},
  prompt: `You are an AI agent deployment assistant. Based on the topic and language provided, generate a configuration for the AI agent.

Topic: {{{topic}}}
Language: {{{language}}}

Consider the best strategy to generate high user engagement.

Output the AI agent name, status and preview.
`,
});

const deployAIAgentFlow = ai.defineFlow(
  {
    name: 'deployAIAgentFlow',
    inputSchema: DeployAIAgentInputSchema,
    outputSchema: DeployAIAgentOutputSchema,
  },
  async input => {
    const {output} = await deployAIAgentPrompt(input);
    return output!;
  }
);
