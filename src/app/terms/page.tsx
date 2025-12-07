"use client";

import { useRef } from 'react';
import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TermsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageTitle = "Terms of Service";

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
            
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the CurioGrid website (the "Service") operated by CurioGrid ("us", "we", or "our").</p>
            <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
            
            <h2 className="text-3xl font-bold text-white">1. Accounts</h2>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            
            <h2 className="text-3xl font-bold text-white">2. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of CurioGrid and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of CurioGrid.</p>

            <h2 className="text-3xl font-bold text-white">3. Links To Other Web Sites</h2>
            <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by CurioGrid. CurioGrid has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that CurioGrid shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>

            <h2 className="text-3xl font-bold text-white">4. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

            <h2 className="text-3xl font-bold text-white">5. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
            
            <h2 className="text-3xl font-bold text-white">6. Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            
             <h2 className="text-3xl font-bold text-white">7. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
