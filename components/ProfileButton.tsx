import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    console.log('Signing out user:', user?.email || user?.id);
    setModalVisible(false);
    await logout();
  };

  // Get the first letter of the user's email or use 'U' as default
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.profileText}>
          {userInitial}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.fullScreenModal}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <ThemedText style={styles.screenTitle}>Profile</ThemedText>
            <View style={{ width: 32 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.userInfo}>
              <View style={styles.userIcon}>
                <Text style={styles.userIconText}>
                  {userInitial}
                </Text>
              </View>
              {user ? (
                <>
                  <ThemedText style={styles.userName}>{user.email || 'No email available'}</ThemedText>
                  <ThemedText style={styles.userEmail}>User ID: {user.id || 'No ID available'}</ThemedText>
                </>
              ) : (
                <>
                  <ThemedText style={styles.userName}>Not signed in</ThemedText>
                  <ThemedText style={styles.userEmail}>User ID: N/A</ThemedText>
                </>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <ThemedText style={styles.logoutText}>Sign out</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>
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
  fullScreenModal: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.light.text,
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  modalContent: {
    padding: 16,
    paddingTop: 32,
  },
  userInfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  userIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userIconText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 24,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.light.muted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    width: '100%',
    marginVertical: 10,
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    marginTop: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});