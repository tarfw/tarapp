import { Tabs } from 'expo-router';
import { db } from '@/lib/db';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

export default function TabsLayout() {
  // Check auth state to ensure we're properly authenticated
  const { isLoading, user } = db.useAuth();

  // If user is not authenticated, we shouldn't be in tabs
  if (!user && !isLoading) {
    // This should redirect to auth automatically, but if it doesn't,
    // the main index route will handle the redirection
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Completely hide the navigation header
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingTop: 5,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Workspace',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'ellipse' : 'ellipse-outline'} 
              size={24} 
              color={color} 
            />
          )
        }} 
      />
      <Tabs.Screen 
        name="agents" 
        options={{ 
          title: 'Agents',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'square' : 'square-outline'} 
              size={24} 
              color={color} 
            />
          )
        }} 
      />
      <Tabs.Screen 
        name="people" 
        options={{ 
          title: 'People',
          tabBarIcon: ({ color, focused }) => (
            <Text className={`text-lg ${focused ? 'text-blue-600' : 'text-gray-500'}`}>@</Text>
          )
        }} 
      />
    </Tabs>
  );
}