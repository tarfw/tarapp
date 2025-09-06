import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
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
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.userInfo}>
              <View style={styles.userIcon}>
                <Text style={styles.userIconText}>
                  {userInitial}
                </Text>
              </View>
              {user ? (
                <>
                  <Text style={styles.userName}>{user.email || 'No email available'}</Text>
                  <Text style={styles.userEmail}>User ID: {user.id || 'No ID available'}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.userName}>Not signed in</Text>
                  <Text style={styles.userEmail}>User ID: N/A</Text>
                </>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
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
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});