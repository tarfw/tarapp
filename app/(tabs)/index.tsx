import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import ProfileButton from '@/components/ProfileButton';

export default function TaskScreen() {
  // Mock data for tasks/issues with completion percentages
  const tasks = [
    {
      id: '1',
      title: 'Design onboarding flow',
      team: 'Design',
      status: 'Todo',
      completion: 0,
      assignee: 'Alex'
    },
    {
      id: '2',
      title: 'Fix login state regression',
      team: 'Bug',
      status: 'In Progress',
      completion: 65,
      assignee: 'Sam'
    },
    {
      id: '3',
      title: 'Add deep link support',
      team: 'Feature',
      status: 'Done',
      completion: 100,
      assignee: 'Jordan'
    }
  ];

  const getProgressColor = (completion: number) => {
    if (completion === 0) return Colors.light.muted;
    if (completion === 100) return '#10B981';
    return '#3B82F6';
  };

  const CircularProgress = ({ completion }: { completion: number }) => {
    const progressColor = getProgressColor(completion);
    const size = 32;

    return (
      <View style={[styles.progressCircle, { width: size, height: size }]}>
        {/* Background circle */}
        <View style={[styles.progressBackground, { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor: Colors.light.surface 
        }]} />
        
        {/* Progress fill - visually represents completion */}
        {completion > 0 && (
          <View style={[styles.progressFill, { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            position: 'absolute',
            backgroundColor: progressColor,
            opacity: completion === 100 ? 1 : 0.2
          }]} />
        )}
        
        {/* Progress ring for partial completion */}
        {completion > 0 && completion < 100 && (
          <View style={[styles.progressRing, { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: progressColor,
            position: 'absolute'
          }]} />
        )}
        
        {/* Checkmark for completed tasks */}
        {completion === 100 && (
          <View style={[styles.checkmarkContainer, { position: 'absolute' }]}>
            <View style={[styles.checkmark, { borderColor: '#FFFFFF' }]} />
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ProfileButton />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.screenTitle}>Workspace</ThemedText>
        </View>

        <View style={styles.listContainer}>
          {tasks.map((task, index) => (
            <TouchableOpacity key={task.id} style={styles.listItem} activeOpacity={0.7}>
              <View style={styles.taskRow}>
                <CircularProgress completion={task.completion} />
                <View style={styles.taskContent}>
                  <ThemedText style={styles.issueTitle}>{task.title}</ThemedText>
                  <View style={styles.issueMeta}>
                    <ThemedText style={styles.teamText}>{task.team}</ThemedText>
                    <View style={styles.assigneeContainer}>
                      <View style={styles.assigneeAvatar}>
                        <ThemedText style={styles.assigneeInitial}>
                          {task.assignee.charAt(0)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              
              {index < tasks.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingTop: 30, // Add padding to account for profile button
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
  listContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  listItem: {
    height: 72, // Fixed height for task items
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    flex: 1,
  },
  progressCircle: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    // Will be set dynamically
  },
  progressForeground: {
    // Will be set dynamically
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 10,
    height: 5,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  issueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamText: {
    fontSize: 12,
    color: Colors.light.muted,
    flex: 1,
  },
  assigneeContainer: {
    flexDirection: 'row',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
});
