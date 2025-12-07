"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

const TickerItem = ({ text }: { text: string }) => (
  <div className="bg-card border border-border rounded-2xl py-3 px-6 shrink-0">
    <h3 className="text-lg font-bold text-white uppercase tracking-wider">{text}</h3>
  </div>
);

export const TickerSection = () => {
  const tickerItems = [
    "Start Now", "Discover Trends", "AI-Powered", "CurioGrid", "Get Ahead", "Join Now"
  ];
  const duplicatedItems = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <section className="py-12 overflow-hidden">
      <div className="transform -rotate-2">
        <Link href="/dashboard/subscriptions">
          <div className="flex items-center relative w-full">
            <motion.div
              className="flex gap-4"
              animate={{ x: ['0%', '-100%'] }}
              transition={{
                ease: 'linear',
                duration: 40,
                repeat: Infinity,
              }}
            >
              {duplicatedItems.map((item, index) => (
                <TickerItem key={index} text={item} />
              ))}
            </motion.div>
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
             }} />
          </div>
        </Link>
      </div>
    </section>
  );
};
