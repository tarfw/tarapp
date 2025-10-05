import { Text, View } from "react-native";
import { Stack } from 'expo-router';
import db from '../../lib/db';

export default function AgentsScreen() {
  const user = db.useUser();

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerRight: () => (
            <Text style={{ fontSize: 12, marginRight: 10 }}>
              {user?.email || 'Guest'}
            </Text>
          ) 
        }} 
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text>Agents Tab</Text>
      </View>
    </>
  );
}