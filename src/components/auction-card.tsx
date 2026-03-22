"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { WithId } from '@/firebase';
import type { Auction } from '@/lib/user-provider';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Gavel, Loader2, User, X, BadgeCheck } from 'lucide-react';
import { Badge } from './ui/badge';

const SolanaLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1259.1 1027.2" className="w-4 h-4">
      <defs>
        <linearGradient id="sol_grad_1" gradientUnits="userSpaceOnUse" x1="265.09" y1="538.34" x2="994.16" y2="1267.41" gradientTransform="matrix(1 0 0 -1 0 1030)">
          <stop offset="0" stopColor="#9945ff"></stop>
          <stop offset="1" stopColor="#00fba6"></stop>
        </linearGradient>
        <linearGradient id="sol_grad_2" gradientUnits="userSpaceOnUse" x1="-3188.62" y1="801.33" x2="-2618.71" y2="231.43" gradientTransform="matrix(-1 0 0 -1 -2274.15 1030)">
          <stop offset="0" stopColor="#00fba6"></stop>
          <stop offset="1" stopColor="#9945ff"></stop>
        </linearGradient>
        <linearGradient id="sol_grad_3" gradientUnits="userSpaceOnUse" x1="-3268.16" y1="-1230.44" x2="-2539.11" y2="-501.38" gradientTransform="matrix(-1 0 0 1 -2274.15 1766.02)">
          <stop offset="0" stopColor="#00fba6"></stop>
          <stop offset="0.16" stopColor="#23c8b5"></stop>
          <stop offset="0.41" stopColor="#5587cb"></stop>
          <stop offset="0.71" stopColor="#8c47e3"></stop>
          <stop offset="1" stopColor="#9945ff"></stop>
        </linearGradient>
      </defs>
      <path fill="url(#sol_grad_1)" d="M13.9 174.1 173 13.9c8.8-8.9 20.7-13.9 33.3-13.9H1212c41.7 0 62.8 50.4 33.3 80l-158.9 160.2c-8.8 8.9-20.7 13.9-33.2 13.9H47.1C5.4 254.1-15.7 203.7 13.9 174.1z"></path>
      <path fill="url(#sol_grad_2)" d="M1211.9 640.7H206c-12.5-.1-24.4-5.1-33.2-13.9L13.9 466.5c-29.6-29.6-8.5-80 33.3-80h1005.7c12.5 0 24.5 5 33.3 13.9l159.1 160.2c29.6 29.6 8.5 80-33.3 80z"></path>
      <path fill="url(#sol_grad_3)" d="m1245.2 853.1-159.1 160.2c-8.8 8.9-20.8 13.9-33.3 13.9H47.1c-41.7 0-62.8-50.4-33.3-80l159-160.2c8.8-8.9 20.7-13.9 33.2-13.9h1005.9c41.8 0 62.8 50.4 33.3 80z"></path>
    </svg>
);


