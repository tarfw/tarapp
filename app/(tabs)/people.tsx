import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import db from '../../lib/db';

export default function PeopleScreen() {
  const user = db.useUser();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.header}>People</Text>
            <Text style={styles.subtitle}>Manage teammates and roles</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.userEmail}>{user?.email?.split('@')[0] || 'Guest'}</Text>
            <Text style={styles.signOutText} onPress={() => db.auth.signOut()}>
              Sign out
            </Text>
          </View>
        </View>

        <View style={styles.contentPlaceholder}>
          <Text style={styles.placeholderTitle}>Team management coming soon</Text>
          <Text style={styles.placeholderSubtitle}>
            Invite collaborators and assign access once this feature is ready.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  signOutText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  contentPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});