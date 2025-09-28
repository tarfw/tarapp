import { View, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { db } from '@/lib/db';

export default function TabsLayout() {
  // Check auth state to ensure we're properly authenticated
  const { isLoading, user } = db.useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Workspace', 
          headerTitle: 'Workspace',
          headerRight: () => (
            <TouchableOpacity onPress={() => db.auth.signOut()} className="p-2">
              <Text className="text-gray-600 text-lg">🚪</Text>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 20 }}>{focused ? '🏠' : '⌂'}</Text>
          )
        }} 
      />
      <Tabs.Screen 
        name="agents" 
        options={{ 
          title: 'Agents', 
          headerTitle: 'Agents',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 20 }}>{focused ? '🤖' : '🤖'}</Text>
          )
        }} 
      />
      <Tabs.Screen 
        name="people" 
        options={{ 
          title: 'People', 
          headerTitle: 'People',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: 20 }}>{focused ? '👥' : '👥'}</Text>
          )
        }} 
      />
    </Tabs>
  );
}