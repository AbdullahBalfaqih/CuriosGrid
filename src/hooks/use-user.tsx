// This file is deprecated. Please use the provider in /src/lib/user-provider.tsx instead.
"use client";

import { useContext } from 'react';
import { UserContext } from '@/lib/user-provider';
import type { UserContextType } from '@/lib/user-provider';

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
