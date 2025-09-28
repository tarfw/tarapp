import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "../global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { db } from "@/lib/db";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize auth state at the root
  db.useAuth();

  // Force light theme only
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#0a7ea4',
      background: '#f8f9fa',
      card: '#ffffff',
      text: '#1d1d1d',
      border: '#d1d5db',
      notification: '#ef4444',
    },
  };

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={lightTheme}>
      <Stack 
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="auth/index" 
          options={{ 
            headerShown: true, 
            headerTitle: "Sign In",
          }} 
        />
        <Stack.Screen 
          name="(tabs)/_layout" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
