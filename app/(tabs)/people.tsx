import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function PeopleScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">People</Text>
        <Text className="text-gray-600 mb-6">Manage your team members here.</Text>
        
        <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mb-6">
          <Text className="text-white text-center font-bold">+ Add Team Member</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Team Members</Text>
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-600">No team members added yet.</Text>
          </View>
        </View>

        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-3">Invite Options</Text>
          <View className="bg-gray-100 p-4 rounded-lg mb-2">
            <Text className="text-gray-800">Invite by Email</Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-gray-800">Invite by Link</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}