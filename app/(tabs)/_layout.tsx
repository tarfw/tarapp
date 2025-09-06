import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.light.tint,
          tabBarInactiveTintColor: Colors.light.icon,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {
              borderTopColor: Colors.light.border,
              backgroundColor: Colors.light.background,
            },
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Workspace',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="square" color={color} />,
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: 'AI',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="circle" color={color} />,
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            title: 'People',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="@" color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
