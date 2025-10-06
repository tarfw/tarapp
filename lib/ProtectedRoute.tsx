import React from 'react';

// Simple wrapper component that just passes children through
// Auth checking is now handled in the root layout
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}