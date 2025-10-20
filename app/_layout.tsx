import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
        name="agent/items"
        options={{
        headerShown: false,
        title: 'Items'
        }}
        />
        <Stack.Screen
          name="agent/comp/prodcard"
          options={{
            headerShown: false,
            title: 'Product Card'
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}