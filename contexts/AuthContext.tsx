import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { db } from '@/config/instant';
import { useRouter } from 'expo-router';

// Close the web browser after auth
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: any;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  sendMagicCode: (email: string) => Promise<void>;
  verifyMagicCode: (email: string, code: string) => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await db.auth.getCurrentUser();
        console.log('Auth result from Instant DB:', authResult);
        // The actual user data is nested in the 'user' property
        const currentUser = authResult?.user || authResult;
        setUser(currentUser);
      } catch (error) {
        console.log('No user is currently logged in');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const sendMagicCode = async (email: string) => {
    setIsLoading(true);
    try {
      await db.auth.sendMagicCode({ email });
    } catch (error) {
      console.error('Error sending magic code:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMagicCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const authResult = await db.auth.signInWithMagicCode({ email, code });
      console.log('User signed in:', authResult);
      // The actual user data is nested in the 'user' property
      const user = authResult?.user || authResult;
      setUser(user);
      // Navigate to the main app after successful login
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error verifying magic code:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add resend functionality to verifyMagicCode
  const verifyMagicCodeWithResend = Object.assign(verifyMagicCode, {
    resendCode: sendMagicCode
  });

  const login = async (email: string) => {
    // For simplicity, we're combining send and verify in a single function
    // In a real app, you might want to separate these steps
    setIsLoading(true);
    try {
      await db.auth.sendMagicCode({ email });
      // In a real app, you would prompt the user for the code they received
      // and then call verifyMagicCode with that code
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await db.auth.signOut();
      setUser(null);
      // Navigate to login screen after logout
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    sendMagicCode,
    verifyMagicCode: verifyMagicCodeWithResend,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};