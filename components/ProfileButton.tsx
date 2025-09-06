import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileButton() {
  const router = useRouter();
  const { user } = useAuth();

  // Get the first letter of the user's email or use 'U' as default
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.profileText}>
          {userInitial}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 100,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});