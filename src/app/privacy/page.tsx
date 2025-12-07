"use client";

import { useRef } from 'react';
import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PrivacyPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageTitle = "Privacy Policy";

  const handleDownload = () => {
    if (!contentRef.current) return;

    const contentHtml = contentRef.current.innerHTML;
    const reportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${pageTitle}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
                body { background-color: #050505; color: #EAEAEA; font-family: 'Space Grotesk', sans-serif; padding: 40px; }
                .container { max-width: 800px; margin: auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 1.5rem; padding: 40px; }
                h1, h2 { color: #BCF50F; }
                h1 { font-size: 2.5rem; margin-bottom: 2rem; border-bottom: 2px solid #BCF50F; padding-bottom: 1rem; }
                h2 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; }
                p, li { font-size: 1.1rem; line-height: 1.6; color: #d1d1d1; }
                ul { list-style-position: inside; padding-left: 0; }
                a { color: #BCF50F; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
              <h1>${pageTitle}</h1>
              ${contentHtml}
            </div>
        </body>
        </html>
    `;
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curiogrid-${pageTitle.toLowerCase().replace(/ /g, '-')}.html`;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Link href="/">
                <CurioGridLogo />
              </Link>
              <span className="hidden sm:inline text-2xl font-bold tracking-tight">CurioGrid</span>
           </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-24 w-full flex-1">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-5xl font-bold text-white">{pageTitle}</h1>
            <Button onClick={handleDownload} variant="outline" className="bg-neutral-800 border-border hover:bg-neutral-700">
                <Download size={18} className="mr-2" />
                Download
            </Button>
        </div>
        <div ref={contentRef} className="prose prose-invert prose-lg text-neutral-300 max-w-none space-y-6">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
            
            <p>Your privacy is important to us. It is CurioGrid's policy to respect your privacy regarding any information we may collect from you across our website.</p>

            <h2 className="text-3xl font-bold text-white">1. Information We Collect</h2>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>

            <h2 className="text-3xl font-bold text-white">2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                <li>Send you emails</li>
                <li>Find and prevent fraud</li>
            </ul>

            <h2 className="text-3xl font-bold text-white">3. Log Files</h2>
            <p>CurioGrid follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>
            
            <h2 className="text-3xl font-bold text-white">4. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

            <h2 className="text-3xl font-bold text-white">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us by visiting the contact page on our website.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
