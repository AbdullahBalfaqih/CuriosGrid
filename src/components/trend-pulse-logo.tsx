"use client";

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export const CurioGridLogo = () => (
    <motion.div className="relative w-10 h-10 group cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <motion.div className="absolute inset-0 bg-primary rounded-xl blur opacity-20" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
        <div className="relative w-full h-full bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden">
        <TrendingUp size={24} className="transform group-hover:scale-110 transition-transform duration-300 text-black" strokeWidth={2.5}/>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/30 to-transparent pointer-events-none"></div>
        </div>
    </motion.div>
);
