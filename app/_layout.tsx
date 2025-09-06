import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { AuthProvider } from '@/contexts/AuthContext';
import { AIProvider } from '@/contexts/AIContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AIProvider>
        <ThemeProvider value={DefaultTheme}>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }} edges={['top']}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="verify" options={{ headerShown: false }} />
                <Stack.Screen name="agent-selector" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="dark" />
            </SafeAreaView>
          </SafeAreaProvider>
        </ThemeProvider>
      </AIProvider>
    </AuthProvider>
  );
}
