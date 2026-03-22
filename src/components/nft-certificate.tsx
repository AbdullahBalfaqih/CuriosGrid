"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { CurioGridLogo } from './trend-pulse-logo';
import { format } from 'date-fns';
import type { TransactionRecord } from '@/lib/user-provider';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Copy, Download, Gavel, Loader2, X, Sparkles } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { estimateContentValue } from '@/ai/flows/estimate-content-value';


const SolanaLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1259.1 1027.2" className="w-5 h-5">
      <defs>
        <linearGradient id="cert_sol_grad_1" gradientUnits="userSpaceOnUse" x1="265.09" y1="538.34" x2="994.16" y2="1267.41" gradientTransform="matrix(1 0 0 -1 0 1030)">
          <stop offset="0" stopColor="#9945ff"></stop>
          <stop offset="1" stopColor="#00fba6"></stop>
        </linearGradient>
        <linearGradient id="cert_sol_grad_2" gradientUnits="userSpaceOnUse" x1="-3188.62" y1="801.33" x2="-2618.71" y2="231.43" gradientTransform="matrix(-1 0 0 -1 -2274.15 1030)">
          <stop offset="0" stopColor="#00fba6"></stop>
          <stop offset="1" stopColor="#9945ff"></stop>
        </linearGradient>
        <linearGradient id="cert_sol_grad_3" gradientUnits="userSpaceOnUse" x1="-3268.16" y1="-1230.44" x2="-2539.11" y2="-501.38" gradientTransform="matrix(-1 0 0 1 -2274.15 1766.02)">
          <stop offset="0" stopColor="#00fba6"></stop>
          <stop offset="0.16" stopColor="#23c8b5"></stop>
          <stop offset="0.41" stopColor="#5587cb"></stop>
          <stop offset="0.71" stopColor="#8c47e3"></stop>
          <stop offset="1" stopColor="#9945ff"></stop>
        </linearGradient>
      </defs>
      <path fill="url(#cert_sol_grad_1)" d="M13.9 174.1 173 13.9c8.8-8.9 20.7-13.9 33.3-13.9H1212c41.7 0 62.8 50.4 33.3 80l-158.9 160.2c-8.8 8.9-20.7 13.9-33.2 13.9H47.1C5.4 254.1-15.7 203.7 13.9 174.1z"></path>
      <path fill="url(#cert_sol_grad_2)" d="M1211.9 640.7H206c-12.5-.1-24.4-5.1-33.2-13.9L13.9 466.5c-29.6-29.6-8.5-80 33.3-80h1005.7c12.5 0 24.5 5 33.3 13.9l159.1 160.2c29.6 29.6 8.5 80-33.3 80z"></path>
      <path fill="url(#cert_sol_grad_3)" d="m1245.2 853.1-159.1 160.2c-8.8 8.9-20.8 13.9-33.3 13.9H47.1c-41.7 0-62.8-50.4-33.3-80l159-160.2c8.8-8.9 20.7-13.9 33.2-13.9h1005.9c41.8 0 62.8 50.4 33.3 80z"></path>
    </svg>
);


