import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="auth/verify-code" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}