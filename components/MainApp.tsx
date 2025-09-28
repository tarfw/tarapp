import { db } from "@/lib/db";
import { View, Text, TouchableOpacity } from "react-native";

export default function MainApp() {
  const user = db.useUser();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 rounded-lg shadow-sm m-4">
        <Text className="text-[24px] font-bold text-gray-800 mb-4">
          Hi {user?.email || 'there'}!
        </Text>
        <Text className="text-gray-700 mb-4">Welcome to your dashboard.</Text>
        <TouchableOpacity 
          onPress={() => db.auth.signOut()} 
          className="mt-4 p-3 bg-red-500 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}