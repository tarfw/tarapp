import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { View, ActivityIndicator, Text } from 'react-native';
import db from '../../lib/db';

function ProtectedTabs() {
  const { isLoading, user, error } = db.useAuth();
  console.log('Tabs auth state:', { isLoading, user: user ? 'exists' : null, error });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    console.error('Auth error:', error);
    return <Redirect href="/auth" />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 10,
          height: 100,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="workspace"
        options={{
          title: 'Workspace',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: 'Agents',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="square" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: 'People',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Entypo name="email" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ProtectedTabs />;
}