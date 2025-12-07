'use server';
/**
 * @fileOverview This file defines a Genkit flow for handling contact form submissions.
 * It sends an email to the admin with the user's message and a confirmation email to the user.
 *
 * - sendContactEmail - An asynchronous function that orchestrates the email sending process.
 * - SendContactEmailInput - The input type for the sendContactEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendContactEmailInputSchema = z.object({
  name: z.string().describe("The user's name."),
  email: z.string().email().describe("The user's email address."),
  message: z.string().describe("The user's message."),
});
export type SendContactEmailInput = z.infer<typeof SendContactEmailInputSchema>;

// Helper function to create a consistent email template
const createEmailTemplate = (title: string, content: string) => {
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
            body { margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: 'Space Grotesk', sans-serif; }
            .container { padding: 40px; color: ${textColor}; }
            .card { background-color: ${cardColor}; border-radius: 1.5rem; padding: 32px; max-width: 600px; margin: auto; border: 1px solid #1a1a1a; }
            .logo-container { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
            .logo { width: 40px; height: 40px; background-color: ${primaryColor}; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .logo svg { width: 24px; height: 24px; color: ${primaryTextColor}; }
            .title { font-size: 24px; font-weight: 700; color: white; }
            p { font-size: 16px; line-height: 1.6; color: ${textColor}; margin: 1rem 0; }
            .content-title { color: ${primaryColor}; font-size: 20px; font-weight: bold; margin-bottom: 1rem; }
            .footer { margin-top: 24px; font-size: 12px; color: #666; text-align: center; }
            .data-block { background-color: #1a1a1a; padding: 16px; border-radius: 8px; margin-top: 1rem; }
            .data-block p { margin: 0.5rem 0; }
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
                <h2 class="content-title">${title}</h2>
                ${content}
                <div class="footer">
                    &copy; ${new Date().getFullYear()} CurioGrid. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const sendContactEmail = ai.defineFlow(
  {
    name: 'sendContactEmailFlow',
    inputSchema: SendContactEmailInputSchema,
    outputSchema: z.object({ status: z.string() }),
  },
  async (input) => {
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

    // 1. Email to Admin
    const adminMailContent = createEmailTemplate(
        "New Contact Form Submission",
        `<p>You have received a new message from your website's contact form.</p>
         <div class="data-block">
            <p><strong>Name:</strong> ${input.name}</p>
            <p><strong>Email:</strong> ${input.email}</p>
            <p><strong>Message:</strong></p>
            <p>${input.message}</p>
         </div>`
    );
    
    const adminMailOptions = {
        from: `"CurioGrid Notifier" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // Send to your own email
        subject: `New Message from ${input.name}`,
        html: adminMailContent,
    };

    // 2. Confirmation Email to User
    const userMailContent = createEmailTemplate(
        `Hi ${input.name}, we've received your message!`,
        `<p>Thank you for reaching out to CurioGrid. We've successfully received your message and will get back to you as soon as possible.</p>
         <p>Here's a copy of your submission for your records:</p>
         <div class="data-block">
            <p>${input.message}</p>
         </div>`
    );

    const userMailOptions = {
        from: `"CurioGrid" <${process.env.GMAIL_USER}>`,
        to: input.email,
        subject: "We've Received Your Message | CurioGrid",
        html: userMailContent,
    };

    try {
      // Send both emails
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(userMailOptions);

      console.log(`Contact form emails sent successfully for submission from ${input.email}`);
      return { status: 'success' };

    } catch (error) {
      console.error('Failed to send contact emails:', error);
      throw new Error('Could not send contact form emails.');
    }
  }
);
