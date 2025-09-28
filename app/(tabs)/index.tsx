import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '@/lib/db';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkspaceScreen() {
  const { user } = db.useAuth();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      await db.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Custom Linear-like top bar */}
      <View 
        className="bg-white border-b border-gray-200 px-4"
        style={{ 
          paddingTop: insets.top, 
          paddingBottom: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text className="text-lg font-semibold text-gray-900">Tar App</Text>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={handleSignOut}>
            <Text className="text-gray-600">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 16,
          paddingTop: 16
        }}
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Good morning, {user?.email?.split('@')[0] || 'there'}.</Text>
          <Text className="text-gray-600 mt-1">Here's what's happening with your workspace today.</Text>
        </View>

        <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <View className="flex-row justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Workspace Overview</Text>
          </View>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-500 text-sm">Projects</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-500 text-sm">Agents</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">0</Text>
              <Text className="text-gray-500 text-sm">Team</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</Text>
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-600">No recent activity</Text>
          </View>
        </View>

        <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg p-3 items-center">
              <Text className="font-medium text-gray-800">Create Project</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-gray-100 rounded-lg p-3 items-center">
              <Text className="font-medium text-gray-800">Add Agent</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Resources</Text>
          <TouchableOpacity className="bg-gray-50 rounded-lg p-3 mb-2">
            <Text className="text-gray-800">Documentation</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-50 rounded-lg p-3">
            <Text className="text-gray-800">Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}