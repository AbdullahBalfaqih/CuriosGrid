"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, ImageIcon, Video, Bot, X, Wand2, Zap, Copy, RefreshCw, Download, Lock, ArrowUpRight, ShieldCheck, Loader2, BrainCircuit, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Trend } from '@/lib/types';
import { isArabic } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';

import { 
  Connection, 
  PublicKey, 
  TransactionInstruction, 
  SystemProgram, 
  Keypair, 
  ComputeBudgetProgram,   
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';

import { generateSocialMediaPost } from '@/ai/flows/generate-social-media-post';
import { generateImagePrompt } from '@/ai/flows/generate-image-prompt';
import { generateAiScript } from '@/ai/flows/generate-ai-script';
import { deployAIAgent } from '@/ai/flows/deploy-ai-agent';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';

type PostResult = { post: string };
type ImageResult = { url: string; prompt: string };
type ScriptResult = { time: string; text: string }[];
type AgentResult = { name: string; status: string; preview: string };
type GenerationResult = PostResult | ImageResult | ScriptResult | AgentResult;

interface ActionModalProps {
  trend: Trend;
  onClose: () => void;
}

type ActionType = 'post' | 'image' | 'script' | 'bot';

const ACTION_ICONS = {
    post: MessageSquare,
    image: ImageIcon,
    script: Video,
    bot: Wand2,
};

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:fill-white fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
  </svg>
);

const RedditIcon = () => (
    <img src="https://www.redditstatic.com/favicon.ico" alt="Reddit" width="20" height="20" />
);

const SolanaLogo = () => (
    <img src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1773261825/image-removebg-preview_58_kiweyh.png" alt="Solana" className="h-5" />
)

