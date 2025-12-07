"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Country } from '@/lib/types';
import { getFlagUrl } from '@/lib/utils';

interface FlagTickerProps {
    onSelectCountry: (country: Country) => void;
}

export const FlagTicker = ({ onSelectCountry }: FlagTickerProps) => {
    const [countries, setCountries] = useState<Country[]>([]);

    useEffect(() => {
        import('@/lib/constants').then(module => {
            // Shuffle and take a subset for performance
            const shuffled = [...module.COUNTRIES].sort(() => 0.5 - Math.random());
            setCountries(shuffled.slice(0, 50));
        });
    }, []);

    if (countries.length === 0) {
        return <div className="h-16 bg-background"></div>;
    }

    const tickerList = [...countries, ...countries];

    return (
        <div className="bg-background py-3 overflow-hidden relative flex z-30 h-16">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            <motion.div className="flex items-center gap-4" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 360, ease: "linear", repeat: Infinity }}>
                {tickerList.map((country, idx) => (
                    <motion.button
                        key={`${country.code}-${idx}`}
                        onClick={() => onSelectCountry(country)}
                        whileHover={{ scale: 1.1, backgroundColor: "hsla(var(--primary) / 0.15)", borderColor: "hsl(var(--primary))" }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 px-5 py-2 bg-neutral-900/80 backdrop-blur-sm rounded-full border border-border min-w-max transition-colors group"
                    >
                        <img src={getFlagUrl(country.code, 20)} alt={country.name} className="w-5 h-auto" />
                        <span className="text-sm font-semibold text-neutral-400 group-hover:text-white transition-colors">{country.name}</span>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};
