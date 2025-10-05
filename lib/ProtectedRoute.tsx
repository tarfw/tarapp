import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../lib/auth';

// Component to protect routes that require authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    // Redirect to sign in if user is not authenticated
    return <Redirect href="/auth" />;
  }

  return <>{children}</>;
}