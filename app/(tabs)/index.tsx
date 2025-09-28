import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '@/lib/db';

export default function WorkspaceScreen() {
  const user = db.useUser();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Welcome back,</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-6">{user?.email || 'User'}!</Text>
        
        <View className="bg-blue-50 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold text-blue-800 mb-2">Quick Stats</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">0</Text>
              <Text className="text-gray-600 text-sm">Projects</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">0</Text>
              <Text className="text-gray-600 text-sm">Agents</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">0</Text>
              <Text className="text-gray-600 text-sm">Team</Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</Text>
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-600">No recent activity yet.</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-gray-100 p-4 rounded-lg flex-1 mr-2 items-center">
              <Text className="text-lg font-semibold text-gray-800">Create Project</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 p-4 rounded-lg flex-1 ml-2 items-center">
              <Text className="text-lg font-semibold text-gray-800">Add Agent</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-3">Resources</Text>
          <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mb-2">
            <Text className="text-gray-800">Documentation</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-gray-800">Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}