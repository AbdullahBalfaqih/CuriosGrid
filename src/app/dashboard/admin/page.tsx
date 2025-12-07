"use client";

import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, FileText, Settings } from "lucide-react";

export default function AdminDashboardPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn === false || (isLoggedIn === true && user?.name !== 'Admin')) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    if (!user || user.name !== 'Admin') {
        return (
             <div className="w-full h-screen flex items-center justify-center bg-background">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
            <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <CurioGridLogo />
                    </Link>
                    <span className="hidden sm:inline text-2xl font-bold tracking-tight">CurioGrid - Admin</span>
                </div>
                <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                                <User size={20} />
                            </Button>
                        </Link>
                         <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                            <Settings size={20} />
                        </Button>
                </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
                <h1 className="text-5xl font-bold text-white mb-8">Admin Dashboard</h1>
                <div className="bg-card border border-border rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
                    <p className="text-neutral-400">
                        This is where you would manage all users, view their data, and perform administrative actions.
                        For this demo, this is a placeholder page.
                    </p>
                </div>
            </main>
        </div>
    );
}
