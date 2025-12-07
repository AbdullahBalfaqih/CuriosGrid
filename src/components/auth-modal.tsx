

"use client";

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail, KeyRound, User, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { CurioGridLogo } from './trend-pulse-logo';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/hooks/use-user';
import { Progress } from './ui/progress';


const GoogleIcon = () => (
    <Image
        src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
        alt="Google Logo"
        width={24}
        height={24}
    />
);

const MetamaskIcon = () => (
    <Image 
        src="https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg"
        alt="Metamask Logo"
        width={24}
        height={24}
    />
);

const PhantomIcon = () => (
    <Image
        src="https://docs.phantom.com/mintlify-assets/_mintlify/favicons/phantom-e50e2e68/iJ-2hg6MaJphnoGv/_generated/favicon/apple-touch-icon.png"
        alt="Phantom Logo"
        width={24}
        height={24}
    />
);


interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState<string | false>(false);
  const [activeTab, setActiveTab] = useState('sign-in');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const { signUp, signIn, signInWithGoogle, signInWithMetaMask, signInWithPhantom } = useUser();

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please sign in or use a different email.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    setIsLoading(type);

    try {
      if (type === 'signup') {
        await signUp(email, password, name);
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
      }
      onClose();
      router.push('/dashboard');
    } catch (error: any) {
      console.error(`${type} failed`, error);
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      toast({
        variant: "destructive",
        title: `${type === 'signin' ? 'Sign In' : 'Sign Up'} Failed`,
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      onClose();
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign In failed", error);
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      toast({
        variant: "destructive",
        title: "Google Sign In Failed",
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaMaskSignIn = async () => {
    setIsLoading('metamask');
    try {
      const result = await signInWithMetaMask();
      if (result !== null) {
        toast({
          title: 'MetaMask Connected!',
          description:
            'You have successfully connected your MetaMask wallet.',
        });
        onClose();
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('MetaMask Sign In failed', error);
      toast({
        variant: 'destructive',
        title: 'MetaMask Sign In Failed',
        description:
          error.message || 'Could not connect to MetaMask. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhantomSignIn = async () => {
    if (typeof window.phantom?.solana === 'undefined') {
        toast({
            variant: "destructive",
            title: "Phantom Wallet Not Found",
            description: "Please install the Phantom wallet extension to sign in.",
        });
        return;
    }
    setIsLoading('phantom');
    try {
      const result = await signInWithPhantom();
      if (result !== null) {
        toast({
          title: 'Phantom Connected!',
          description:
            'You have successfully connected your Phantom wallet.',
        });
        onClose();
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Phantom Sign In failed', error);
      toast({
        variant: 'destructive',
        title: 'Phantom Sign In Failed',
        description:
          error.message || 'Could not connect to Phantom. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (!password) return null;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', value: 33, color: 'bg-red-500' };
    if (score <= 4) return { label: 'Medium', value: 66, color: 'bg-yellow-500' };
    return { label: 'Strong', value: 100, color: 'bg-primary' };
  }, [password]);

  const isSignUpDisabled = useMemo(() => {
    if (isLoading) return true;
    if (activeTab !== 'create-account') return false;
    return passwordStrength?.label === 'Weak';
  }, [isLoading, activeTab, passwordStrength]);


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
          className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl shadow-primary/10 flex flex-col overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all z-10"
          >
            <X size={16} />
          </button>
          
          <div className="p-8 text-center border-b border-border">
            <div className="flex justify-center mb-4"><CurioGridLogo /></div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to CurioGrid</h2>
            <p className="text-neutral-400 mt-1">Harness Real-Time Trends with AI.</p>
          </div>
          
          <div className="w-full">
            <div className="bg-card p-2 grid grid-cols-2 gap-2 relative">
                {['sign-in', 'create-account'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="relative z-10 rounded-xl py-2.5 text-sm font-medium transition-colors text-neutral-400"
                    >
                        {tab === activeTab && (
                            <motion.div
                                layoutId="auth-tab-highlight"
                                className="absolute inset-0 bg-neutral-900 rounded-lg"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className={`relative transition-colors ${activeTab === tab ? 'text-white' : 'text-neutral-400'}`}>
                            {tab === 'sign-in' ? 'Sign In' : 'Create Account'}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'sign-in' ? (
                       <div className="p-8 pt-6">
                         <form onSubmit={(e) => handleAuthSubmit(e, 'signin')} className="space-y-6">
                           <fieldset disabled={!!isLoading} className="space-y-4">
                             <div className="relative">
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                               <Input id="email-signin" type="email" placeholder="Email address" className="bg-neutral-900 border-neutral-800 rounded-xl h-14 pl-12 text-base" required value={email} onChange={e => setEmail(e.target.value)} />
                             </div>
                             <div className="relative">
                               <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                               <Input id="password-signin" type="password" placeholder="Password" className="bg-neutral-900 border-neutral-800 rounded-xl h-14 pl-12 text-base" required value={password} onChange={e => setPassword(e.target.value)}/>
                             </div>
                           </fieldset>
                           <Button type="submit" className="w-full py-3 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-14" disabled={!!isLoading}>
                             {isLoading === 'signin' ? (
                                 <>
                                     <Loader2 className="animate-spin mr-2" />
                                     Signing In...
                                 </>
                             ) : 'Sign In'}
                           </Button>
                         </form>
                         <div className="flex items-center gap-4 my-6">
                             <Separator className="flex-1 bg-border" />
                             <span className="text-xs text-neutral-500">OR</span>
                             <Separator className="flex-1 bg-border" />
                         </div>
                         <div className="space-y-4">
                            <Button variant="outline" className="w-full h-14 text-base rounded-xl border-border bg-neutral-900 hover:bg-neutral-800 hover:text-white flex items-center justify-center gap-3" disabled={!!isLoading} onClick={handleGoogleSignIn}>
                               {isLoading === 'google' ? <Loader2 className="animate-spin" /> : <><GoogleIcon /> <span>Sign in with Google</span></>}
                           </Button>
                           <div className="grid grid-cols-2 gap-4">
                           <Button variant="outline" className="h-14 text-base rounded-xl border-border bg-neutral-900 hover:bg-neutral-800 hover:text-white flex items-center gap-3" disabled={!!isLoading} onClick={handleMetaMaskSignIn}>
                               {isLoading === 'metamask' ? <Loader2 className="animate-spin" /> : <><MetamaskIcon /> <span>MetaMask</span></>}
                           </Button>
                             <Button variant="outline" className="h-14 text-base rounded-xl border-border bg-neutral-900 hover:bg-neutral-800 hover:text-white flex items-center gap-3" disabled={!!isLoading} onClick={handlePhantomSignIn}>
                               {isLoading === 'phantom' ? <Loader2 className="animate-spin" /> : <><PhantomIcon /> <span>Phantom</span></>}
                           </Button>
                           </div>
                         </div>
                       </div>
                    ) : (
                       <div className="p-8 pt-6">
                         <form onSubmit={(e) => handleAuthSubmit(e, 'signup')} className="space-y-6">
                           <fieldset disabled={!!isLoading} className="space-y-4">
                             <div className="relative">
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                               <Input id="name-signup" type="text" placeholder="Full Name" className="bg-neutral-900 border-neutral-800 rounded-xl h-14 pl-12 text-base" required value={name} onChange={e => setName(e.target.value)} />
                             </div>
                             <div className="relative">
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                               <Input id="email-signup" type="email" placeholder="Email address" className="bg-neutral-900 border-neutral-800 rounded-xl h-14 pl-12 text-base" required value={email} onChange={e => setEmail(e.target.value)} />
                             </div>
                             <div className="relative">
                               <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                               <Input 
                                 id="password-signup" 
                                 type="password" 
                                 placeholder="Password" 
                                 className="bg-neutral-900 border-neutral-800 rounded-xl h-14 pl-12 text-base" 
                                 required
                                 value={password}
                                 onChange={(e) => setPassword(e.target.value)}
                               />
                             </div>
                             {passwordStrength && (
                                <div className="space-y-2">
                                    <Progress value={passwordStrength.value} className={`h-1 [&>div]:${passwordStrength.color}`} />
                                    <p className={`text-xs font-medium ${
                                        passwordStrength.label === 'Weak' ? 'text-red-500' :
                                        passwordStrength.label === 'Medium' ? 'text-yellow-500' :
                                        'text-primary'
                                    }`}>
                                        Password strength: {passwordStrength.label}
                                    </p>
                                </div>
                             )}
                           </fieldset>
                           <Button type="submit" className="w-full py-3 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-14" disabled={isSignUpDisabled}>
                             {isLoading === 'signup' ? (
                                 <>
                                     <Loader2 className="animate-spin mr-2" />
                                     Creating Account...
                                 </>
                             ) : 'Create Account'}
                           </Button>
                         </form>
                         <p className="text-xs text-neutral-500 text-center mt-6">
                             By creating an account, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
                         </p>
                       </div>
                    )}
                </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
