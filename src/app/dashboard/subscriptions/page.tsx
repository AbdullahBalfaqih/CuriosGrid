"use client";

import { useState } from 'react';
import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Button } from "@/components/ui/button";
import { User, Check, CreditCard, CalendarClock, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';


const PricingCard = ({
  plan,
  price,
  period,
  description,
  features,
  isCurrent = false,
  isLocked = false,
  onSelect,
}: {
  plan: 'Starter' | 'Pro' | 'Yearly';
  price: string;
  period: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isLocked?: boolean;
  onSelect: () => void;
}) => {
  const isDisabled = isCurrent || isLocked;
  
  return (
    <motion.div
      whileHover={!isDisabled ? { y: -8, scale: 1.02 } : {}}
      className={`relative bg-card border rounded-3xl p-8 flex flex-col transition-all duration-300 ${
        isCurrent
          ? 'border-primary/50 shadow-2xl shadow-primary/10'
          : isLocked
          ? 'border-border/50 bg-neutral-900/30'
          : 'border-border hover:border-primary/40'
      }`}
    >
      {isCurrent && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
            Current Plan
          </span>
        </div>
      )}
      <h3 className={`text-2xl font-bold text-center ${isDisabled ? 'text-neutral-600' : 'text-white'}`}>{plan}</h3>
      
      <div className="text-center my-8">
        <span className={`text-6xl font-bold tracking-tight ${isDisabled ? 'text-neutral-700' : 'text-white'}`}>${price}</span>
        <span className="text-neutral-500 text-sm">/{period}</span>
      </div>

      <p className={`text-center mt-2 min-h-[40px] ${isDisabled ? 'text-neutral-600' : 'text-neutral-400'}`}>{description}</p>
      
      <div className="w-full h-[1px] bg-border my-8"></div>

      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className={`flex items-center gap-3 ${isDisabled ? 'text-neutral-600' : 'text-neutral-300'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDisabled ? 'bg-neutral-800' : 'bg-primary/10'}`}>
                <Check size={12} className={isDisabled ? 'text-neutral-600' : 'text-primary'} />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={isDisabled}
        className={`w-full mt-auto py-3 rounded-xl font-bold transition-all ${
          isCurrent
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : isLocked
            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20'
        }`}
      >
        {isCurrent ? 'Your Current Plan' : isLocked ? 'Plan Locked' : 'Choose Plan'}
      </Button>
    </motion.div>
  );
};

const PaymentModal = ({ plan, onClose }: { plan: 'Pro' | 'Yearly', onClose: () => void }) => {
    const { prepareForPayment } = useUser();
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const WIDGET_IDS = {
        Pro: '5228487086',    // Monthly
        Yearly: '6217315459', // Yearly
    };
    
    useEffect(() => {
        const setupPayment = async () => {
            setIsLoading(true);
            const orderId = await prepareForPayment(plan);
            if (orderId) {
                const widgetId = WIDGET_IDS[plan];
                setPaymentUrl(`https://nowpayments.io/embeds/payment-widget?iid=${widgetId}&dark_mode=true&order_id=${orderId}`);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Payment Setup Failed',
                    description: 'Could not prepare the transaction. Please try again.',
                });
                onClose();
            }
            setIsLoading(false);
        };
        setupPayment();
    }, [plan, prepareForPayment, onClose, toast]);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                className="bg-card border border-border rounded-3xl p-8 pt-4 max-w-md w-full"
            >
                <div className='text-center mb-4'>
                    <CreditCard size={32} className="mx-auto text-primary mb-3" />
                    <h2 className="text-2xl font-bold text-white">Upgrade to {plan}</h2>
                    <p className="text-neutral-400 text-sm">Complete your payment via NOWPayments.</p>
                </div>
                
                <div className="bg-neutral-900 border border-border rounded-2xl p-1 overflow-hidden h-[500px]">
                   {isLoading && (
                       <div className="w-full h-full flex flex-col items-center justify-center">
                           <Loader2 size={32} className="animate-spin text-primary mb-4" />
                           <p className="text-neutral-400">Preparing secure payment...</p>
                       </div>
                   )}
                   {paymentUrl && !isLoading && (
                       <iframe 
                            src={paymentUrl}
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="yes"
                        >
                            Can't load widget
                        </iframe>
                   )}
                </div>
                <div className="flex gap-4 mt-6">
                    <Button onClick={onClose} variant="outline" className="w-full h-12 rounded-xl text-neutral-300 hover:text-white">Cancel</Button>
                </div>
                 <p className="text-xs text-neutral-600 text-center mt-4">
                    Your plan will be activated automatically once payment is confirmed.
                </p>
            </motion.div>
        </motion.div>
    );
}

