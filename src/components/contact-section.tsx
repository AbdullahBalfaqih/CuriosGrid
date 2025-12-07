"use client";

import React, { useState } from 'react';
import { MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { sendContactEmail } from '@/ai/flows/send-contact-email';
import a from "./contact.png";

export const ContactSection = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const springConfig = { stiffness: 300, damping: 20 };
    const rotateX = useSpring(useTransform(y, [-150, 150], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(x, [-250, 250], [-10, 10]), springConfig);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast({
                variant: "destructive",
                title: "Incomplete Form",
                description: "Please fill out all fields before submitting.",
            });
            return;
        }
        setIsLoading(true);
        try {
            await sendContactEmail(formData);
            toast({
                title: "Message Sent!",
                description: "Thank you for contacting us. We'll get back to you shortly.",
            });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Failed to send contact email:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Could not send your message. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-7xl mx-auto py-24 px-6"
        >
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-5xl font-bold text-white mb-4">Contact us</h2>
                <p className="text-neutral-400 text-lg mb-12">
                    We value your feedback, inquiries, and suggestions. Whether you're a content creator with questions about our platform, or a user seeking assistance, we're here to help.
                </p>
            </div>
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="bg-card border border-border rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl shadow-primary/5"
            >
                <div style={{ transform: "translateZ(40px)" }} className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="space-y-6 mb-12">
                         <div className="flex items-start gap-4">
                            <div className="text-primary pt-1"><MapPin size={24} /></div>
                            <div>
                                <h3 className="font-bold text-white">Our Location</h3>
                                <p className="text-neutral-400">Remote</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-primary pt-1"><Mail size={24} /></div>
                            <div>
                                <h3 className="font-bold text-white">Email Us</h3>
                                <p className="text-neutral-400">support@curiogrid.ai</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-primary pt-1"><Phone size={24} /></div>
                            <div>
                                <h3 className="font-bold text-white">Call Us</h3>
                                <p className="text-neutral-400">+967 776097665</p>
                            </div>
                        </div>
                    </div>
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset disabled={isLoading}>
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-neutral-300">Your name</label>
                                <Input id="name" name="name" type="text" placeholder="Your name" value={formData.name} onChange={handleChange} className="bg-neutral-900 border-neutral-800 rounded-xl h-12 focus-visible:ring-primary/50" />
                            </div>
                            <div className="space-y-2 mt-4">
                                <label htmlFor="email" className="text-sm font-medium text-neutral-300">Your email</label>
                                <Input id="email" name="email" type="email" placeholder="Your email" value={formData.email} onChange={handleChange} className="bg-neutral-900 border-neutral-800 rounded-xl h-12 focus-visible:ring-primary/50" />
                            </div>
                            <div className="space-y-2 mt-4">
                                <label htmlFor="message" className="text-sm font-medium text-neutral-300">Your message</label>
                                <Textarea id="message" name="message" placeholder="How can we help?" value={formData.message} onChange={handleChange} className="bg-neutral-900 border-neutral-800 rounded-xl min-h-[120px] focus-visible:ring-primary/50" />
                            </div>
                            <div className="mt-6">
                                <Button type="submit" className="w-full py-3 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-14">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
                                </Button>
                            </div>
                        </fieldset>
                    </form>
                </div>
                <div style={{ transform: "translateZ(20px)" }} className="relative min-h-[200px] lg:min-h-full">
                    <Image
                        src={a}
                        alt="Contact support"
                        fill
                        className="object-fill"   // ← Stretch
                    />

                </div>
            </motion.div>
        </motion.section>
    );
}
