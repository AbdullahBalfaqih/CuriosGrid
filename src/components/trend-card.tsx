"use client";

import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';
import { Sparkline } from '@/components/sparkline';
import type { Trend } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { Badge } from './ui/badge';

interface TrendCardProps {
    trend: Trend;
    onSelect: () => void;
    isRealData: boolean;
}

const TrendCardContent = ({ trend, isRealData }: { trend: Trend, isRealData: boolean }) => (
    <>
        <div className="flex justify-between items-start mb-4">
            <Badge variant="secondary" className="max-w-[70%] truncate bg-neutral-800 text-neutral-300">{trend.category || 'General'}</Badge>
            {trend.growth > 100 && (
                <span className="text-primary flex items-center gap-1 text-xs font-bold bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                    <TrendingUp size={12}/> {trend.growth}%
                </span>
            )}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-3 leading-snug group-hover:text-primary transition-colors" title={trend.topic}>
                {trend.topic}
            </h3>
            <div className="h-16 w-full mb-4 opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                <Sparkline 
                    data={trend.sparkline} 
                    color={!isRealData ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'} 
                    hoverColor="#FFFFFF"
                />
            </div>
        </div>
        <div className="flex justify-between items-end border-t border-border pt-4 mt-auto">
            <div>
                <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Signal Strength</div>
                <div className="text-xl font-code font-bold text-white">{formatNumber(trend.volume)}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-900 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-neutral-500 transition-all">
                <Zap size={18} className="fill-current"/>
            </div>
        </div>
    </>
);

export const TrendCard = ({ trend, onSelect, isRealData }: TrendCardProps) => {
    const cardContent = <TrendCardContent trend={trend} isRealData={isRealData} />;

    return (
        <motion.div
            layout 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group/card bg-card hover:bg-neutral-900 border border-border rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
        >
            {trend.url ? (
                <a href={trend.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="absolute inset-0 z-0">
                    <span className="sr-only">View on Reddit</span>
                </a>
            ) : null}
            <div onClick={onSelect} className="relative z-10 flex flex-col justify-between h-full cursor-pointer">
                {cardContent}
            </div>
        </motion.div>
    );
};
