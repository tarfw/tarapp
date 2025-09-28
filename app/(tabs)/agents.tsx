import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function AgentsScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Agents</Text>
        <Text className="text-gray-600 mb-6">Manage your AI agents here.</Text>
        
        <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mb-6">
          <Text className="text-white text-center font-bold">+ Create New Agent</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Your Agents</Text>
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-600">No agents created yet.</Text>
          </View>
        </View>

        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-3">Agent Templates</Text>
          <View className="bg-gray-100 p-4 rounded-lg mb-2">
            <Text className="text-gray-800">Customer Support Agent</Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-lg mb-2">
            <Text className="text-gray-800">Data Analysis Agent</Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-gray-800">Content Creator Agent</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}