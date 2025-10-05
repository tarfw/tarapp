import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import db from './db';

// Component to protect routes that require authentication
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <db.SignedIn>
        {children}
      </db.SignedIn>
      <db.SignedOut>
        <Redirect href="/auth" />
      </db.SignedOut>
    </>
  );
}