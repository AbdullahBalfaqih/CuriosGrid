"use client";

import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, ImageIcon, Video, Bot, CreditCard, Shield, LogOut, ArrowUpRight, Copy, ExternalLink, Settings, Star
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const UsageBar = ({ label, used, total, icon: Icon }: { label: string, used: number, total: number, icon: React.ElementType }) => {
  const percentage = total === 0 ? 100 : total === -1 ? 0 : (used / total) * 100;
  const isUnlimited = total === -1;

  return (
    <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 font-medium text-neutral-400">
                <Icon size={16} />
                <span>{label}</span>
            </div>
            <span className="font-mono text-neutral-300">
                {isUnlimited ? 'Unlimited' : `${used} / ${total}`}
            </span>
        </div>
        <Progress value={percentage} className="h-2" indicatorClassName={isUnlimited ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 'bg-primary'} />
    </div>
  );
}

const TransactionRow = ({ tx }: { tx: any }) => {
    const { toast } = useToast();
    const copyToClipboard = (text: string, subject: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: `${subject} Copied`, description: text });
        });
    }

    return (
        <div className="grid grid-cols-3 gap-6 items-center py-4 px-2 hover:bg-neutral-900 rounded-lg">
            <div className="col-span-1">
                <p className="text-sm font-medium text-white truncate">{tx.topic}</p>
                <p className="text-xs text-neutral-500">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</p>
            </div>
            <div className="col-span-1">
                 <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-neutral-400 truncate">{tx.hash}</p>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => copyToClipboard(tx.hash, "Hash")}>
                        <Copy size={14} />
                    </Button>
                </div>
            </div>
            <div className="col-span-1 flex justify-end">
                <a href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-8 bg-neutral-800 border-border hover:bg-neutral-700 hover:text-white">
                        <ExternalLink size={14} className="mr-2"/> View TX
                    </Button>
                </a>
            </div>
        </div>
    )
}

export default function UserDashboard() {
  const { user, isLoggedIn, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const planName = user.plan;
  const isPro = planName === 'Pro' || planName === 'Yearly';

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-lg text-neutral-400">{user.email || 'No email associated'}</p>
        </div>
         <div className="flex items-center gap-2">
             <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout}>
                 <LogOut size={20} className="mr-2"/> Logout
             </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Usage Quotas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <UsageBar label="Smart Posts" used={user.usage.posts.used} total={user.usage.posts.total} icon={MessageSquare} />
                    <UsageBar label="AI Images" used={user.usage.images.used} total={user.usage.images.total} icon={ImageIcon} />
                    <UsageBar label="Video Scripts" used={user.usage.scripts.used} total={user.usage.scripts.total} icon={Video} />
                    <UsageBar label="AI Agents" used={user.usage.agents.used} total={user.usage.agents.total} icon={Bot} />
                </div>
            </div>
            <div className="bg-card border border-border rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Content Authentication</h2>
                <p className="text-neutral-400 mb-6">Your recent on-chain content authentications on Solana Devnet.</p>
                
                <div className="divide-y divide-border">
                    <div className="grid grid-cols-3 gap-6 pb-2 text-sm font-semibold text-neutral-500 px-2">
                        <span>Topic</span>
                        <span>Content Hash</span>
                        <span className="text-right">Transaction</span>
                    </div>
                     {user.transactions && user.transactions.length > 0 ? (
                        user.transactions.slice(0, 5).map(tx => <TransactionRow key={tx.id} tx={tx} />)
                    ) : (
                        <div className="text-center py-16">
                            <Shield size={40} className="mx-auto text-neutral-700 mb-4"/>
                            <h3 className="text-xl font-bold text-neutral-500">No Transactions Yet</h3>
                            <p className="text-neutral-600">Authenticated content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-2">Your Plan</h2>
            <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${isPro ? 'text-primary' : 'text-neutral-400'}`}>{planName}</span>
                {isPro && <Star size={18} className="text-yellow-400 fill-yellow-400" />}
            </div>
            <p className="text-neutral-400 flex-grow">{isPro ? "You have access to all premium features." : "You are on the free starter plan."}</p>
            <Link href="/dashboard/subscriptions">
                <Button variant="outline" className="w-full mt-6 h-12 text-base font-bold bg-neutral-800 border-border hover:bg-neutral-700 hover:text-white">
                    <CreditCard size={18} className="mr-2"/> Manage Subscription
                </Button>
            </Link>
            <Link href="/dashboard/subscriptions">
                <Button className="w-full mt-4 h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                    <ArrowUpRight size={18} className="mr-2"/> Upgrade to Pro
                </Button>
            </Link>
        </div>

      </div>
    </main>
  );
}
