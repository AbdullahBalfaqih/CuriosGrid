"use client";

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LogoCloud } from './logo-cloud';

const benefits = [
  {
    title: "Content Creation",
    description: "Generate engaging social media posts, image prompts, and video scripts based on the latest trends to keep your audience hooked.",
    image: "https://i.ibb.co/RchF2v1/image.png",
    imageHint: "creative workspace"
  },
  {
    title: "Marketing & Advertising",
    description: "Tailor your marketing campaigns to what's currently capturing attention. Create relevant ads and promotional content that converts.",
    image: "https://i.ibb.co/rGvrgq0/image-removebg-preview.png",
    imageHint: "marketing analytics"
  },
  {
    title: "E-commerce & Sales",
    description: "Automate product descriptions, generate promotional ideas, and align your sales strategy with trending products and topics.",
    image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=1080&auto=format&fit=crop",
    imageHint: "online shopping"
  },
];

export function BenefitSection() {
  const [activeAccordion, setActiveAccordion] = useState('item-0');

  const getImageForIndex = (index: number) => {
    return benefits[index]?.image || "https://picsum.photos/seed/placeholder/500/500";
  }

  const getHintForIndex = (index: number) => {
    return benefits[index]?.imageHint || "abstract";
  }

  const activeIndex = parseInt(activeAccordion.split('-')[1] || '0', 10);
  const springTransition = { type: "spring", stiffness: 400, damping: 30 };

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <LogoCloud />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-last lg:order-first h-[500px] w-full">
            <AnimatePresence initial={false}>
                <motion.div
                    key={`image-${activeIndex}`}
                    initial={{ opacity: 0, x: 50, scale: 0.8, rotate: 10 }}
                    animate={{ opacity: 1, x: 0, scale: 1, rotate: 8 }}
                    exit={{ opacity: 0, x: -50, scale: 0.8, rotate: 0 }}
                    transition={springTransition}
                    className="absolute top-10 left-10 w-3/4 h-3/4"
                >
                    <Image
                        src={getImageForIndex(activeIndex)}
                        alt={getHintForIndex(activeIndex)}
                        width={500}
                        height={500}
                        className="rounded-3xl shadow-2xl object-cover w-full h-full"
                        data-ai-hint={getHintForIndex(activeIndex)}
                    />
                </motion.div>
                <motion.div
                    key={`image-${(activeIndex + 1) % benefits.length}`}
                    initial={{ opacity: 0, x: 50, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, x: 0, scale: 1, rotate: -12 }}
                    exit={{ opacity: 0, x: -50, scale: 0.8, rotate: -20 }}
                    transition={springTransition}
                     className="absolute bottom-0 right-0 w-2/3 h-2/3"
                >
                     <Image
                        src={getImageForIndex((activeIndex + 1) % benefits.length)}
                        alt={getHintForIndex((activeIndex + 1) % benefits.length)}
                        width={400}
                        height={400}
                        className="rounded-3xl shadow-2xl object-cover w-full h-full"
                        data-ai-hint={getHintForIndex((activeIndex + 1) % benefits.length)}
                    />
                </motion.div>
                 <motion.div
                    key={`image-${(activeIndex + 2) % benefits.length}`}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                    transition={springTransition}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2"
                >
                     <Image
                        src={getImageForIndex((activeIndex + 2) % benefits.length)}
                        alt={getHintForIndex((activeIndex + 2) % benefits.length)}
                        width={300}
                        height={300}
                        className="rounded-3xl shadow-2xl object-cover w-full h-full"
                        data-ai-hint={getHintForIndex((activeIndex + 2) % benefits.length)}
                    />
                </motion.div>
            </AnimatePresence>
          </div>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                AI-Powered solutions for every industry
              </h2>
              <p className="mt-6 text-lg leading-8 text-neutral-400">
                CurioGrid harnesses the power of real-time trends to provide actionable insights and automated content generation, helping you stay ahead of the curve.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10"
            >
              <Accordion type="single" collapsible defaultValue="item-0" className="w-full" onValueChange={(value) => value && setActiveAccordion(value)}>
                {benefits.map((benefit, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b-neutral-800">
                    <AccordionTrigger className="py-6 text-lg font-semibold text-white hover:no-underline data-[state=open]:text-primary">
                      {benefit.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-neutral-400 pb-6">
                      {benefit.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
