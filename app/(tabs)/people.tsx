import { Text, View } from "react-native";
import { useAuth } from '../../lib/auth';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';

export default function PeopleScreen() {
  const { signOut, user } = useAuth();

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
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut} style={{ marginRight: 10 }}>
              <Ionicons name="log-out-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
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
        <Text>People Tab</Text>
        {user && <Text style={{ marginTop: 10 }}>Signed in as: {user.email}</Text>}
      </View>
    </>
  );
}