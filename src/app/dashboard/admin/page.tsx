
"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, type UserProfile } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { collection, onSnapshot, query, getDocs, Query, DocumentData } from 'firebase/firestore';
import { useFirestore } from "@/firebase";
import { CurioGridLogo } from "@/components/trend-pulse-logo";
import { Button } from "@/components/ui/button";
import { User, Settings, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type UserWithId = UserProfile & { id: string };

const AdminUserRow = ({ profile }: { profile: UserWithId }) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const planVariant = (plan: string): "default" | "secondary" | "outline" | "destructive" => {
        switch (plan) {
            case 'Pro': return 'default';
            case 'Yearly': return 'default';
            default: return 'secondary';
        }
    }
    
    const statusVariant = (endDate?: string): "active" | "inactive" => {
      if (!endDate) return "inactive";
      return new Date(endDate) > new Date() ? "active" : "inactive";
    }

    const currentStatus = statusVariant(profile.currentPeriodEnd);

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} />
                        <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-white">{profile.name}</div>
                        <div className="text-sm text-neutral-500">{profile.email}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant={planVariant(profile.plan)} className={profile.plan !== 'Starter' ? "text-primary-foreground" : ""}>
                  {profile.plan}
                </Badge>
            </TableCell>
            <TableCell>
                 <Badge variant={currentStatus === 'active' ? 'default' : 'destructive'} className={currentStatus === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                    {currentStatus === 'active' ? 'Active' : 'Inactive'}
                </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell text-neutral-400">
                {profile.createdAt ? format(new Date(profile.createdAt.seconds * 1000), "MMMM dd, yyyy") : 'N/A'}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

export default function AdminDashboardPage() {
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [allUsers, setAllUsers] = useState<UserWithId[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    useEffect(() => {
        if (isLoggedIn === false) {
            router.push('/');
        }
        if (isLoggedIn === true && user?.name !== 'Admin') {
            router.push('/dashboard');
        }
    }, [isLoggedIn, user, router]);

    useEffect(() => {
        if (user?.name !== 'Admin' || !firestore) return;

        const usersQuery = query(collection(firestore, 'users')) as Query<DocumentData>;
        const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
            const usersData: UserWithId[] = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() } as UserWithId);
            });
            setAllUsers(usersData);
            setIsLoadingUsers(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setIsLoadingUsers(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    const adminUser = useMemo(() => {
        return allUsers.find(u => u.id === user?.firebaseUser?.uid);
    }, [allUsers, user]);

    const otherUsers = useMemo(() => {
        return allUsers.filter(u => u.id !== user?.firebaseUser?.uid);
    }, [allUsers, user]);


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
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-5xl font-bold text-white">User Management</h1>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{allUsers.length}</p>
                        <p className="text-sm text-neutral-400">Total Users</p>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Joined</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingUsers ? (
                                Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse"></div>
                                                <div className="space-y-2">
                                                    <div className="w-24 h-4 rounded bg-neutral-800 animate-pulse"></div>
                                                    <div className="w-32 h-3 rounded bg-neutral-800 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <>
                                    {adminUser && <AdminUserRow profile={adminUser} />}
                                    {otherUsers.map(u => <AdminUserRow key={u.id} profile={u} />)}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
}

