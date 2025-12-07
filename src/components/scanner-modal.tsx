"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, ShieldAlert, ShieldCheck, Copy, ExternalLink } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';
import Image from 'next/image';
import type { TransactionRecord } from '@/lib/user-provider';
import { format } from 'date-fns';

const SolanaLogo = () => (
    <Image src="https://cryptologos.cc/logos/solana-sol-logo.svg?v=040" alt="Solana" width={28} height={28} />
);

interface ScannerModalProps {
  onClose: () => void;
}

export const ScannerModal = ({ onClose }: ScannerModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<TransactionRecord | 'not-found' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useUser();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
        toast({
            title: 'Empty Search',
            description: "Please enter a transaction signature or content hash.",
        });
        return;
    }
    
    setIsLoading(true);
    setSearchResult(null);

    // Simulate network delay
    setTimeout(() => {
        if (!isLoggedIn || !user || !user.transactions) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: "Transaction verification is only available for logged-in users.",
            });
            setIsLoading(false);
            return;
        }

        const query = searchQuery.toLowerCase();
        const foundTx = user.transactions.find(tx => tx.signature.toLowerCase().includes(query) || tx.hash.toLowerCase().includes(query));

        if (foundTx) {
            setSearchResult(foundTx);
        } else {
            setSearchResult('not-found');
        }
        setIsLoading(false);
    }, 500);
  };
  
  const handleTryAgain = () => {
    setSearchQuery('');
    setSearchResult(null);
  };

  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast({ title: `${subject} Copied`, description: "Copied to clipboard successfully." });
    });
  }

  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-400">Searching on-chain records...</p>
        </div>
      )
    }

    if (searchResult === 'not-found') {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-12 bg-neutral-900/50 rounded-2xl"
            >
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Transaction Not Found</h3>
                <p className="text-neutral-400 mb-6">The signature or hash could not be found in your records.</p>
                <Button onClick={handleTryAgain} variant="outline" className="bg-neutral-800 hover:bg-neutral-700">Try Again</Button>
            </motion.div>
        )
    }

    if (searchResult) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-neutral-900/50 rounded-2xl border border-border w-full"
            >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Transaction Verified</h3>
                        <p className="text-neutral-400">This content was authenticated on Solana.</p>
                    </div>
                </div>
                 <div className="space-y-4 text-sm font-code">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-neutral-500 font-sans shrink-0">Topic</span>
                        <span className="text-white font-medium font-sans text-left sm:text-right truncate">{searchResult.topic}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-neutral-500 font-sans shrink-0">Timestamp</span>
                        <span className="text-white font-medium">{format(new Date(searchResult.createdAt), "dd MMM yyyy, HH:mm:ss")}</span>
                    </div>
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-neutral-500 font-sans shrink-0">Signature</span>
                        <div className="flex items-center gap-2 justify-start sm:justify-end min-w-0">
                            <a href={`https://explorer.solana.com/tx/${searchResult.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-primary truncate hover:underline">
                               {searchResult.signature}
                            </a>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-neutral-400 hover:text-white shrink-0" onClick={() => copyToClipboard(searchResult.signature, "Signature")}>
                                <Copy size={14} />
                            </Button>
                            <a href={`https://explorer.solana.com/tx/${searchResult.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="w-7 h-7 text-neutral-400 hover:text-white shrink-0">
                                    <ExternalLink size={14} />
                                </Button>
                            </a>
                        </div>
                    </div>
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-neutral-500 font-sans shrink-0">Content Hash</span>
                        <div className="flex items-center gap-2 justify-start sm:justify-end min-w-0">
                            <span className="text-white truncate">{searchResult.hash}</span>
                             <Button variant="ghost" size="icon" className="w-7 h-7 text-neutral-400 hover:text-white shrink-0" onClick={() => copyToClipboard(searchResult.hash, "Hash")}>
                                <Copy size={14} />
                            </Button>
                        </div>
                    </div>
                 </div>
            </motion.div>
        )
    }

    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          className="bg-card border border-border w-full max-w-3xl rounded-3xl shadow-2xl shadow-primary/10 flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <SolanaLogo />
                <h2 className="text-xl font-bold text-white">Solana Transaction Scanner</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all z-10"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-8 space-y-6 overflow-y-auto">
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by transaction signature or content hash..."
                        className="w-full bg-neutral-900 border-2 border-border h-16 rounded-xl px-6 pr-16 text-base text-white focus:border-primary focus-visible:ring-primary/50 outline-none transition-all"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                        <Search size={24} />
                    </button>
                </div>
            </form>

            <div className="min-h-[280px] flex items-center justify-center">
              {renderResult()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
