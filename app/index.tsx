import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import db from '../lib/db';

export default function Index() {
  const router = useRouter();
  const { isLoading, user, error } = db.useAuth();

  console.log('Auth state:', { isLoading, user: user ? 'exists' : null, error });

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error('Auth error:', error);
        router.replace('/auth');
      } else if (!user) {
        router.replace('/auth');
      } else {
        router.replace('/(tabs)/workspace');
      }
    }
  }, [isLoading, user, error, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading...</Text>
    </View>
  );
}