export const ActionModal = ({ trend, onClose }: ActionModalProps) => {
  const [activeTab, setActiveTab] = useState<ActionType>('post');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const { toast } = useToast();
  const { user, decrementUsage, addDraft, addTransaction } = useUser();
  const router = useRouter();

  const tabs: { id: ActionType; label: string; disabled: boolean; used: number; total: number }[] = useMemo(() => {
    if (!user) return [];
    
    const isStarter = user.plan === 'Starter';
    
    return [
      { id: 'post', label: 'Smart Post', disabled: false, ...user.usage.posts },
      { id: 'image', label: 'AI Image Gen', disabled: false, ...user.usage.images },
      { id: 'script', label: 'Video Script', disabled: isStarter, ...user.usage.scripts },
      { id: 'bot', label: 'AI Agent', disabled: isStarter, ...user.usage.agents },
    ];
  }, [user]);

  useEffect(() => { setResult(null); }, [activeTab]);

  const handleGenerate = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "User not found." });
        return;
    }

    const usageKey = activeTab === 'post' ? 'posts' : activeTab === 'image' ? 'images' : activeTab === 'script' ? 'scripts' : 'agents';
    const currentUsage = user.usage[usageKey];
    
    const planType = user.plan === 'Starter' ? 'daily' : 'monthly';
    const limit = PLAN_LIMITS[user.plan][usageKey].total;

    if (limit !== -1 && currentUsage.used >= limit) {
        toast({
            variant: "destructive",
            title: "Usage Limit Reached",
            description: `You've reached your ${planType} limit for ${usageKey}. Please upgrade for more.`,
        });
        router.push('/dashboard/subscriptions');
        return;
    }

    setLoading(true);
    setResult(null);
    const topicText = trend.fullTitle || trend.topic;

    try {
        let content: GenerationResult | null = null;
        if (activeTab === 'post') {
            setLoadingStep('Generating post...');
            const postContent = await generateSocialMediaPost({ topic: topicText, platform: 'Twitter' });
            content = { post: postContent };
        } else if (activeTab === 'image') {
            setLoadingStep('Generating creative prompt...');
            const { prompt } = await generateImagePrompt({ topic: topicText });
            const enhancedPrompt = `High quality, highly detailed, trending news style, ${prompt}, cinematic lighting, 4k`;
            
            setLoadingStep('Generating image with AI...');
            const { imageUrl } = await generateImageFromPrompt({ prompt: enhancedPrompt });
            
            content = { 
                url: imageUrl, 
                prompt: enhancedPrompt 
            };
        } else if (activeTab === 'script') {
            setLoadingStep('Generating video script...');
            content = await generateAiScript({ topic: topicText });
        } else if (activeTab === 'bot') {
            setLoadingStep('Deploying AI agent...');
            content = await deployAIAgent({ topic: topicText, language: isArabic(topicText) ? 'Arabic' : 'English' });
        }
        setResult(content);
        decrementUsage(usageKey);
        const remaining = limit === -1 ? 'Unlimited' : (limit - currentUsage.used - 1);
        toast({
            title: "Content Generated!",
            description: `1 ${usageKey} credit used. ${remaining} remaining.`,
        });
    } catch (error) {
        console.error("AI Generation Failed:", error);
        toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: "Could not generate content. Please try again later.",
        });
    } finally {
        setLoading(false);
        setLoadingStep('');
    }
  };

  const copyToClipboard = (text: any, message?: string) => {
    let textToCopy = "";
    if (typeof text === 'string') {
        textToCopy = text;
    } else if (text && typeof text === 'object') {
        if (activeTab === 'image' && 'prompt' in text) textToCopy = (text as ImageResult).prompt;
        else if (activeTab === 'post' && 'post' in text) textToCopy = (text as PostResult).post;
        else textToCopy = JSON.stringify(text, null, 2);
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
          toast({
              title: message || "Copied to clipboard!",
              description: isArabic(textToCopy) ? "تم النسخ بنجاح!" : "Content has been copied.",
          });
      });
    }
  };

  const getContentToAuthenticate = (): string => {
    if (!result) return "";
    let contentString = "";
    if (typeof result === 'string') {
      contentString = result;
    } else if ('post' in result) {
      contentString = (result as PostResult).post;
    } else if ('prompt' in result) {
      contentString = `Prompt: ${(result as ImageResult).prompt}, URL: ${(result as ImageResult).url}`;
    } else if (Array.isArray(result)) {
      contentString = result.map(s => `${s.time}: ${s.text}`).join('\n');
    } else if ('name' in result) {
      contentString = `Agent: ${result.name}, Status: ${result.status}, Preview: ${result.preview}`;
    }
    return contentString;
  };

  const handleAuthenticateOnSolana = async () => {
    const content = getContentToAuthenticate();
    if (!content || !user) {
      toast({ variant: 'destructive', title: 'No Content or User', description: 'Please generate content and be logged in.' });
      return;
    }
  
    setIsAuthenticating(true);
    const { update: updateToast } = toast({
        title: "Authenticating on Solana... ⏳",
        description: "Please approve the transaction in your wallet.",
        duration: Infinity,
    });
  
    try {
      const phantomProvider = window.phantom?.solana;
      if (!phantomProvider?.isPhantom) {
        updateToast({ variant: 'destructive', title: 'Phantom Wallet Not Found', description: 'Please install Phantom Wallet.' });
        window.open('https://phantom.app/', '_blank');
        setIsAuthenticating(false);
        return;
      }
      
      await phantomProvider.connect();
      const publicKey = phantomProvider.publicKey;
  
      if (!publicKey) throw new Error('Wallet not connected');
  
      const connection = new Connection("https://devnet.helius-rpc.com/?api-key=7cb7dddc-f216-4633-90ff-b4f69c088f42", "confirmed");

      // Use the official SPL Memo Program ID
      const programId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashString = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      // Store a hash instead of full content to save space and avoid transaction size limits
      const instructionData = Buffer.from(`CurioGrid Auth: ${hashString}`, "utf8");

      const instruction = new TransactionInstruction({
        keys: [],
        programId: programId,
        data: instructionData,
      });

      const instructions = [
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
        instruction
      ];

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      const messageV0 = new TransactionMessage({
        payerKey: publicKey, recentBlockhash: latestBlockhash.blockhash, instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      
      const signedTransaction = await phantomProvider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
      });
      
      updateToast({ title: 'Transaction Sent...', description: 'Waiting for confirmation on the Solana network.' });

      const confirmation = await connection.confirmTransaction(
        {
          signature: signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed'
      );
      
      await addTransaction({ signature, hash: hashString, topic: trend.topic });

      if (confirmation.value.err) {
        console.error("Solana transaction confirmation error:", confirmation.value.err);
        const simError = await connection.simulateTransaction(transaction);
        console.error("Solana Logs:", simError.value.logs);

        updateToast({
          variant: 'destructive',
          title: 'Transaction Failed',
          description: `Transaction failed to confirm. Check the explorer for details.`,
          duration: 10000,
          action: <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="bg-black/20 text-white font-bold py-1 px-3 rounded-md hover:bg-black/30">View TX</a>
        });
      } else {
        updateToast({
            title: "Authenticated Successfully! ✅",
            description: `Content secured on Solana Devnet.`,
            duration: 10000,
            action: <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="bg-black text-white font-bold py-1 px-3 rounded-md hover:bg-neutral-800">View TX</a>,
        });
      }
  
    } catch (error: any) {
      console.error("Solana Authentication Error:", error);
      if (error.logs) {
          console.error("Solana Logs:", error.logs);
      }
      let errorMessage = "Could not send transaction. See console for details.";
      if (error.message?.includes("User rejected")) {
        errorMessage = "You rejected the transaction in your wallet.";
      } else if (error.message?.includes("Attempt to debit an account") || error.message?.includes("insufficient funds")) {
        errorMessage = "Your Phantom wallet has 0 SOL on Devnet. Please get some from faucet.solana.com first.";
      }
      
      updateToast({
        variant: "destructive",
        title: "Authentication Failed",
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };


  const handleShare = (platform: 'twitter' | 'reddit') => {
    let shareUrl = '';
    let textContent = '';
    let urlContent = '';
  
    if (result && typeof result === 'object' && 'post' in result) {
      textContent = (result as PostResult).post;
    } else if (result && typeof result === 'object' && 'prompt' in result && 'url' in result) {
      textContent = (result as ImageResult).prompt;
      urlContent = (result as ImageResult).url;
    } else {
        textContent = JSON.stringify(result, null, 2);
    }
  
    const fullText = (activeTab === 'image' ? `Image Prompt: ${textContent}\n\n${urlContent}` : textContent) + `\n\n#CurioGridAI`;
  
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    } else if (platform === 'reddit') {
      shareUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(trend.topic)}&text=${encodeURIComponent(fullText)}`;
    }
  
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveDraft = () => {
    if (result) {
        addDraft({
          type: activeTab,
          content: result,
          topic: trend.topic,
        });
        toast({
          title: "Draft Saved!",
          description: "Your content has been saved to your drafts."
        });
    }
  };
  
  const renderResult = () => {
    if (!result) return null;

    if (activeTab === 'image' && typeof result === 'object' && 'url' in result) {
        const imageResult = result as ImageResult;
        return (
             <div className="space-y-4">
                 <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
                     <img src={imageResult.url} alt={imageResult.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                     <a href={imageResult.url} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white hover:bg-black/80 flex items-center gap-2">
                        <Download size={12}/> Download HD
                     </a>
                 </div>
                 <p className="text-xs text-neutral-500 italic truncate hidden">
                    Prompt: {imageResult.prompt}
                </p>
             </div>
        );
    }
    
    let textResult = '';
    if (typeof result === 'object' && result && 'post' in result) {
      textResult = (result as PostResult).post;
    } else if (Array.isArray(result)) {
        return (
            <div className="space-y-4 font-code text-sm">
                {result.map((line, index) => (
                    <div key={index} className="flex gap-4">
                        <span className="font-bold text-primary">{line.time}</span>
                        <p className="text-neutral-300">{line.text}</p>
                    </div>
                ))}
            </div>
        );
    } else {
      textResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    }

    return (
        <pre className="whitespace-pre-wrap font-body text-lg leading-relaxed text-left text-neutral-200" style={{direction: isArabic(textResult) ? 'rtl' : 'ltr'}}>
            {textResult}
        </pre>
    );
  }

  const handleTabClick = (tab: (typeof tabs)[0]) => {
      if (tab.disabled) {
          toast({
              variant: "destructive",
              title: "Upgrade Required",
              description: `The "${tab.label}" feature requires a Pro plan.`,
              action: <button onClick={() => router.push('/dashboard/subscriptions')} className="bg-white text-black font-bold py-1 px-3 rounded-md">Upgrade</button>
          });
      } else {
          setActiveTab(tab.id);
      }
  }

  const PLAN_LIMITS = {
    Starter: {
      posts: { used: 0, total: 10 },
      images: { used: 0, total: 2 },
      scripts: { used: 0, total: 0 },
      agents: { used: 0, total: 0 },
    },
    Pro: {
      posts: { used: 0, total: 2000 },
      images: { used: 0, total: 200 },
      scripts: { used: 0, total: 50 },
      agents: { used: 0, total: 5 },
    },
    Yearly: {
      posts: { used: 0, total: -1 }, // Unlimited
      images: { used: 0, total: -1 }, // Unlimited
      scripts: { used: 0, total: -1 }, // Unlimited
      agents: { used: 0, total: 10 },
    },
  };


  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-card border border-border w-full max-w-5xl rounded-3xl shadow-2xl shadow-primary/10 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border flex justify-between items-center bg-card">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"><Wand2 size={24} className="text-primary" /></div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">AI Content Studio</h2>
                <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-400">Target: <span className="text-white font-semibold bg-neutral-800 px-2 py-0.5 rounded-md max-w-[200px] md:max-w-[300px] truncate">{trend.topic}</span></div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"><X size={20} /></button>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <div className="w-full md:w-72 bg-card md:border-r border-border p-2 md:p-4 flex-col gap-2">
               {tabs.map(tab => {
                    const Icon = ACTION_ICONS[tab.id];
                    const usageText = tab.total === -1 ? `∞` : `${tab.total - tab.used}`;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab)}
                            disabled={tab.disabled}
                            className={`flex items-center justify-between gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl text-left transition-all w-full
                                ${activeTab === tab.id ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' : 
                                tab.disabled ? 'text-neutral-600 cursor-not-allowed' : 
                                'text-neutral-300 hover:bg-neutral-900 hover:text-white'}
                            `}
                        >
                        <span className="flex items-center gap-3">
                           <Icon size={20} className={tab.disabled ? 'text-neutral-500' : ''}/> 
                           <span className="font-semibold text-sm md:text-base">{tab.label}</span>
                        </span>
                          <span className={`text-xs font-mono px-2 py-1 rounded-md flex items-center gap-1 ${
                           activeTab === tab.id ? 'bg-black/20 text-primary-foreground' : 
                           tab.disabled ? 'bg-neutral-800 text-neutral-500' : 
                           'bg-neutral-800 text-neutral-400'
                          }`}>
                            {tab.disabled ? <Lock size={12}/> : <>{usageText} <span className="hidden group-hover:inline">left</span></> }
                          </span>
                        </button>
                    )
               })}
            </div>

            <div className="flex-1 p-4 md:p-8 bg-card relative overflow-y-auto custom-scrollbar">
                {!result && !loading && !tabs.find(t => t.id === activeTab)?.disabled && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-6"><Wand2 size={40} className="text-primary" /></div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">AI Magic Ready</h3>
                        <p className="text-neutral-400 text-sm md:text-base mb-8">Generate content for "{trend.topic}" in {isArabic(trend.fullTitle || trend.topic) ? 'Arabic' : 'English'}.</p>
                        
                        <button onClick={handleGenerate} className="px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl hover:shadow-white/10 flex items-center gap-2">
                            Generate Now <Zap size={18} className="fill-black"/>
                        </button>
                    </motion.div>
                )}

                 {!result && !loading && tabs.find(t => t.id === activeTab)?.disabled && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-6"><Lock size={40} className="text-primary" /></div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Upgrade to Unlock</h3>
                        <p className="text-neutral-400 text-sm md:text-base mb-8">This feature is available on our Pro and Yearly plans. Upgrade your account to generate video scripts and deploy AI agents.</p>
                        
                        <button onClick={() => router.push('/dashboard/subscriptions')} className="px-6 py-3 md:px-8 md:py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20 flex items-center gap-2">
                            Upgrade Plan <ArrowUpRight size={18}/>
                        </button>
                    </motion.div>
                )}

                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="loader" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-32 text-primary font-code animate-pulse">
                            {loadingStep || 'GENERATING CONTENT...'}
                        </p>
                    </div>
                )}


                {result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg md:text-xl font-bold text-white">Generated Output</h3>
                            <div className="flex gap-2">
                                <button onClick={() => copyToClipboard(result)} className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg"><Copy size={18}/></button>
                                <button onClick={() => {setResult(null); setLoading(false);}} className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg"><RefreshCw size={18}/></button>
                            </div>
                        </div>
                        
                        <div className="bg-neutral-900/50 border border-border rounded-2xl p-4 md:p-6">
                             {renderResult()}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAuthenticateOnSolana}
                                disabled={isAuthenticating}
                                className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {isAuthenticating ? (
                                    <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
                                ) : (
                                    <><SolanaLogo /> Authenticate</>
                                )}
                            </button>
                        </div>

                        {(activeTab === 'post' || activeTab === 'image') && (
                            <div className="flex gap-4">
                                <button onClick={() => handleShare('twitter')} className="flex-1 group py-3 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                                     <XIcon />
                                </button>
                                <button onClick={() => handleShare('reddit')} className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                                     <RedditIcon />
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                             <button onClick={handleSaveDraft} className="w-full py-4 bg-black border border-border text-white font-bold rounded-xl hover:bg-neutral-800 transition-all">Save Draft</button>
                        </div>
                    </motion.div>
                )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