const QrCode = ({ url }: { url: string }) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}&bgcolor=0a0a0a&color=eaeaea&qzone=1`;
    return <img src={qrApiUrl} alt="QR Code" width={120} height={120} className="rounded-lg" crossOrigin="anonymous" />;
};

const CreateAuctionModal = ({ tx, onClose }: { tx: TransactionRecord, onClose: () => void }) => {
    const { createAuction } = useUser();
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState(7);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateAuction = async () => {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            // toast error
            return;
        }
        setIsLoading(true);
        await createAuction(tx, numPrice, duration);
        setIsLoading(false);
        onClose();
    };

    return (
        <AnimatePresence>
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
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gavel /> Create Auction</h3>
                        <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8"><X size={16} /></Button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="price">Starting Price (SOL)</Label>
                            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 1.5" className="bg-neutral-800" />
                        </div>
                        <div>
                            <Label htmlFor="duration">Duration (days)</Label>
                            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10))} className="bg-neutral-800" />
                        </div>
                        <Button onClick={handleCreateAuction} disabled={isLoading} className="w-full bg-primary text-primary-foreground h-12">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'List for Auction'}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export const NftCertificateCard = ({ tx }: { tx: TransactionRecord }) => {
    const { toast } = useToast();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isAuctionModalOpen, setAuctionModalOpen] = useState(false);
    const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`;

    const [aiEstimatedValue, setAiEstimatedValue] = useState<number | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const handleCopy = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: message });
    };

    const handleDownload = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, {
                backgroundColor: '#050505',
                useCORS: true,
                scale: 2,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `curiogrid-certificate-${tx.id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const pseudoRandomValue = React.useMemo(() => {
        let hash = 0;
        for (let i = 0; i < tx.signature.length; i++) {
            const char = tx.signature.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }, [tx.signature]);

    const initialEstimatedValue = (pseudoRandomValue % 500) / 100 + 0.5;
    const displayValue = aiEstimatedValue !== null ? aiEstimatedValue : initialEstimatedValue;

    const handleEstimateValue = async () => {
        setIsEstimating(true);
        try {
            const result = await estimateContentValue({ topic: tx.topic, hash: tx.hash });
            setAiEstimatedValue(result.estimatedValue);
            toast({
                title: "Valuation Complete",
                description: result.justification,
            });
        } catch (error) {
            console.error("Value estimation failed:", error);
            toast({
                variant: "destructive",
                title: "Estimation Failed",
                description: "Could not estimate the value at this time.",
            });
        } finally {
            setIsEstimating(false);
        }
    };


    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg mx-auto font-body"
            >
                <div ref={cardRef} className="relative aspect-[1/1.414] w-full rounded-2xl bg-neutral-900 border-2 border-border p-6 flex flex-col justify-between overflow-hidden shadow-2xl shadow-primary/10 font-code">
                    <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(188,245,15,0.05)_0%,_rgba(188,245,15,0)_40%)]"></div>
                    <div className="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%231a1a1a%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                    <svg className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="14.5" stroke="url(#cert-border-grad)" strokeWidth="3"/>
                        <defs>
                            <linearGradient id="cert-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6"/>
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className='font-body'>
                                <p className="text-sm text-primary font-bold tracking-[0.2em] uppercase">Certificate of Authenticity</p>
                                <h3 className="text-2xl font-bold text-white mt-1">Digital Content Record</h3>
                            </div>
                            <CurioGridLogo />
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4 text-white">
                        <div>
                            <p className="text-xs text-neutral-400 font-body">This certifies that the digital content titled:</p>
                            <p className="text-lg font-bold text-white font-body break-words">"{tx.topic}"</p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-neutral-400 font-body">Content Hash</p>
                                <p className="text-xs font-mono break-all">{tx.hash}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 font-body">Transaction Signature</p>
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono break-all text-primary hover:underline">{tx.signature}</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex justify-between items-end gap-4">
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-neutral-400 font-body">Timestamp (UTC)</p>
                                <p className="text-sm font-medium text-white">{format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm:ss")}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-primary">
                                <SolanaLogo />
                                <span className='font-body font-bold'>Verified on Solana</span>
                            </div>
                        </div>
                        <div className='flex-shrink-0'>
                            <div className="bg-neutral-950/50 border border-border p-1 rounded-xl inline-block">
                                <QrCode url={explorerUrl} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => handleCopy(tx.hash, 'Content hash copied!')} variant="outline" className='h-10 bg-neutral-800 border-border hover:bg-neutral-700'>
                            <Copy size={16} /> Copy Hash
                        </Button>
                        <Button onClick={() => handleCopy(tx.signature, 'Signature copied!')} variant="outline" className='h-10 bg-neutral-800 border-border hover:bg-neutral-700'>
                            <Copy size={16} /> Copy Sig
                        </Button>
                    </div>
                    <Button onClick={handleDownload} variant="outline" className="w-full h-10 bg-neutral-800 border-border hover:bg-neutral-700">
                        <Download size={16} className="mr-2" />
                        Download Certificate
                    </Button>
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-neutral-500 font-body">Estimated Value</p>
                                <p className="text-lg font-bold text-white flex items-center gap-2">
                                    <DollarSign size={16} className="text-primary" />
                                    {displayValue.toFixed(2)} SOL
                                </p>
                            </div>
                             <Button onClick={handleEstimateValue} disabled={isEstimating} size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                                {isEstimating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={16} className="mr-2"/> AI Valuation</>}
                            </Button>
                        </div>
                        <Button onClick={() => setAuctionModalOpen(true)} disabled={!!tx.isForSale || isEstimating} className="w-full h-12 bg-neutral-800 text-neutral-300 hover:text-white enabled:hover:bg-primary enabled:hover:text-primary-foreground transition-all">
                            {tx.isForSale ? "Already Listed for Auction" : "List for Auction"}
                        </Button>
                    </div>
                </div>
            </motion.div>
            {isAuctionModalOpen && <CreateAuctionModal tx={tx} onClose={() => setAuctionModalOpen(false)} />}
        </>
    );
};