const BidModal = ({ auction, onClose }: { auction: WithId<Auction>, onClose: () => void }) => {
    const { user, placeBid } = useUser();
    const [bidAmount, setBidAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const minBid = auction.currentBid > 0 ? parseFloat((auction.currentBid * 1.05).toFixed(2)) : auction.startingPrice;

    const handlePlaceBid = async () => {
        if (!user || !user.firebaseUser) {
            toast({ variant: 'destructive', title: "Login Required", description: "You must be logged in to place a bid."});
            return;
        }

        const amount = parseFloat(bidAmount);
        if (isNaN(amount)) {
            toast({ variant: 'destructive', title: "Invalid Bid", description: `Please enter a valid number.`});
            return;
        }

        if (amount < minBid) {
            toast({ variant: 'destructive', title: "Bid Too Low", description: `Your bid must be at least ${minBid.toFixed(2)} SOL.`});
            return;
        }

        setIsLoading(true);
        const success = await placeBid(auction.id, amount);
        if (success) {
            toast({ title: "Bid Placed!", description: `You are the new highest bidder for ${amount} SOL.`});
            onClose();
        }
        setIsLoading(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gavel /> Place a Bid</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8"><X size={16} /></Button>
                </div>
                <p className="text-sm text-neutral-400 mb-2 truncate">You are bidding on: <span className="font-bold text-neutral-200">{auction.topic}</span></p>
                <div className="bg-neutral-800 p-3 rounded-lg mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Current Bid:</span>
                        <span className="font-bold text-white flex items-center gap-1.5"><SolanaLogo/> {auction.currentBid.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Minimum Bid:</span>
                        <span className="font-bold text-white flex items-center gap-1.5"><SolanaLogo/> {minBid.toFixed(2)}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <Input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder={`≥ ${minBid.toFixed(2)} SOL`} className="bg-neutral-800 h-12 text-lg text-center"/>
                    <Button onClick={handlePlaceBid} disabled={isLoading} className="w-full bg-primary text-primary-foreground h-12 font-bold">
                        {isLoading ? <Loader2 className="animate-spin"/> : `Submit Bid`}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const AuctionCard = ({ auction, onBidClick }: { auction: WithId<Auction>, onBidClick: () => void }) => {
    const [timeLeft, setTimeLeft] = useState({text: '', urgency: 'normal'});
    const [isBidModalOpen, setBidModalOpen] = useState(false);
    const { user, isLoggedIn } = useUser();

    const isHighestBidder = user?.firebaseUser?.uid === auction.currentBidderId;
    const auctionEnded = new Date(auction.endTime) < new Date();

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(auction.endTime);
            const distance = end.getTime() - now.getTime();

            if (distance < 0) {
                setTimeLeft({text: "Auction Ended", urgency: 'ended'});
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            let text = '';
            if (days > 0) text = `${days}d ${hours}h left`;
            else if (hours > 0) text = `${hours}h ${minutes}m left`;
            else text = `${minutes}m ${seconds}s left`;

            let urgency = 'normal';
            if (hours < 1 && days === 0) urgency = 'urgent';
            if (hours < 24 && days === 0) urgency = 'soon';

            setTimeLeft({ text, urgency });

        }, 1000);

        return () => clearInterval(interval);
    }, [auction.endTime]);

    const handleBidButtonClick = () => {
        if (isLoggedIn) {
            setBidModalOpen(true);
        } else {
            onBidClick();
        }
    };

    const urgencyColor = {
        normal: 'text-primary',
        soon: 'text-yellow-400',
        urgent: 'text-red-500 animate-pulse',
        ended: 'text-neutral-500'
    };

    return (
       <>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="bg-card border border-border rounded-3xl p-5 flex flex-col gap-4 group"
        >
            <div className="flex-grow">
                {isHighestBidder && !auctionEnded && (
                    <Badge className="mb-2 bg-green-500/20 text-green-300 border-green-500/30 font-bold"><BadgeCheck size={14} className="mr-1.5"/> You're Winning</Badge>
                )}
                 {auctionEnded && (
                    <Badge className="mb-2 bg-neutral-800 text-neutral-400 border-border">Auction Ended</Badge>
                )}
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors h-14 line-clamp-2">{auction.topic}</h3>
                <p className="text-xs text-neutral-500 truncate">Listed by {auction.sellerName}</p>
            </div>
            
            <div className="bg-neutral-900/50 border border-border rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Current Bid</span>
                    <span className="text-xs text-neutral-400">Ends In</span>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-white flex items-center gap-2">
                        <SolanaLogo/> {auction.currentBid.toFixed(2)}
                    </p>
                    <p className={`text-lg font-mono font-bold ${urgencyColor[timeLeft.urgency as keyof typeof urgencyColor]}`}>{timeLeft.text}</p>
                </div>
            </div>

            {auction.currentBidderName && (
                <div className="text-center text-xs text-neutral-400">
                    Highest bid by <span className="font-bold text-white">{auction.currentBidderName}</span>
                </div>
            )}

            <Button onClick={handleBidButtonClick} disabled={isHighestBidder || auctionEnded} className="w-full h-12 font-bold bg-neutral-800 enabled:hover:bg-primary enabled:hover:text-primary-foreground transition-all disabled:opacity-70">
                {auctionEnded ? "Auction Over" : isHighestBidder ? "You are the highest bidder" : "Place Bid"}
            </Button>
        </motion.div>
        {isBidModalOpen && <BidModal auction={auction} onClose={() => setBidModalOpen(false)} />}
       </>
    );
};
