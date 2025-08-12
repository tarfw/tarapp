import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { 
  Plus, 
  Circle, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Smartphone,
  Palette,
  FileText,
  Bell,
  Users,
  Settings
} from 'lucide-react-native';

export default function WorkspaceScreen() {
  const router = useRouter();

  const tasks = [
    {
      id: '1',
      title: 'Mobile design issues',
      status: 'in-progress',
      priority: 'high',
      icon: Palette,
      color: '#00D2FF',
    },
    {
      id: '2',
      title: 'Mobile apps release',
      status: 'todo',
      priority: 'medium',
      icon: Smartphone,
      color: '#8B5CF6',
    },
    {
      id: '3',
      title: 'iOS launch thoughts',
      status: 'todo',
      priority: 'high',
      icon: Circle,
      color: '#FF6B6B',
    },
    {
      id: '4',
      title: 'Android launch priorities',
      status: 'in-progress',
      priority: 'high',
      icon: Circle,
      color: '#FF9500',
    },
    {
      id: '5',
      title: 'Mobile document support',
      status: 'todo',
      priority: 'low',
      icon: FileText,
      color: '#FFD60A',
    },
    {
      id: '6',
      title: 'Design weekly sync',
      status: 'completed',
      priority: 'medium',
      icon: Circle,
      color: '#8B5CF6',
    },
    {
      id: '7',
      title: 'US weekly sync',
      status: 'todo',
      priority: 'medium',
      icon: Circle,
      color: '#34C759',
    },
    {
      id: '8',
      title: 'Notification schedules',
      status: 'in-progress',
      priority: 'medium',
      icon: Bell,
      color: '#8B5CF6',
    },
    {
      id: '9',
      title: 'Documents improvements',
      status: 'todo',
      priority: 'low',
      icon: Circle,
      color: '#FFD60A',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in-progress':
        return Clock;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'in-progress':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const handleTaskPress = (taskId: string) => {
    // Navigate to task detail or handle task interaction
    console.log('Task pressed:', taskId);
  };

  const handleTitlePress = () => {
    router.push('/agents-list');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <Pressable onPress={handleTitlePress}>
              <Text style={styles.headerTitle}>Home</Text>
            </Pressable>
          ),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FAFAFA',
          },
          headerRight: () => (
            <Pressable style={styles.addButton}>
              <Plus size={20} color="#6366F1" />
            </Pressable>
          ),
        }}
      />
      <Animated.View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Circle size={16} color="#8E8E93" />
              <Text style={styles.sectionTitle}>My Issues</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.categoryTitle}>Favorites</Text>
            <View style={styles.tasksList}>
              {tasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                const TaskIcon = task.icon;
                return (
                  <Pressable
                    key={task.id}
                    style={styles.taskItem}
                    onPress={() => handleTaskPress(task.id)}
                  >
                    <View style={styles.taskContent}>
                      <View style={styles.taskIconContainer}>
                        <TaskIcon size={16} color={task.color} />
                      </View>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                    </View>
                    <StatusIcon 
                      size={16} 
                      color={getStatusColor(task.status)}
                      style={styles.statusIcon}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.categoryTitle}>Teams</Text>
            <Pressable style={styles.taskItem}>
              <View style={styles.taskContent}>
                <View style={styles.taskIconContainer}>
                  <Smartphone size={16} color="#34C759" />
                </View>
                <Text style={styles.taskTitle}>Mobile</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 16,
  },
  addButton: {
    marginRight: 16,
    padding: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  tasksList: {
    backgroundColor: '#FFFFFF',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIconContainer: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '400',
    flex: 1,
  },
  statusIcon: {
    marginLeft: 12,
  },
});