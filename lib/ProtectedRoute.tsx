import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import db from './db';

// Component to protect routes that require authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    // In case of an error, redirect to auth
    return <Redirect href="/auth" />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return <>{children}</>;
}