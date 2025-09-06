import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    console.log('Signing out user:', user?.email || user?.id);
    await logout();
    router.back();
  };

  // Get the first letter of the user's email or use 'U' as default
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>←</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.screenTitle}>Profile</ThemedText>
        <View style={{ width: 32 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.userInfo}>
          <View style={styles.userIcon}>
            <ThemedText style={styles.userIconText}>
              {userInitial}
            </ThemedText>
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    fontSize: 24,
    color: Colors.light.tint,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.light.tint,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  container: {
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