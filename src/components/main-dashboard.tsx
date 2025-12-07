"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
    Settings, Search, ChevronDown, Wifi, WifiOff, Loader2, Radio, Check, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurioGridLogo } from '@/components/trend-pulse-logo';
import { TrendCard } from '@/components/trend-card';
import { ActionModal } from '@/components/action-modal';
import { AuthModal } from '@/components/auth-modal';
import type { Country, Trend } from '@/lib/types';
import { getFlagUrl, generateSparkline } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { FALLBACK_TOPICS } from '@/lib/constants';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';
import { FlagTicker } from './flag-ticker';
import { HeroSection } from './hero-section';


const StaticStar = ({ id }: { id: number }) => {
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        setStyle({
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 1.5 + 0.5}px`,
            height: `${Math.random() * 1.5 + 0.5}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            opacity: Math.random() * 0.4 + 0.1,
        });
    }, [id]);

    return <div style={style} />;
};


const CountryDropdown = ({
    isOpen,
    activeRegion,
    onSelectRegion,
}: {
    isOpen: boolean;
    activeRegion: Country;
    onSelectRegion: (country: Country) => void;
}) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            import('@/lib/constants').then(module => {
                setCountries(module.COUNTRIES);
            });
        }
    }, [isOpen]);

    const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                >
                    <div className="p-2 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search country..."
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                className="w-full bg-neutral-900 border-neutral-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-600 font-medium"
                            />
                        </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {countries.length === 0 ? (
                            <div className='p-4 text-center text-sm text-neutral-400'>Loading countries...</div>
                        ) : (
                            filteredCountries.map(country => (
                                <button key={country.code} onClick={() => onSelectRegion(country)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors">
                                    <img src={getFlagUrl(country.code, 20)} alt={`${country.name} flag`} className="w-5 h-auto" /> {country.name}
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const MainDashboard = ({ activeRegion, onRegionChange }: { activeRegion: Country, onRegionChange: (country: Country) => void }) => {
    const [trends, setTrends] = useState<Trend[]>([]);
    const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRealData, setIsRealData] = useState(true);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user, isLoggedIn } = useUser();

    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const loadTrends = (region: Country) => {
        startTransition(async () => {
            setTrends([]);

            const offlineTrends: Trend[] = FALLBACK_TOPICS.map((topic, index) => ({
                id: index + 1,
                topic: topic,
                fullTitle: `${topic} is now trending in ${region.name}`,
                volume: Math.floor(Math.random() * 50000) + 1000,
                growth: Math.floor(Math.random() * 200) + 10,
                sparkline: generateSparkline(),
                category: 'General',
                region: region.name,
                url: '#'
            }));

            const proxyUrl = `/api/trends?sub=${region.sub}&limit=20`;

            try {
                const response = await fetch(proxyUrl);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Proxy request failed: ${response.status} ${errorText}`);
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid response from API");
                }

                const fetchedTrends: Trend[] = data.map((child: any, index: number) => ({
                    id: child.data.id || index,
                    topic: child.data.title,
                    fullTitle: child.data.title,
                    volume: child.data.score,
                    growth: Math.round(child.data.upvote_ratio * 100),
                    sparkline: generateSparkline(),
                    category: child.data.subreddit,
                    region: region.name,
                    url: `https://www.reddit.com${child.data.permalink}`,
                }));

                setTrends(fetchedTrends);
                setIsRealData(true);

            } catch (e: any) {
                console.error("Failed to load trends:", e.message);
                setTrends(offlineTrends);
                setIsRealData(false);
            }
        });
    };


    useEffect(() => {
        loadTrends(activeRegion);
    }, [activeRegion]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectRegion = (country: Country) => {
        onRegionChange(country);
        setDropdownOpen(false);
    };

    const handleTrendSelect = (trend: Trend) => {
        if (isLoggedIn === true) {
            setSelectedTrend(trend);
        } else {
            setIsAuthModalOpen(true);
            toast({
                title: "Authentication Required",
                description: "Please sign in or create an account to use AI features.",
            });
        }
    };

    const filteredTrends = trends.filter(t => t.topic.toLowerCase().includes(searchQuery.toLowerCase()));

    const getStatusIcon = () => {
        if (isPending) return <Loader2 size={14} className="animate-spin" />;
        if (isRealData) return <Wifi size={14} />;
        return <WifiOff size={14} />;
    };

    const getStatusText = () => {
        if (isPending) return 'FETCHING...';
        if (isRealData) return 'SYNCED';
        return 'OFFLINE';
    }

    const handleRegionDropdownToggle = () => {
        if (isLoggedIn === true) {
            setDropdownOpen(!isDropdownOpen);
        } else {
            setIsAuthModalOpen(true);
            toast({
                title: "Authentication Required",
                description: "Sign in to explore trends from around the world.",
            });
        }
    };

    return (
        <div id="main-dashboard" className="bg-background text-foreground font-body flex flex-col">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <StaticStar key={`static-${i}`} id={i} />
                    ))}
                </div>
                <nav className="relative z-10">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/"><CurioGridLogo /></Link>
                            <Link href="/"><span className="hidden sm:inline text-2xl font-bold tracking-tight">CurioGrid</span></Link>

                            <div className={`ml-2 sm:ml-4 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 transition-colors ${isPending
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : isRealData
                                        ? 'bg-primary/10 text-primary border-primary/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {getStatusIcon()}
                                {getStatusText()}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-6">
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={handleRegionDropdownToggle} className="flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 border border-border py-2.5 pl-4 pr-3 rounded-full transition-all min-w-[180px] justify-between group">
                                    <span className="flex items-center gap-3">
                                        <img src={getFlagUrl(activeRegion.code, 20)} alt={`${activeRegion.name} flag`} className="w-5 h-auto" />
                                        <span className="font-medium text-sm text-neutral-300 group-hover:text-white">{activeRegion.name}</span>
                                    </span>
                                    <ChevronDown size={16} className={`text-neutral-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isLoggedIn && <CountryDropdown
                                    isOpen={isDropdownOpen}
                                    activeRegion={activeRegion}
                                    onSelectRegion={handleSelectRegion}
                                />}
                            </div>
                            {isLoggedIn === true ? (
                                <Link href="/dashboard">
                                    <button className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-800 transition-all"><User size={20} /></button>
                                </Link>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-800 transition-all"><User size={20} /></button>
                            )}
                        </div>
                    </div>
                </nav>
            </div>

            <HeroSection onRegionChange={handleSelectRegion} />


            <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1 bg-background relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
                            Trends in {activeRegion.name}
                            <img src={getFlagUrl(activeRegion.code, 40)} alt={`${activeRegion.name} flag`} className="w-12 h-auto shadow-2xl opacity-80" />
                        </h1>
                        <p className="text-neutral-400 text-lg max-w-2xl">{isPending ? "Connecting to global pulse network..." : isRealData ? "Displaying live trends from the global pulse network." : "Displaying pre-compiled trend data. Live connection unavailable."}</p>
                    </motion.div>
                    <div className="relative w-full md:w-[420px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                        <input type="text" placeholder="Filter trends..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-neutral-900/50 border border-border text-white rounded-2xl pl-14 pr-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-neutral-900 outline-none transition-all placeholder:text-neutral-600 font-medium" />
                    </div>
                </div>

                {isPending || trends.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[300px] rounded-3xl bg-neutral-900/30 border-border/50" />)}
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 group/grid">
                        <AnimatePresence>
                            {filteredTrends.map((trend) => (
                                <TrendCard key={trend.id} trend={trend} onSelect={() => handleTrendSelect(trend)} isRealData={isRealData} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </main>

            {selectedTrend && <ActionModal trend={selectedTrend} onClose={() => setSelectedTrend(null)} />}

            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
        </div>
    );
};

export default MainDashboard;
