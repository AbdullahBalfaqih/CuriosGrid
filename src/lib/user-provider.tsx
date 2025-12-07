'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import {
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    getRedirectResult,
    User as FirebaseUser,
    deleteUser,
    signInAnonymously,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    onSnapshot,
    collection,
    addDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    Timestamp,
    getDoc,
    updateDoc,
} from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        ethereum?: any;
        phantom?: {
            solana: {
                isPhantom: boolean;
                connect: (opts?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: any }>;
                disconnect: () => Promise<void>;
                signAndSendTransaction: (transaction: any, opts?: any) => Promise<{ signature: string }>;
                request: (args: any) => Promise<any>;
                publicKey: any;
            }
        }
    }
}

export type Usage = {
    used: number;
    total: number;
};

type UsageCategory = 'posts' | 'images' | 'scripts' | 'agents';

export type Draft = {
    id: string;
    type: 'post' | 'image' | 'script' | 'bot';
    content: any;
    createdAt: string; // Keep as string for simplicity on the client
    topic: string;
};

export type TransactionRecord = {
    id: string;
    signature: string;
    hash: string;
    topic: string;
    createdAt: string;
};

export interface UserProfile {
    name: string;
    email: string;
    plan: 'Starter' | 'Pro' | 'Yearly';
    createdAt: any; // Can be Timestamp or ServerTimestamp
    currentPeriodEnd?: string;
    orderId?: string;
    requestedPlan?: 'Pro' | 'Yearly';
    usage: {
        posts: Usage;
        images: Usage;
        scripts: Usage;
        agents: Usage;
    };
    drafts: Draft[];
    transactions: TransactionRecord[];
    isWalletUser?: boolean;
}

export interface UserContextType {
    user: UserProfile | null;
    firebaseUser: FirebaseUser | null;
    isLoggedIn: boolean | null; // null during loading
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithMetaMask: () => Promise<void | null>;
    signInWithPhantom: () => Promise<void | null>;
    logout: () => Promise<void>;
    deleteAccount: () => void;
    prepareForPayment: (plan: 'Pro' | 'Yearly') => Promise<string | null>;
    decrementUsage: (category: UsageCategory) => Promise<void>;
    selectPlan: (plan: 'Starter' | 'Pro' | 'Yearly') => Promise<void>;
    addDraft: (draft: Omit<Draft, 'id' | 'createdAt'>) => Promise<void>;
    deleteDraft: (draftId: string) => Promise<void>;
    addTransaction: (transaction: Omit<TransactionRecord, 'id' | 'createdAt'>) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

const PLAN_LIMITS = {
    Starter: {
        posts: { used: 0, total: 10 },
        images: { used: 0, total: 2 },
        scripts: { used: 0, total: 1 },
        agents: { used: 0, total: 0 },
    },
    Pro: {
        posts: { used: 0, total: 2000 },
        images: { used: 0, total: 200 },
        scripts: { used: 0, total: 50 },
        agents: { used: 0, total: 5 },
    },
    Yearly: {
        posts: { used: 0, total: -1 }, // Unlimited
        images: { used: 0, total: -1 }, // Unlimited
        scripts: { used: 0, total: -1 }, // Unlimited
        agents: { used: 0, total: 10 },
    },
};

// Helper function to detect mobile devices
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};


