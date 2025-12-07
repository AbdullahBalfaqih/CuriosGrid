"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const PricingCard = ({
  plan,
  price,
  period,
  description,
  features,
  buttonText,
  isFeatured = false,
}: {
  plan: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isFeatured?: boolean;
}) => {
  const router = useRouter();

  const handleChoosePlan = () => {
    router.push('/dashboard/subscriptions');
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ y: -10, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative bg-card border rounded-3xl p-8 flex flex-col transition-all duration-300 ${
        isFeatured
          ? 'border-primary/50 shadow-2xl shadow-primary/10'
          : 'border-border hover:border-primary/40'
      }`}
    >
      {isFeatured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-center text-white">{plan}</h3>
      
      <div className="text-center my-8">
        <span className="text-6xl font-bold text-white tracking-tight">${price}</span>
        <span className="text-neutral-500 text-sm">/{period}</span>
      </div>

      <p className="text-center text-neutral-400 mt-2 min-h-[40px]">{description}</p>
      
      <div className="w-full h-[1px] bg-border my-8"></div>

      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Check size={12} className="text-primary" />
            </div>
            <span className="text-neutral-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleChoosePlan}
        className={`w-full mt-auto py-3 rounded-xl font-bold transition-all ${
          isFeatured
            ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20'
            : 'bg-neutral-800 hover:bg-neutral-700'
        }`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
};
