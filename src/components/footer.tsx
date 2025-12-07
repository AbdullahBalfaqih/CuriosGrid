"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';
import { CurioGridLogo } from './trend-pulse-logo';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/ai/flows/send-welcome-email';

const SocialIcon = ({ href, src, alt }: { href: string, src: string, alt: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block w-8 h-8 p-2 bg-white rounded-md hover:bg-neutral-200 transition-colors">
        <Image src={src} alt={alt} width={16} height={16} className="w-full h-full object-contain" />
    </a>
)

const ShootingStar = ({ id }: { id: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  React.useEffect(() => {
    const startLeft = Math.random() * 150 - 25 + '%'; 
    const delay = Math.random() * 10 + 's';
    const duration = Math.random() * 3 + 4 + 's'; 

    setStyle({
      left: startLeft,
      top: '-20%',
      animationDelay: delay,
      animationDuration: duration,
    });
  }, [id]);

  return (
    <div 
      className="absolute bg-white rounded-full opacity-0 shooting-star-line"
      style={style}
    >
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
    </div>
  );
};

const StaticStar = ({ id }: { id: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  React.useEffect(() => {
    setStyle({
      position: 'absolute',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      backgroundColor: 'white',
      borderRadius: '50%',
      opacity: Math.random() * 0.5 + 0.2,
    });
  }, [id]);

  return <div style={style} />;
};


export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({
            variant: "destructive",
            title: "Email Required",
            description: "Please enter your email address to subscribe.",
        });
        return;
    }
    
    setIsLoading(true);

    try {
        await sendWelcomeEmail({ email });
        toast({
            title: "Subscribed!",
            description: "Thanks for joining! A welcome email is on its way.",
        });
        setEmail('');
    } catch (error) {
        console.error("Subscription failed:", error);
        toast({
            variant: "destructive",
            title: "Subscription Failed",
            description: "Could not subscribe. Please try again later.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <footer className="relative w-full overflow-hidden mt-24 bg-background">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 100 }).map((_, i) => (
                  <StaticStar key={`static-${i}`} id={i} />
              ))}
             {Array.from({ length: 8 }).map((_, i) => (
                  <ShootingStar key={`shooting-${i}`} id={i} />
              ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-white">
            <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-4xl md:text-5xl font-bold mb-4">Join our AI-powered community</h2>
                <p className="text-neutral-400 text-lg">
                    Subscribe to our newsletter and get the latest AI trends, automation tips, and exclusive updates delivered straight to your inbox.
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="flex-grow bg-neutral-900 border-2 border-border h-14 rounded-lg px-4 text-base focus-visible:ring-primary/50"
                        />
                        <Button type="submit" className="h-14 px-8 text-base font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                           {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
                        </Button>
                    </div>
                </form>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-neutral-400 text-sm">
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-primary"/>
                        <span>No credit card is required</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Check size={16} className="text-primary"/>
                        <span>Early access & Special offers</span>
                    </div>
                </div>
            </div>

            <div className="mt-24 pt-12 border-t border-border/20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="inline-block">
                           <div className="flex items-center gap-3">
                                <CurioGridLogo />
                                <span className="text-2xl font-bold">CurioGrid</span>
                           </div>
                        </Link>
                        <div className="flex gap-2">
                        

                            <SocialIcon href="https://x.com/CurioGrid" src="https://framerusercontent.com/images/0MF1gIwlv0MwZa51idvtRUAHzEo.svg" alt="X" />
                            <SocialIcon href="https://www.instagram.com/curiogrid" src="https://framerusercontent.com/images/jDxxw2DrZnM2DJFE4iDRbGMykg.svg" alt="Instagram" />
                        </div>
                         <p className="text-xs text-neutral-500">
                            Designed and managed by: abdullahbalfaqih0@gmail.com
                        </p>
                    </div>

                     <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-white mb-4">Main Pages</h3>
                            <ul className="space-y-3">
                                <li><Link href="/" className="text-neutral-400 hover:text-primary transition-colors">Home</Link></li>
                                <li><Link href="/about" className="text-neutral-400 hover:text-primary transition-colors">Features</Link></li>
                                <li><Link href="/dashboard/subscriptions" className="text-neutral-400 hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link href="/contact" className="text-neutral-400 hover:text-primary transition-colors">Contact us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4">Company</h3>
                            <ul className="space-y-3">
                                <li><Link href="/about" className="text-neutral-400 hover:text-primary transition-colors">About</Link></li>
                                <li><Link href="/privacy" className="text-neutral-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
                                 <li><Link href="/terms" className="text-neutral-400 hover:text-primary transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                     
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
};
