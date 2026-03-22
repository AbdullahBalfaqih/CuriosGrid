"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, type WithId, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, User, ArrowDownUp, Clock, Tag } from 'lucide-react';
import type { Auction } from '@/lib/user-provider';
import { AuctionCard } from '@/components/auction-card';
import { useUser } from '@/hooks/use-user';
import { AuthModal } from '@/components/auth-modal';

type SortByType = 'ending-soon' | 'highest-price' | 'newly-listed';

export default function MarketplacePage() {
    const firestore = useFirestore();
    
    const auctionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'auctions');
    }, [firestore]);

    const { data: auctions, isLoading } = useCollection<Auction>(auctionsQuery);
    const { user, isLoggedIn } = useUser();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<SortByType>('ending-soon');

    const sortedAuctions = useMemo(() => {
        if (!auctions) return [];
        return [...auctions].sort((a, b) => {
            switch (sortBy) {
                case 'highest-price':
                    return b.currentBid - a.currentBid;
                case 'newly-listed':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'ending-soon':
                default:
                    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
            }
        });
    }, [auctions, sortBy]);

    const sortOptions: { id: SortByType, label: string, icon: React.ElementType }[] = [
        { id: 'ending-soon', label: 'Ending Soon', icon: Clock },
        { id: 'highest-price', label: 'Highest Price', icon: Tag },
        { id: 'newly-listed', label: 'Newly Listed', icon: ArrowDownUp },
    ];


    return (
        <>
        <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
            <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <CurioGridLogo />
                    </Link>
                    <span className="hidden sm:inline text-2xl font-bold tracking-tight">CurioGrid</span>
                </div>
                 <div className="flex items-center gap-4">
                     {isLoggedIn ? (
                          <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                                <User size={20} />
                            </Button>
                         </Link>
                     ) : (
                         <Button onClick={() => setIsAuthModalOpen(true)} variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                            <User size={20} />
                        </Button>
                     )}
                   
                </div>
                </div>
            </nav>
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <ShoppingCart size={48} className="mx-auto text-primary mb-4" />
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Content Marketplace</h1>
                    <p className="text-lg text-neutral-400">
                        Welcome to the hub of authentic, AI-generated content. Discover, bid on, and own unique digital assets verified on the Solana blockchain.
                    </p>
                </div>
                
                <div className="flex justify-center gap-2 mb-12">
                    {sortOptions.map(({ id, label, icon: Icon }) => (
                         <Button 
                            key={id} 
                            variant={sortBy === id ? 'default' : 'outline'} 
                            onClick={() => setSortBy(id)}
                            className={`rounded-full border-border/50 ${sortBy === id ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                        >
                            <Icon size={16} className="mr-2"/>
                            {label}
                        </Button>
                    ))}
                </div>


                {isLoading && (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 size={48} className="animate-spin text-primary" />
                    </div>
                )}

                {!isLoading && (!sortedAuctions || sortedAuctions.length === 0) && (
                     <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl flex flex-col items-center">
                        <ShoppingCart size={48} className="text-neutral-700 mb-4" />
                        <h2 className="text-2xl font-bold text-neutral-500 mb-2">Marketplace is Empty</h2>
                        <p className="text-neutral-600">No content has been listed for auction yet. Be the first!</p>
                    </div>
                )}

                {!isLoading && sortedAuctions && sortedAuctions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction as WithId<Auction>} onBidClick={() => !isLoggedIn && setIsAuthModalOpen(true)} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
        {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
        </>
    );
}
