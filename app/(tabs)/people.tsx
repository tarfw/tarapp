import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';

export default function PeopleScreen() {
  const [inboxItems, setInboxItems] = useState([
    {
      id: '1',
      type: 'assigned',
      title: 'Design onboarding flow',
      project: 'Design',
      description: 'You were assigned to this issue by Alex Johnson',
      time: '2 hours ago',
      unread: true,
      issueId: 'DES-124'
    },
    {
      id: '2',
      type: 'mentioned',
      title: 'Fix login state regression',
      project: 'Auth',
      description: 'Sarah Miller mentioned you in a comment',
      time: '4 hours ago',
      unread: true,
      issueId: 'AUTH-87'
    },
    {
      id: '3',
      type: 'comment',
      title: 'Add deep link support',
      project: 'Mobile',
      description: 'New comment on an issue you\'re subscribed to',
      time: 'Yesterday',
      unread: false,
      issueId: 'MOB-231'
    },
    {
      id: '4',
      type: 'status',
      title: 'API documentation update',
      project: 'Backend',
      description: 'Status changed from In Progress to Review',
      time: '2 days ago',
      unread: false,
      issueId: 'API-45'
    },
    {
      id: '5',
      type: 'review',
      title: 'Homepage redesign',
      project: 'Web',
      description: 'Requested your review on this pull request',
      time: '3 days ago',
      unread: false,
      issueId: 'WEB-67'
    }
  ]);

  const markAsDone = (itemId: string) => {
    setInboxItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assigned': return '👤';
      case 'mentioned': return '@';
      case 'comment': return '💬';
      case 'status': return '🔄';
      case 'review': return '👀';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assigned': return '#3B82F6';
      case 'mentioned': return '#F59E0B';
      case 'comment': return '#10B981';
      case 'status': return '#8B5CF6';
      case 'review': return '#EC4899';
      default: return Colors.light.muted;
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.screenTitle}>Inbox</ThemedText>
          <ThemedText style={styles.itemCount}>{inboxItems.length} items</ThemedText>
        </View>

        {inboxItems.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateTitle}>Inbox Zero! 🎉</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              You've reviewed all items that need your attention.
            </ThemedText>
          </View>
        ) : (
          <View>
            {inboxItems.map((item, index) => (
              <View key={item.id}>
                <View style={styles.inboxItem}>
                  <View style={styles.itemHeader}>
                    <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]}>
                      <ThemedText style={styles.typeIcon}>{getTypeIcon(item.type)}</ThemedText>
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemHeaderRow}>
                        <ThemedText style={styles.issueId}>{item.issueId}</ThemedText>
                        <ThemedText style={styles.timeText}>{item.time}</ThemedText>
                      </View>
                      <ThemedText style={styles.itemTitle} numberOfLines={1}>{item.title}</ThemedText>
                      <ThemedText style={styles.projectText}>{item.project}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => markAsDone(item.id)}
                    >
                      <ThemedText style={styles.actionText}>Mark Done</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
                {index < inboxItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.muted,
    textAlign: 'center',
  },
  inboxItem: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  itemHeader: {
    flexDirection: 'row',
  },
  typeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  typeIcon: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  issueId: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  projectText: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.light.surface,
  },
  actionText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 32,
  },
});