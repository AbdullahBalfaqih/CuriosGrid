
"use client";

import { useState } from 'react';
import MainDashboard from "@/components/main-dashboard";
import { TrustedBySection } from '@/components/trusted-by-section';
import { ContactSection } from '@/components/contact-section';
import { Footer } from '@/components/footer';
import { PricingCard } from '@/components/pricing-card';
import { TickerSection } from "@/components/ticker-section";
import type { Country } from '@/lib/types';
import { BenefitSection } from '@/components/benefit-section';
import { Web3Intro } from '@/components/web3-intro';


export default function Home() {
  const [activeRegion, setActiveRegion] = useState<Country>({ name: 'United States', code: 'US', sub: 'worldnews' });

  return (
    <>
      <MainDashboard activeRegion={activeRegion} onRegionChange={setActiveRegion} />
      <div className="relative z-10 bg-background">
        <Web3Intro />
        <TrustedBySection />
        <BenefitSection />

        <section className="w-full max-w-7xl mx-auto py-24 px-6">
            <h2 className="text-5xl font-bold text-center text-white mb-4">Choose Your Plan</h2>
            <p className="text-neutral-400 text-center mb-16 max-w-2xl mx-auto">
                Unlock the full power of AI content generation. Start for free and scale up as you grow.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <PricingCard 
                    plan="Starter"
                    price="0"
                    period="day"
                    description="For creators getting started with AI content."
                    features={[
                        "10 Social Posts / day",
                        "2 AI Images / day",
                        "Access to all trending topics",
                        "Standard support"
                    ]}
                    buttonText="Choose Plan"
                />
                <PricingCard 
                    plan="Pro"
                    price="10"
                    period="month"
                    description="For power users generating content at scale."
                    features={[
                        "2000 Social Posts / month",
                        "200 AI Images / month",
                        "50 Video Scripts / month",
                        "Deploy 5 AI Agents",
                        "Priority Support"
                    ]}
                    isFeatured={true}
                    buttonText="Choose Plan"
                />
                <PricingCard 
                    plan="Yearly"
                    price="89"
                    period="year"
                    description="Save big with an annual plan for dedicated creators."
                    features={[
                        "Unlimited Social Posts",
                        "Unlimited AI Images",
                        "Unlimited Video Scripts",
                        "Deploy 10 AI Agents",
                        "24/7 Priority Support"
                    ]}
                    buttonText="Choose Plan"
                />
            </div>
        </section>

        <TickerSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