const getOrCreateUserProfile = async (
    fbUser: FirebaseUser,
    firestore: any,
    name?: string,
    isWalletUser = false
): Promise<void> => {
    const userDocRef = doc(firestore, 'users', fbUser.uid);

    try {
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const newUserProfile: Omit<UserProfile, 'drafts' | 'transactions'> = {
                name:
                    name ||
                    fbUser.displayName ||
                    fbUser.email?.split('@')[0] ||
                    'Anonymous User',
                email: fbUser.email!,
                plan: 'Starter',
                usage: JSON.parse(JSON.stringify(PLAN_LIMITS['Starter'])),
                createdAt: serverTimestamp(),
                isWalletUser,
            };

            try {
                await setDoc(userDocRef, newUserProfile);
            } catch (createError) {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: userDocRef.path,
                        operation: 'create',
                        requestResourceData: newUserProfile,
                    })
                );
                throw createError;
            }
        }
    } catch (getError) {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'get',
            })
        );
        throw getError;
    }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const auth = useAuth();
    const firestore = useFirestore();
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const processRedirectResult = async () => {
            if (auth) {
                try {
                    const result = await getRedirectResult(auth);
                    if (result) {
                        toast({
                            title: "Signed In",
                            description: `Welcome ${result.user.displayName}`,
                        });
                        await getOrCreateUserProfile(result.user, firestore);
                    }
                } catch (error: any) {
                    console.error("Redirect Result Error:", error);
                    toast({
                        variant: "destructive",
                        title: "Sign-In Failed",
                        description: "Could not complete sign-in. Please try again."
                    });
                }
            }
        };
        processRedirectResult();
    }, [auth, firestore, toast]);

    // This effect listens for changes in the authentication state (sign-in, sign-out).
    useEffect(() => {
        if (!auth) {
            setIsLoggedIn(false);
            return;
        }

        const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
            setFirebaseUser(fbUser);
            if (!fbUser) {
                setUser(null);
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribeAuth();
    }, [auth]);


    // Effect for listening to user profile and subcollections data
    useEffect(() => {
        if (!firebaseUser || !firestore) {
            setUser(null);
            setIsLoggedIn(false);
            return;
        }

        setIsLoggedIn(null); // Set loading state

        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        let unsubscribeProfile: (() => void) | null = null;
        let unsubscribeDrafts: (() => void) | null = null;
        let unsubscribeTransactions: (() => void) | null = null;

        let currentDrafts: Draft[] = [];
        let currentTransactions: TransactionRecord[] = [];
        let currentUserData: Omit<UserProfile, 'drafts' | 'transactions'> | null = null;

        const updateUserState = () => {
            if (currentUserData) {
                setUser({ ...currentUserData, drafts: currentDrafts, transactions: currentTransactions });
                setIsLoggedIn(true);
            }
        };

        unsubscribeProfile = onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const data = userDoc.data();
                currentUserData = {
                    ...data,
                    currentPeriodEnd: (data.currentPeriodEnd as Timestamp)?.toDate().toISOString(),
                } as Omit<UserProfile, 'drafts' | 'transactions'>;

                if (!unsubscribeDrafts) {
                    const draftsColRef = collection(firestore, 'users', firebaseUser.uid, 'drafts');
                    const draftsQuery = query(draftsColRef, orderBy('createdAt', 'desc'));
                    unsubscribeDrafts = onSnapshot(draftsQuery, (draftsSnapshot) => {
                        currentDrafts = draftsSnapshot.docs.map((d) => {
                            const data = d.data();
                            return {
                                id: d.id,
                                ...data,
                                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                            } as Draft;
                        });
                        updateUserState();
                    }, (error) => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: draftsColRef.path, operation: 'list' }));
                        console.error("Drafts listener error:", error);
                    });
                }

                if (!unsubscribeTransactions) {
                    const transactionsColRef = collection(firestore, 'users', firebaseUser.uid, 'transactions');
                    const transactionsQuery = query(transactionsColRef, orderBy('createdAt', 'desc'));
                    unsubscribeTransactions = onSnapshot(transactionsQuery, (transactionsSnapshot) => {
                        currentTransactions = transactionsSnapshot.docs.map((d) => {
                            const data = d.data();
                            return {
                                id: d.id,
                                ...data,
                                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                            } as TransactionRecord;
                        });
                        updateUserState();
                    }, (error) => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: transactionsColRef.path, operation: 'list' }));
                        console.error("Transactions listener error:", error);
                    });
                }

                updateUserState();

            } else {
                setIsLoggedIn(false);
            }
        }, (error) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'get' }));
            setUser(null);
            setIsLoggedIn(false);
        });

        return () => {
            unsubscribeProfile?.();
            unsubscribeDrafts?.();
            unsubscribeTransactions?.();
        };

    }, [firebaseUser, firestore]);


    const signUp = async (email: string, password: string, name: string) => {
        if (!auth || !firestore) throw new Error('Firebase not initialized');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await getOrCreateUserProfile(userCredential.user, firestore, name);
    };

    const signIn = async (email: string, password: string) => {
        if (!auth || !firestore) throw new Error('Firebase not initialized');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await getOrCreateUserProfile(cred.user, firestore);
    };

    const signInWithGoogle = async () => {
        if (!auth || !firestore) throw new Error('Firebase not initialized');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await getOrCreateUserProfile(result.user, firestore);
            toast({
                title: "Signed In Successfully",
                description: `Welcome back, ${result.user.displayName}!`,
            });
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            toast({
                variant: "destructive",
                title: "Google Sign-In Failed",
                description: "Could not sign in with Google. Please ensure pop-ups are enabled and try again."
            });
        }
    };

    const handleWalletSignIn = async (walletAddress: string, walletType: 'MetaMask' | 'Phantom') => {
        if (!auth || !firestore) throw new Error('Firebase not initialized');
        const standardizedAddress = walletAddress.toLowerCase();

        await signInAnonymously(auth);
        const anonUser = auth.currentUser;

        if (!anonUser) throw new Error("Failed to create an anonymous session for wallet user.");

        const userDocRef = doc(firestore, 'users', anonUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await getOrCreateUserProfile(anonUser, firestore, `${walletType} User (${standardizedAddress.substring(0, 6)}...)`, true);
        }
    };

    const signInWithMetaMask = async () => {
        if (isMobileDevice()) {
            const deepLink = `https://metamask.app.link/dapp/${window.location.hostname}`;
            window.location.href = deepLink;
            return;
        }

        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed. Please install it to use this feature.');
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await handleWalletSignIn(accounts[0], 'MetaMask');
        } catch (error: any) {
            if (error.code === 4001) {
                toast({ variant: "destructive", title: "Connection Rejected" });
                return null;
            }
            throw new Error("An error occurred while connecting to MetaMask.");
        }
    };

    const signInWithPhantom = async () => {
        if (isMobileDevice()) {
            const deepLink = new URL('https://phantom.app/ul/v1/connect');
            deepLink.searchParams.set('app_url', window.location.origin);
            deepLink.searchParams.set('redirect_link', window.location.href);
            window.location.href = deepLink.toString();
            return;
        }
        if (typeof window.phantom?.solana === 'undefined') {
            throw new Error('Phantom wallet is not installed. Please install it to use this feature.');
        }
        try {
            const resp = await window.phantom.solana.connect();
            await handleWalletSignIn(resp.publicKey.toString(), 'Phantom');
        } catch (error: any) {
            if (error.code === 4001) {
                toast({ variant: "destructive", title: "Connection Rejected" });
                return null;
            }
            throw new Error("An error occurred while connecting to Phantom.");
        }
    };

    const logout = async () => {
        if (auth) {
            await signOut(auth);
        }
        setUser(null);
        setFirebaseUser(null);
        setIsLoggedIn(false);
    };

    const deleteAccount = async () => {
        if (!auth.currentUser || !firestore) return;
        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        try {
            await deleteDoc(userDocRef);
            await deleteUser(auth.currentUser);
        } catch (error) {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'delete',
                })
            );
            throw error;
        }
    };

    const prepareForPayment = async (plan: 'Pro' | 'Yearly'): Promise<string | null> => {
        if (!firebaseUser || !firestore) return null;
        const orderId = `${firebaseUser.uid}-${Date.now()}`;
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        try {
            await updateDoc(userDocRef, {
                orderId: orderId,
                requestedPlan: plan,
            });
            return orderId;
        } catch (error) {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: { orderId, requestedPlan: plan },
                })
            );
            return null;
        }
    };

    const selectPlan = async (plan: 'Starter' | 'Pro' | 'Yearly') => {
        if (firebaseUser && firestore) {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const newExpiryDate = new Date();
            if (plan === 'Pro') {
                newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
            } else if (plan === 'Yearly') {
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            }

            const dataToSet = {
                plan: plan,
                usage: JSON.parse(JSON.stringify(PLAN_LIMITS[plan])),
                currentPeriodEnd: plan === 'Starter' ? null : newExpiryDate.toISOString(),
            };
            setDoc(userDocRef, dataToSet, { merge: true }).catch((error) => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: userDocRef.path,
                        operation: 'update',
                        requestResourceData: dataToSet,
                    })
                );
            });
        }
    };

    const decrementUsage = async (category: UsageCategory) => {
        if (user && firebaseUser && firestore && user.usage[category]) {
            if (user.usage[category].total === -1) return;

            const newUsageCount = user.usage[category].used + 1;
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);

            const dataToUpdate = {
                usage: {
                    ...user.usage,
                    [category]: {
                        ...user.usage[category],
                        used: newUsageCount,
                    },
                },
            };

            setDoc(userDocRef, dataToUpdate, { merge: true }).catch((error) => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: userDocRef.path,
                        operation: 'update',
                        requestResourceData: dataToUpdate,
                    })
                );
            });
        }
    };

    const addDraft = async (draftData: Omit<Draft, 'id' | 'createdAt'>) => {
        if (firebaseUser && firestore) {
            const draftsColRef = collection(
                firestore,
                'users',
                firebaseUser.uid,
                'drafts'
            );
            const dataToAdd = {
                ...draftData,
                createdAt: serverTimestamp(),
            };
            addDoc(draftsColRef, dataToAdd).catch((error) => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: draftsColRef.path,
                        operation: 'create',
                        requestResourceData: dataToAdd,
                    })
                );
            });
        }
    };

    const deleteDraft = async (draftId: string) => {
        if (firebaseUser && firestore) {
            const draftDocRef = doc(
                firestore,
                'users',
                firebaseUser.uid,
                'drafts',
                draftId
            );
            deleteDoc(draftDocRef).catch((error) => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: draftDocRef.path,
                        operation: 'delete',
                    })
                );
            });
        }
    };

    const addTransaction = async (transactionData: Omit<TransactionRecord, 'id' | 'createdAt'>) => {
        if (firebaseUser && firestore) {
            const transactionsColRef = collection(
                firestore,
                'users',
                firebaseUser.uid,
                'transactions'
            );
            const dataToAdd = {
                ...transactionData,
                createdAt: serverTimestamp(),
            };
            addDoc(transactionsColRef, dataToAdd).catch((error) => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: transactionsColRef.path,
                        operation: 'create',
                        requestResourceData: dataToAdd,
                    })
                );
            });
        }
    };


    return (
        <UserContext.Provider
            value={{
                user,
                firebaseUser,
                isLoggedIn,
                signUp,
                signIn,
                signInWithGoogle,
                signInWithMetaMask,
                signInWithPhantom,
                logout,
                deleteAccount,
                prepareForPayment,
                decrementUsage,
                selectPlan,
                addDraft,
                deleteDraft,
                addTransaction,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
