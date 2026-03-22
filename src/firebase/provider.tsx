'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase service instances.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
  }), [firebaseApp, firestore, auth]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services.
 * Throws an error if used outside a FirebaseProvider.
 */
const useFirebaseServices = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebaseServices must be used within a FirebaseProvider.');
  }

  return context;
};


/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebaseServices();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebaseServices();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebaseServices();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}