export default function SubscriptionsPage() {
    const { user, isLoggedIn, selectPlan } = useUser();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Yearly' | null>(null);

    const plans: { plan: 'Starter' | 'Pro' | 'Yearly'; price: string; period: string; description: string; features: string[] }[] = [
        {
            plan: 'Starter',
            price: '0',
            period: 'day',
            description: "For creators getting started with AI content.",
            features: [
                "10 Social Posts / day",
                "2 AI Images / day",
                "Access to all trending topics",
                "Standard support"
            ]
        },
        {
            plan: 'Pro',
            price: '10',
            period: 'month',
            description: "For power users generating content at scale.",
            features: [
                "2000 Social Posts / month",
                "200 AI Images / month",
                "50 Video Scripts / month",
                "Deploy 5 AI Agents",
                "Priority Support"
            ],
        },
        {
            plan: 'Yearly',
            price: '89',
            period: 'year',
            description: "Save big with an annual plan for dedicated creators.",
            features: [
                "Unlimited Social Posts",
                "Unlimited AI Images",
                "Unlimited Video Scripts",
                "Deploy 10 AI Agents",
                "24/7 Priority Support"
            ]
        }
    ];
    
    if (!isLoggedIn || !user) {
         return (
            <div className="w-full h-screen flex items-center justify-center bg-background">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    const handleSelectPlan = (plan: 'Starter' | 'Pro' | 'Yearly') => {
        if (user.plan === 'Pro' || user.plan === 'Yearly') {
          return;
        }

        if (plan === 'Starter') {
          selectPlan('Starter');
          return;
        }
        setSelectedPlan(plan);
    };

    const isPaidPlanActive = user.plan === 'Pro' || user.plan === 'Yearly';

    return (
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
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <User size={20} />
                    </Button>
                </Link>
           </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p className="text-neutral-400 text-lg mb-12">
                Select the plan that fits your content creation needs. All payments are securely processed.
            </p>
        </div>

        {isPaidPlanActive && user.currentPeriodEnd && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 text-primary-foreground p-4 rounded-2xl text-center mb-12 max-w-xl mx-auto flex items-center justify-center gap-3"
            >
                <CalendarClock size={20} className="text-primary" />
                <span className="text-primary font-semibold">Your plan renews on {format(new Date(user.currentPeriodEnd), 'MMMM dd, yyyy')}.</span>
            </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {plans.map(p => (
                <PricingCard 
                    key={p.plan}
                    plan={p.plan as 'Starter' | 'Pro' | 'Yearly'}
                    price={p.price}
                    period={p.period}
                    description={p.description}
                    features={p.features}
                    isCurrent={user.plan === p.plan}
                    isLocked={isPaidPlanActive && user.plan !== p.plan}
                    onSelect={() => handleSelectPlan(p.plan as 'Starter' | 'Pro' | 'Yearly')}
                />
            ))}
        </div>
      </main>
      
      <AnimatePresence>
        {selectedPlan && (
            <PaymentModal 
                plan={selectedPlan}
                onClose={() => setSelectedPlan(null)}
            />
        )}
      </AnimatePresence>
    </div>
    );
}
