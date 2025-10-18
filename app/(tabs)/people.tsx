import { Text, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import db from '../../lib/db';

// Mock chat data - replace with real data later
const mockChats = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2:30 PM',
    unread: 2,
    avatar: 'AJ',
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Thanks for the update!',
    timestamp: '1:45 PM',
    unread: 0,
    avatar: 'BS',
  },
  {
    id: '3',
    name: 'Carol Williams',
    lastMessage: 'Let me know when you\'re free',
    timestamp: '12:20 PM',
    unread: 1,
    avatar: 'CW',
  },
  {
    id: '4',
    name: 'David Brown',
    lastMessage: 'Got it, will check later',
    timestamp: '11:10 AM',
    unread: 0,
    avatar: 'DB',
  },
  {
    id: '5',
    name: 'Emma Davis',
    lastMessage: 'Sounds good to me 👍',
    timestamp: '10:30 AM',
    unread: 3,
    avatar: 'ED',
  },
];

export default function PeopleScreen() {
  const user = db.useUser();

  const renderChatItem = ({ item }: { item: typeof mockChats[0] }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.header}>Messages</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userEmail}>{user?.email?.split('@')[0] || 'Guest'}</Text>
          <Text style={styles.signOutText} onPress={() => db.auth.signOut()}>
            Sign out
          </Text>
        </View>
      </View>

      <FlatList
        data={mockChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        showsVerticalScrollIndicator={false}
        style={styles.chatList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  signOutText: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
});