import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '@/lib/db';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AgentsScreen() {
  const { user } = db.useAuth();
  const insets = useSafeAreaInsets();

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
        <Text className="text-lg font-semibold text-gray-900">Agents</Text>
        <View className="flex-row items-center space-x-4">
          <Text className="text-gray-600 text-sm">{user?.email?.split('@')[0] || 'User'}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 16,
          paddingTop: 16
        }}
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Agents</Text>
          <Text className="text-gray-600 mt-1">Manage your AI agents here.</Text>
        </View>
        
        <TouchableOpacity className="bg-blue-600 rounded-lg p-4 mb-6">
          <Text className="text-white text-center font-semibold">+ Create New Agent</Text>
        </TouchableOpacity>

        <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Your Agents</Text>
          <View className="bg-gray-50 rounded-lg p-4 items-center">
            <Text className="text-gray-600">No agents created yet</Text>
          </View>
        </View>

        <View className="bg-white rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Agent Templates</Text>
          <View className="space-y-2">
            <TouchableOpacity className="bg-gray-50 rounded-lg p-3">
              <Text className="text-gray-800">Customer Support Agent</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-50 rounded-lg p-3">
              <Text className="text-gray-800">Data Analysis Agent</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-50 rounded-lg p-3">
              <Text className="text-gray-800">Content Creator Agent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}