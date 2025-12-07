import { config } from 'dotenv';
config();

import '@/ai/flows/generate-social-media-post.ts';
import '@/ai/flows/generate-ai-script.ts';
import '@/ai/flows/deploy-ai-agent.ts';
import '@/ai/flows/generate-image-prompt.ts';
import '@/ai/flows/send-welcome-email.ts';
import '@/ai/flows/send-contact-email.ts';
