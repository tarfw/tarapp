import { Text, View } from "react-native";
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import db from '../../lib/db';

export default function PeopleScreen() {
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

  const user = db.useUser();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Text>People Tab</Text>
      <Text style={{ marginTop: 10 }}>Signed in as: {user?.email}</Text>
      <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 20, padding: 10 }}>
        <Ionicons name="log-out-outline" size={24} color="#007AFF" />
        <Text style={{ color: '#007AFF', textAlign: 'center' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}