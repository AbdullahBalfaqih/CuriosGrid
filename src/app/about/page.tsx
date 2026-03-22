"use client";

import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, ShieldCheck, Trophy, DollarSign, Globe } from 'lucide-react';
import React from 'react';

const features = [
  {
    name: 'Real-time Trend Analysis',
    description: 'We scan the digital landscape to identify viral topics and emerging narratives as they happen, giving you the edge.',
    icon: TrendingUp,
  },
  {
    name: 'AI Content Generation',
    description: 'Instantly transform trending topics into engaging social media posts, image prompts, and video scripts with our advanced AI.',
    icon: Sparkles,
  },
  {
    name: 'Web3 Content Authentication',
    description: 'Prove the authenticity of your content with an immutable certificate on the Solana blockchain. A true utility NFT.',
    icon: ShieldCheck,
  },
  {
    name: 'Dynamic Leaderboard',
    description: 'Showcase platform activity with leaderboards for top creators and hottest trends, providing social proof and engagement.',
    icon: Trophy,
  },
  {
    name: 'Monetization-Ready',
    description: 'Our content certificates are designed as digital assets, with a clear path to future monetization through auctions and trading.',
    icon: DollarSign,
  },
  {
    name: 'Global Reach',
    description: 'Analyze trends from countries all over the world and generate content that resonates with a global audience.',
    icon: Globe,
  },
]

const FeatureCard = ({ feature, index }: { feature: (typeof features)[0], index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-card border border-border rounded-3xl p-8 flex flex-col gap-6 text-center items-center hover:border-primary/40 hover:-translate-y-2 transition-all duration-300"
    >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <feature.icon size={32} />
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{feature.name}</h3>
            <p className="text-neutral-400">{feature.description}</p>
        </div>
    </motion.div>
);

export default function FeaturesPage() {
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
      <main className="max-w-7xl mx-auto px-6 py-24 w-full flex-1">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
        >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Platform Features</h1>
            <p className="text-lg text-neutral-400">
                CurioGrid is more than just a tool; it's a complete ecosystem for the modern content creator. Here's what makes our platform a game-changer.
            </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <FeatureCard key={feature.name} feature={feature} index={index} />
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
