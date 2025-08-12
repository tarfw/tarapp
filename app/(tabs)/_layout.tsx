import React from 'react';
import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Square, Play, Mail } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#F5F5F5',
          height: 84,
          paddingTop: 8,
          paddingBottom: 34,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 1,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={1}
            style={[
              props.style,
              {
                backgroundColor: 'transparent',
              }
            ]}
          >
            {props.children}
          </TouchableOpacity>
        ),
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="workspace"
        options={{
          title: 'Workspace',
          tabBarIcon: ({ color, size }) => (
            <Square size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => (
            <Play size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Mail size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
