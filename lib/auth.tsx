import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import db from './db';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a wrapper component that can use hooks and then pass the values to the provider
function AuthProviderWithHooks({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Using the lower-level getAuth to fetch initial state
    const initializeAuth = async () => {
      try {
        // First get the initial auth state
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

    // For InstantDB React Native, use the standard auth subscription method
    // Based on the documentation, it should be db.subscribeAuth
    let unsubscribe: (() => void) | null = null;
    
    // Check if db.subscribeAuth exists before using it
    if (typeof db.subscribeAuth === 'function') {
      try {
        unsubscribe = db.subscribeAuth((auth) => {
          setUser(auth?.user || null);
          // Only set loading to false after we get the first auth update
          setIsLoading(false);
        });
      } catch (error) {
        console.warn('Error setting up auth subscription:', error);
        setIsLoading(false);
      }
    } else {
      // Fallback: just set loading to false after getting initial state
      setIsLoading(false);
    }

    // Return cleanup function
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
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
      setUser(null); // Clear local state on sign out
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signInWithEmail,
    signOut,
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