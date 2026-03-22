
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
import { Connection, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';

declare global {
    interface Window {
        ethereum?: any;
        phantom?: {
          solana: {
            isPhantom: boolean;
            connect: (opts?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: any }>;
            disconnect: () => Promise<void>;
            signAndSendTransaction: (transaction: any, opts?: any) => Promise<{ signature: string }>;
            signTransaction: (transaction: Transaction) => Promise<Transaction>;
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
  isForSale?: boolean;
};

export type Auction = {
  id: string;
  transactionId: string;
  sellerId: string;
  sellerName: string;
  startingPrice: number;
  currentBid: number;
  currentBidderId?: string;
  currentBidderName?: string;
  createdAt: string;
  endTime: string;
  topic: string;
  transactionSignature: string;
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
  signInWithMetaMask: () => Promise<void>;
  signInWithPhantom: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => void;
  prepareForPayment: (plan: 'Pro' | 'Yearly') => Promise<string | null>;
  decrementUsage: (category: UsageCategory) => Promise<void>;
  selectPlan: (plan: 'Starter' | 'Pro' | 'Yearly') => Promise<void>;
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt'>) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  addTransaction: (transaction: Omit<TransactionRecord, 'id' | 'createdAt'>) => Promise<void>;
  createAuction: (transaction: TransactionRecord, price: number, durationDays: number) => Promise<void>;
  placeBid: (auctionId: string, amount: number) => Promise<boolean>;
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
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // User is signed in.
      } else {
        // User is signed out.
        setFirebaseUser(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    // Check for redirect result on initial load
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          toast({
            title: 'Signed In',
            description: `Welcome ${result.user.displayName}`,
          });
          await getOrCreateUserProfile(result.user, firestore);
        }
      })
      .catch((error) => {
        console.error('Redirect Result Error:', error);
        toast({
          variant: 'destructive',
          title: 'Sign-In Failed',
          description: 'Could not complete sign-in. Please try again.',
        });
      });
      
    return () => unsubscribeAuth();
  }, [auth, firestore, toast]);


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
  
  const signInWithMetaMask = async () => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
      const error = new Error("MetaMask Not Found");
      (error as any).code = 'METAMASK_NOT_INSTALLED';
       if (/Mobi|Android/i.test(navigator.userAgent)) {
        const dappUrl = window.location.href.replace(/^https?:\/\//, '');
        const deeplink = `https://metamask.app.link/dapp/${dappUrl}`;
        window.location.href = deeplink;
        await new Promise(() => {});
      }
      throw error;
    }
    
    try {
      if (!auth || !firestore) throw new Error('Firebase not initialized');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      const email = `${walletAddress}@wallet.curiogrid.com`;
      const password = `metamask_${walletAddress}`;

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const name = `MetaMask User (${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)})`;
            await getOrCreateUserProfile(userCredential.user, firestore, name, true);
        } else {
            throw error;
        }
      }

    } catch (error: any) {
      console.error('MetaMask Sign In failed', error);
      throw error;
    }
  };

  const signInWithPhantom = async () => {
    const phantom = window.phantom?.solana;
    if (!phantom || !phantom.isPhantom) {
        const error = new Error("Phantom Not Found");
        (error as any).code = 'PHANTOM_NOT_INSTALLED';
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            const currentUrl = window.location.href;
            const deeplink = `https://phantom.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${encodeURIComponent(window.location.origin)}`;
            window.location.href = deeplink;
            await new Promise(() => {}); // Prevent further execution
        }
        throw error;
    }
    
    try {
        if (!auth || !firestore) throw new Error('Firebase not initialized');
        const resp = await phantom.connect({ onlyIfTrusted: false });
        const publicKey = resp.publicKey.toString();
        const email = `${publicKey}@wallet.curiogrid.com`;
        const password = `phantom_${publicKey}`;

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const name = `Phantom User (${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)})`;
                await getOrCreateUserProfile(userCredential.user, firestore, name, true);
            } else {
                throw error;
            }
        }
    } catch (error: any) {
       console.error("Phantom sign-in error:", error);
       throw error;
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

  const createAuction = async (transaction: TransactionRecord, price: number, durationDays: number) => {
    if (!firebaseUser || !user || !firestore) return;
    
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + durationDays);

    const auctionData = {
      transactionId: transaction.id,
      sellerId: firebaseUser.uid,
      sellerName: user.name,
      startingPrice: price,
      currentBid: price,
      createdAt: serverTimestamp(),
      endTime: endTime.toISOString(),
      topic: transaction.topic,
      transactionSignature: transaction.signature,
    };

    const auctionsColRef = collection(firestore, 'auctions');
    const transactionDocRef = doc(firestore, 'users', firebaseUser.uid, 'transactions', transaction.id);

    try {
      await addDoc(auctionsColRef, auctionData);
      await updateDoc(transactionDocRef, { isForSale: true });
      toast({ title: "Auction Created!", description: "Your content is now live on the marketplace." });
    } catch(error) {
       console.error("Auction creation error:", error);
       toast({ variant: "destructive", title: "Auction Failed", description: "Could not create the auction. Please try again." });
    }
  };

  const placeBid = async (auctionId: string, amount: number): Promise<boolean> => {
    if (!firebaseUser || !user || !firestore) {
      toast({ variant: 'destructive', title: "Authentication Error", description: "You must be logged in to place a bid."});
      return false;
    };

    const phantom = window.phantom?.solana;
    if (!phantom || !phantom.isPhantom) {
        toast({ variant: 'destructive', title: "Phantom Wallet Not Found", description: "Please install the Phantom wallet extension." });
        return false;
    }
    
    try {
        const auctionDocRef = doc(firestore, 'auctions', auctionId);
        const auctionDoc = await getDoc(auctionDocRef);
        if (!auctionDoc.exists()) {
            toast({ variant: "destructive", title: "Auction Error", description: "This auction could not be found." });
            return false;
        }
        const auctionData = auctionDoc.data() as Auction;
        
        // Rule: Prevent self-bidding
        if (auctionData.currentBidderId === firebaseUser.uid) {
            toast({ variant: "destructive", title: "Action Not Allowed", description: "You are already the highest bidder." });
            return false;
        }
        
        // Rule: Bid must be higher than current
        const minBid = auctionData.currentBid > 0 ? parseFloat((auctionData.currentBid * 1.05).toFixed(2)) : auctionData.startingPrice;
        if (amount < minBid) {
             toast({ variant: 'destructive', title: "Bid Too Low", description: `Your bid must be at least ${minBid.toFixed(2)} SOL.`});
             return false;
        }

        // Rule: Max 100% increment to prevent mistakes
        const maxBid = auctionData.currentBid > 0 ? auctionData.currentBid * 2 : amount;
         if (amount > maxBid && auctionData.currentBid > 0) {
            toast({ variant: 'destructive', title: 'Bid Increment Too High', description: `Maximum allowed bid is ${maxBid.toFixed(2)} SOL.` });
            return false;
        }


        await phantom.connect({ onlyIfTrusted: false });
        const publicKey = phantom.publicKey;
        if (!publicKey) throw new Error("Wallet not connected");

        const connection = new Connection("https://devnet.helius-rpc.com/?api-key=7cb7dddc-f216-4633-90ff-b4f69c088f42", "confirmed");
        const { blockhash } = await connection.getLatestBlockhash();
        
        const transaction = new Transaction().add(SystemProgram.transfer({
            fromPubkey: publicKey, toPubkey: publicKey, lamports: 0,
        }));
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = blockhash;
        
        await phantom.signTransaction(transaction);
        
        const bidData = {
          currentBid: amount,
          currentBidderId: firebaseUser.uid,
          currentBidderName: user.name,
        };
        await updateDoc(auctionDocRef, bidData);
        
        return true;
    } catch(error: any) {
       console.error("Bid placement error:", error);
       if (error.message.includes("User rejected")) {
         toast({ variant: "destructive", title: "Bid Canceled", description: "You canceled the bid in your wallet." });
       } else {
         toast({ variant: "destructive", title: "Bid Failed", description: "Could not place your bid. Please try again." });
       }
       return false;
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
        createAuction,
        placeBid,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
