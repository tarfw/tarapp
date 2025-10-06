import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, router } from 'expo-router';
import db from './db';

// Component to protect routes that require authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    let isActive = true;
    
    const checkAuth = async () => {
      try {
        const auth = await db.getAuth();
        if (isActive) {
          setIsAuthenticated(!!auth.user);
          setAuthChecked(true);
        }
      } catch (error) {
        if (isActive) {
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const unsubscribe = db.subscribeAuth((auth) => {
      if (isActive) {
        setIsAuthenticated(!!auth?.user);
        setAuthChecked(true);
      }
    });

    return () => {
      isActive = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return <>{children}</>;
}