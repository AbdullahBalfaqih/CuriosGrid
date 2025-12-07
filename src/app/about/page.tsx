import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Footer } from "@/components/footer";
import Link from 'next/link';

export default function AboutPage() {
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
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-24 w-full flex-1">
        <h1 className="text-5xl font-bold text-white mb-6">About CurioGrid</h1>
        <div className="prose prose-invert prose-lg text-neutral-300 max-w-none space-y-6">
            <p>
                Welcome to CurioGrid, the revolutionary platform designed to empower content creators, marketers, and businesses by harnessing the power of real-time trends and artificial intelligence. Our mission is to transform the way content is created, making it more relevant, engaging, and impactful than ever before.
            </p>
            <p>
                In today's fast-paced digital world, staying ahead of the curve is crucial. Trends emerge and vanish in the blink of an eye. We built CurioGrid to solve this challenge. Our sophisticated algorithms constantly scan the digital landscape, from social media platforms to news outlets, identifying viral topics and emerging narratives as they happen.
            </p>
            <h2 className="text-3xl font-bold text-white">Our Vision</h2>
            <p>
                We envision a world where creativity is amplified by technology. Where anyone, from an individual blogger to a large enterprise, can instantly tap into the global conversation and produce high-quality content that resonates with their audience. CurioGrid is more than just a tool; it's a creative partner that helps you unlock your full potential.
            </p>
            <p>
                Thank you for being a part of our journey. Together, let's shape the future of content.
            </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
