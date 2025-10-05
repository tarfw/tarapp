import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { ProtectedRoute } from '../../lib/ProtectedRoute';

export default function TabLayout() {
  return (
    <ProtectedRoute>
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
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="at" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}