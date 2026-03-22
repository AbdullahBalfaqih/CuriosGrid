"use client";

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { CountUp } from './count-up';
import Image from 'next/image';

const stats = [
  { value: 99, suffix: '%', label: 'Uptime', heightClass: 'h-32', imageUrl: '/images/uptime.png', imageHint: 'server lights' },
  { value: 4, suffix: 'M+', label: 'Trends Analyzed', heightClass: 'h-48', imageUrl: '/images/trends.png', imageHint: 'data chart' },
  { value: 25, suffix: 'K', label: 'Creators Active', heightClass: 'h-32', imageUrl: '/images/creators.png', imageHint: 'people community' },
  { value: 12, suffix: '', label: 'AI Models', heightClass: 'h-40', imageUrl: '/images/ai.png', imageHint: 'abstract nodes' },
];

const StatCard = ({ value, suffix, label, heightClass, imageUrl, imageHint, index }: { value: number; suffix: string; label: string; heightClass: string; imageUrl: string; imageHint: string; index: number }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-card/50 border border-border/50 rounded-3xl p-6 flex flex-col items-start justify-end ${heightClass} relative overflow-hidden group`}
        >
            <Image
                src={imageUrl}
                alt={label}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                data-ai-hint={imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            <div className="relative z-10">
                <CountUp 
                    value={value} 
                    className="text-6xl font-bold text-white mb-1"
                    suffix={suffix}
                />
                <p className="text-neutral-400">{label}</p>
            </div>
        </motion.div>
    );
};

export const TrustedBySection = () => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <section ref={ref} className="w-full max-w-7xl mx-auto py-24 px-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0 }}
                className="mb-12"
            >
                <h2 className="text-5xl font-bold text-white mb-4">Empowering Creators Worldwide</h2>
                <p className="text-neutral-400 text-lg max-w-2xl">
                    CurioGrid is the AI-powered platform that turns real-time trends into engaging content, trusted by thousands of creators to stay ahead of the curve.
                </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
                {stats.map((stat, index) => (
                    <StatCard key={stat.label} {...stat} index={index} />
                ))}
            </div>
        </section>
    );
};