import UserDashboard from "@/components/user-dashboard";
import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Button } from "@/components/ui/button";
import { User, FileText, Settings, CreditCard, Download } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
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
                <Link href="/dashboard/drafts">
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <FileText size={20} />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                    <User size={20} />
                </Button>
           </div>
        </div>
      </nav>
      <UserDashboard />
    </div>
  );
}
