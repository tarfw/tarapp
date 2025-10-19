import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Polyfill for Event object required by @instantdb/react-native
if (typeof global.Event === 'undefined') {
  global.Event = class Event {
    constructor(type: string, eventInitDict?: any) {
      this.type = type;
      if (eventInitDict) {
        Object.assign(this, eventInitDict);
      }
    }
    type: string;
    bubbles = false;
    cancelable = false;
    composed = false;
    defaultPrevented = false;
    eventPhase = 0;
    isTrusted = false;
    returnValue = true;
    currentTarget: any = null;
    target: any = null;
    timeStamp = Date.now();

    preventDefault() {
      this.defaultPrevented = true;
    }

    stopPropagation() {}

    stopImmediatePropagation() {}
  };
}

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