'use server';
/**
 * @fileOverview This file defines a Genkit flow for sending a welcome email to a new subscriber.
 *
 * - sendWelcomeEmail - An asynchronous function that sends a real, styled welcome email.
 * - SendWelcomeEmailInput - The input type for the sendWelcomeEmail function.
 * - SendWelcomeEmailOutput - The output type for the sendWelcomeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import nodemailer from 'nodemailer';

const SendWelcomeEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the new subscriber.'),
});
export type SendWelcomeEmailInput = z.infer<typeof SendWelcomeEmailInputSchema>;

const SendWelcomeEmailOutputSchema = z.object({
  message: z.string().describe('The status message of the email sending operation.'),
});
export type SendWelcomeEmailOutput = z.infer<typeof SendWelcomeEmailOutputSchema>;

const welcomeEmailPrompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: {schema: SendWelcomeEmailInputSchema},
  output: {schema: z.object({ subject: z.string(), body: z.string() }) },
  prompt: `You are a friendly community manager for CurioGrid. 
Generate a short and welcoming email for a new subscriber with the email "{{email}}".
The subject should be "Welcome to CurioGrid!".
The body text should thank them for joining and briefly mention they will get the latest AI trends. Keep it concise.`,
});

const createHtmlTemplate = (content: string) => {
  const primaryColor = '#BCF50F';
  const backgroundColor = '#0a0a0a';
  const cardColor = '#000000';
  const textColor = '#EAEAEA';
  const primaryTextColor = '#050505';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
            body {
                margin: 0;
                padding: 0;
                background-color: ${backgroundColor};
                font-family: 'Space Grotesk', sans-serif;
            }
            .container {
                padding: 40px;
                color: ${textColor};
            }
            .card {
                background-color: ${cardColor};
                border-radius: 1.5rem;
                padding: 32px;
                max-width: 600px;
                margin: auto;
                border: 1px solid #1a1a1a;
            }
            .logo-container {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 24px;
            }
            .logo {
                width: 40px;
                height: 40px;
                background-color: ${primaryColor};
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .logo svg {
                width: 24px;
                height: 24px;
                color: ${primaryTextColor};
            }
            .title {
                font-size: 24px;
                font-weight: 700;
                color: white;
            }
            p {
                font-size: 16px;
                line-height: 1.6;
                color: ${textColor};
            }
            .welcome-text {
                color: ${primaryColor};
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 1rem;
            }
            .footer {
                margin-top: 24px;
                font-size: 12px;
                color: #666;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="logo-container">
                    <div class="logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
                    <span class="title">CurioGrid</span>
                </div>
                <p class="welcome-text">Welcome aboard!</p>
                <p>${content}</p>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} CurioGrid. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<SendWelcomeEmailOutput> {
  // 1. Configure Nodemailer transporter using credentials from .env
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    throw new Error("Gmail credentials are not set in environment variables.");
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  // 2. Generate email content with AI
  const { output } = await welcomeEmailPrompt(input);
  if (!output) {
    throw new Error("Failed to generate email content.");
  }

  const { subject, body } = output;

  // 3. Create the styled HTML for the email
  const htmlBody = createHtmlTemplate(body);

  // 4. Define email options
  const mailOptions = {
    from: `"CurioGrid" <${process.env.GMAIL_USER}>`,
    to: input.email,
    subject: subject,
    html: htmlBody,
  };

  // 5. Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email successfully sent to ${input.email}`);
    return { message: `Welcome email successfully sent to ${input.email}` };
  } catch (error) {
    console.error('Failed to send email:', error);
    // In a real app, you might want to throw a more specific error
    throw new Error('Could not send the welcome email.');
  }
}
