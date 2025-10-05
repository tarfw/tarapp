import React, { createContext, useContext, ReactNode } from 'react';
import db from './db';

interface AuthContextType {
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const signInWithEmail = async (email: string) => {
    try {
      await db.auth.sendMagicCode({ email });
    } catch (error) {
      console.error('Error sending magic code:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await db.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}