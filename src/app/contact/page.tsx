import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { ContactSection } from "@/components/contact-section";

export default function ContactPage() {
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
      <main className="flex-1">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
