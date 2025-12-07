"use client";

import React from 'react';
import { motion } from 'framer-motion';

const SolanaLogoAnimation = () => {
  // تعريف حركات البارات (الأشرطة الملونة)
  const barVariants = {
    hidden: (custom: any) => ({
      opacity: 0,
      x: custom === "left" ? -100 : 100, // تحديد الاتجاه بناءً على المتغير
    }),
    visible: (i: any) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: [0.2, 0.8, 0.2, 1],
        delay: i * 0.2,
      },
    }),
  };

  // تعريف حركة "الطفو" المستمرة
  const floatTransition = (delay = 0) => ({
    y: [0, -12, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    },
  });

  // تعريف حركة أحرف النص
  const letterVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="relative w-full h-auto aspect-square max-w-[400px] flex flex-col"
    >
      {/* قسم الشعار - SVG */}
      <div className="flex-[7] p-4 flex items-center justify-center">
        <svg
          viewBox="0 0 1259.1 1027.2"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="SVGID_1_"
              gradientUnits="userSpaceOnUse"
              x1="265.0926" y1="538.3393" x2="994.1592" y2="1267.4124"
              gradientTransform="matrix(1 0 0 -1 0 1030)"
            >
              <stop offset="0" stopColor="#888BCF" />
              <stop offset="1" stopColor="#10F4B1" />
            </linearGradient>

            <linearGradient
              id="SVGID_2_"
              gradientUnits="userSpaceOnUse"
              x1="-3188.6152" y1="801.3309" x2="-2618.7148" y2="231.4303"
              gradientTransform="matrix(-1 0 0 -1 -2274.145 1030)"
            >
              <stop offset="0" stopColor="#6EC7BE" />
              <stop offset="1" stopColor="#957CD4" />
            </linearGradient>

            <linearGradient
              id="SVGID_3_"
              gradientUnits="userSpaceOnUse"
              x1="-3268.1621" y1="-1230.4384" x2="-2539.1108" y2="-501.3807"
              gradientTransform="matrix(-1 0 0 1 -2274.145 1766.0181)"
            >
              <stop offset="0" stopColor="#70B7C2" />
              <stop offset="0.16" stopColor="#77AFC5" />
              <stop offset="0.41" stopColor="#8A99CD" />
              <stop offset="0.71" stopColor="#A975DA" />
              <stop offset="1" stopColor="#CB4EE8" />
            </linearGradient>
          </defs>

          {/* الشريط الأول */}
           <motion.g custom={0} variants={barVariants} >
              <motion.path
                fill="url(#SVGID_1_)"
                d="M13.9,174.1L173,13.9C181.8,5,193.8,0,206.3,0H1212c41.7,0,62.8,50.4,33.3,80l-158.9,160.2 c-8.8,8.9-20.7,13.9-33.2,13.9H47.1C5.4,254.1-15.7,203.7,13.9,174.1z"
                animate={floatTransition(0)}
              />
            </motion.g>

          {/* الشريط الثاني (الوسط) */}
          <motion.g custom={1} variants={barVariants}>
              <motion.path
                fill="url(#SVGID_2_)"
                d="M1211.9,640.7H206c-12.5-0.1-24.4-5.1-33.2-13.9L13.9,466.5 c-29.6-29.6-8.5-80,33.3-80h1005.7c12.5,0,24.5,5,33.3,13.9l159.1,160.2C1274.8,590.2,1253.7,640.7,1211.9,640.7z"
                animate={floatTransition(0.5)}
              />
            </motion.g>

          {/* الشريط الثالث */}
          <motion.g custom={2} variants={barVariants}>
              <motion.path
                fill="url(#SVGID_3_)"
                d="M1245.2,853.1 l-159.1,160.2c-8.8,8.9-20.8,13.9-33.3,13.9H47.1 c-41.7,0-62.8-50.4-33.3-80l159-160.2 c-8.8,8.9-20.7,13.9-33.2-13.9h1005.9 C1253.7,773.1,1274.8,823.5,1245.2,853.1z"
                animate={floatTransition(1.0)}
              />
            </motion.g>
        </svg>
      </div>

      {/* قسم النص - SOLANA */}
      <div className="flex-[3] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1533 197.73" className="w-4/5">
          <motion.g
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.8 }} // ترتيب ظهور الأحرف
          >
            {/* الأحرف مفصولة ليتم تحريك كل حرف على حدة */}
            <motion.path variants={letterVariants} className="cls-2" fill="currentColor" d="M529.3,6.44A6.44,6.44,0,0,1,535.74,0H560.4a6.44,6.44,0,0,1,6.44,6.44v152.1a6.43,6.43,0,0,0,6.44,6.43H718.94a6.44,6.44,0,0,1,4.69,10.84L705,195.7a6.48,6.48,0,0,1-4.7,2H535.74a6.44,6.44,0,0,1-6.44-6.44Z" />
            <motion.path variants={letterVariants} className="cls-2" fill="currentColor" d="M142.23,118H60.72s0,0,0,0h0l-1.59,0a59,59,0,1,1,0-118L60.7,0H184.81a6.44,6.44,0,0,1,4.36,11.17l-27.56,25.4a6.47,6.47,0,0,1-4.36,1.7H59.07a20.73,20.73,0,0,0,0,41.46h87.81a.09.09,0,0,1,.1.1.1.1,0,0,0,.09.1,59,59,0,0,1-4.88,117.8c-1.58,0-3.15-.06-4.7-.18-.05,0-.09,0-.09.09a.1.1,0,0,1-.1.09H14.23a6.44,6.44,0,0,1-4.18-11.33L39.73,161a6.44,6.44,0,0,1,4.19-1.55h98.31a20.73,20.73,0,1,0,0-41.46Z" />
            <motion.path variants={letterVariants} className="cls-2" fill="currentColor" d="M298.24,0s0,0,0,0l0,0a36.71,36.71,0,0,0-35.1,35h0a0,0,0,0,0,0,0V159.44a0,0,0,0,0,0,0s0,0,0,0c0,.52,0,1.05,0,1.58a36.72,36.72,0,0,0,35.13,36.64s0,0,0,0,0,0,0,0H432.41l0,0s0,0,0,0a36.71,36.71,0,0,0,35.13-36.64c0-.53,0-1.06,0-1.58l0,0s0,0,0,0V35.1s0,0,0,0h0a36.7,36.7,0,0,0-35.1-35V0l0,0ZM323.4,35.08h0a23,23,0,0,0-21.93,22h0v78.22h0s0,0,0,0c0,.33,0,.66,0,1a23,23,0,0,0,22,23.05h0a0,0,0,0,0,0,0h83.85s0,0,0,0h0a23,23,0,0,0,22-23.05c0-.33,0-.66,0-1a0,0,0,0,1,0,0h0V57.16h0a23,23,0,0,0-21.93-22h0a0,0,0,0,0,0,0Z" />
            <motion.path variants={letterVariants} className="cls-2" fill="currentColor" d="M833.43,54.22V86.05a6.45,6.45,0,0,0,6.44,6.44H954.8a6.44,6.44,0,0,0,6.44-6.44V54.22a22.35,22.35,0,0,0-22.36-22.33H855.8A22.35,22.35,0,0,0,833.43,54.22ZM967.68,197.73a6.44,6.44,0,0,1-6.44-6.44V127.63a6.44,6.44,0,0,0-6.44-6.44H839.87a6.44,6.44,0,0,0-6.44,6.44v63.66a6.44,6.44,0,0,1-6.44,6.44H801.53a6.44,6.44,0,0,1-6.44-6.44v-153l0,0s0,0,0,0c0-.52,0-1,0-1.57A36.71,36.71,0,0,1,831.83,0l1.59,0h0l0,0h131l0,0V0a36.7,36.7,0,0,1,35.13,36.64c0,.52,0,1,0,1.57a0,0,0,0,0,0,0s0,0,0,0v153a6.43,6.43,0,0,1-6.43,6.44Z" />
            <motion.path variants={letterVariants} className="cls-2" fill="currentColor" d="M1366.85,54.22V86.05a6.44,6.44,0,0,0,6.44,6.44h114.93a6.44,6.44,0,0,0,6.44-6.44V54.22a22.35,22.35,0,0,0-22.37-22.33h-83.07A22.35,22.35,0,0,0,1366.85,54.22ZM1501.1,197.73a6.44,6.44,0,0,1-6.44-6.44V127.63a6.44,6.44,0,0,0-6.44-6.44H1373.29a6.44,6.44,0,0,0-6.44,6.44v63.66a6.44,6.44,0,0,1-6.44,6.44h-25.47a6.43,6.43,0,0,1-6.43-6.44v-153s0,0,0,0l0,0c0-.52,0-1,0-1.57A36.71,36.71,0,0,1,1365.25,0c.53,0,1.06,0,1.58,0h0l0,0h131V0l0,0A36.7,36.7,0,0,1,1533,36.68c0,.52,0,1,0,1.57,0,0,0,0,0,0l0,0v153a6.44,6.44,0,0,1-6.44,6.44Z" />
            <motion.path variants={letterVariants} className="cls-2" fill="currentColor" d="M1102.07,2.26a6.46,6.46,0,0,0-4.9-2.26h-28.93a6.44,6.44,0,0,0-6.44,6.44V191.29a6.44,6.44,0,0,0,6.44,6.44h25.46a6.44,6.44,0,0,0,6.44-6.44V68.19A6.44,6.44,0,0,1,1111.43,64l116.46,133.38a.25.25,0,0,1,.06.16.24.24,0,0,0,.24.24h31.66a6.44,6.44,0,0,0,6.44-6.44V6.44A6.44,6.44,0,0,0,1259.85,0h-25.46A6.44,6.44,0,0,0,1228,6.44v126a6.44,6.44,0,0,1-11.34,4.18Z" />
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
};


export function Web3Intro() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center lg:order-last">
            <SolanaLogoAnimation />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="prose prose-invert prose-lg text-neutral-300 max-w-none space-y-6"
            >
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl relative inline-block">
                 <span className="relative z-10 text-white">Authenticity in the Age of AI</span>
                 <span className="absolute -bottom-1 left-0 w-full h-4 bg-primary/80 z-0"></span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-neutral-400">
                CurioGrid is a true Web3 application that leverages the power of the Solana blockchain to bring unprecedented transparency and authenticity to AI-generated content.
              </p>
               <p>
                Every piece of content you create—from social media posts to complex AI agent configurations—can be permanently authenticated on-chain. This creates an immutable, verifiable record of your creation, timestamped and secured by Solana's high-speed network.
              </p>
               <h3 className="text-2xl font-bold text-white relative inline-block">
                <span className="relative z-10">Why Solana?</span>
                <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/80 z-0"></span>
                </h3>
              <p>
                We chose Solana for its lightning-fast transaction speeds and incredibly low costs. This allows us to offer content authentication at scale, making it accessible for every creator without the burden of high gas fees. Solana's robust infrastructure ensures that your content's authenticity is always verifiable, providing trust and credibility in a digital world saturated with AI.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
