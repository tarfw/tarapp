import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';
import db from '../../lib/db';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

function ProtectedTabs() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
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
          headerRight: () => <SignOutButton />,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="at" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Sign out button component for the header
const SignOutButton = () => {
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.auth.signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 10 }}>
      <Ionicons name="log-out-outline" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  return <ProtectedTabs />;
}