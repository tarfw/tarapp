import { useEffect } from 'react';
import { useAuth } from '../lib/auth';
import db from '../lib/db';

// This component uses the db.useAuth hook to listen for auth changes
// and updates the AuthContext accordingly
export function AuthListener() {
  const { updateUser } = useAuth();
  
  // Using db.useAuth to get real-time auth updates
  const auth = db.useAuth();
  
  useEffect(() => {
    // Update the context when auth state changes
    updateUser(auth?.user || null);
  }, [auth]);

  return null; // This component doesn't render anything
}