import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import db from './db';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This component uses the db.useAuth hook which is the proper way in InstantDB
function AuthProviderWithHooks({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We'll use a pattern where components update the context when auth changes
  // Since we can't use hooks in providers directly, we'll initialize with getAuth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const auth = await db.getAuth();
        setUser(auth?.user || null);
      } catch (error) {
        console.error('Error getting auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

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
      setUser(null); // Clear local state immediately
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Provide a function for components to update user state when they detect auth changes
  const updateUser = (newUser: any) => {
    setUser(newUser);
  };

  const value = {
    user,
    isLoading,
    signInWithEmail,
    signOut,
    updateUser, // This will be used by components that can use the useAuth hook
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderWithHooks>{children}</AuthProviderWithHooks>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}