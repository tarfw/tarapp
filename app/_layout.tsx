import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/index" />
          <Stack.Screen name="auth/verify-code" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="agent/items" 
            options={{ 
              headerShown: false,
              title: 'Items',
              presentation: 'modal'
            }} 
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}