import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function PeopleScreen() {
  const router = useRouter();
  
  // Mock data for conversations
  const conversations = [
    {
      id: '1',
      name: 'Alex Johnson',
      lastMessage: 'Hey, are we still meeting tomorrow?',
      time: '2:30 PM',
      unread: true,
      avatar: 'AJ'
    },
    {
      id: '2',
      name: 'Sarah Miller',
      lastMessage: 'Thanks for the feedback on the design',
      time: '1:15 PM',
      unread: false,
      avatar: 'SM'
    },
    {
      id: '3',
      name: 'Tech Team',
      lastMessage: 'Alex: I\'ve pushed the latest changes',
      time: '12:45 PM',
      unread: true,
      avatar: 'TT'
    },
    {
      id: '4',
      name: 'Michael Chen',
      lastMessage: 'The project is ready for review',
      time: '11:20 AM',
      unread: false,
      avatar: 'MC'
    },
    {
      id: '5',
      name: 'Design Team',
      lastMessage: 'Sarah: New mockups are uploaded',
      time: '10:30 AM',
      unread: false,
      avatar: 'DT'
    }
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.screenTitle}>People</ThemedText>
        </View>

        {conversations.map((conversation) => (
          <TouchableOpacity 
            key={conversation.id} 
            style={styles.conversationCard} 
            activeOpacity={0.7}
            onPress={() => router.push(`/chat/${conversation.id}`)}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>{conversation.avatar}</ThemedText>
              </View>
            </View>
            
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <ThemedText style={styles.conversationName}>{conversation.name}</ThemedText>
                <ThemedText style={styles.messageTime}>{conversation.time}</ThemedText>
              </View>
              
              <ThemedText 
                style={[styles.lastMessage, conversation.unread && styles.unreadMessage]}
                numberOfLines={1}
              >
                {conversation.lastMessage}
              </ThemedText>
            </View>
            
            {conversation.unread && (
              <View style={styles.unreadIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingTop: 16,
  },
  headerRow: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  unreadMessage: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.tint,
    alignSelf: 'center',
  },
});