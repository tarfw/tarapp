import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth';
import { View, ActivityIndicator } from 'react-native';
import db from '../lib/db';
import { Redirect } from 'expo-router';

function AuthWrapper({ children }: { children: React.ReactNode }) {
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthWrapper>
    </AuthProvider>
  );
}