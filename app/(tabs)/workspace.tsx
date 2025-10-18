import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import db from '../../lib/db';
import { id } from '@instantdb/react-native';

export default function HomeScreen() {
  const [newTask, setNewTask] = useState('');
  const router = useRouter();

  // Get all tasks - this hook should be consistent
  const { data: tasks, isLoading: tasksLoading } = db.useQuery({ tasks: {} });

  // Get user info - this hook should be consistent
  const user = db.useUser();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.auth.signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  // If tasks are loading, show loading state
  if (tasksLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  const addTask = () => {
    if (!newTask.trim()) return;
    
    db.transact(
      db.tx.tasks[id()].update({
        title: newTask,
        status: 'pending',
        note: '',
      })
    );
    setNewTask('');
  };

  const toggleTask = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    db.transact(
      db.tx.tasks[id].update({
        status: newStatus,
      })
    );
  };

  const deleteTask = (id: string) => {
    db.transact(db.tx.tasks[id].delete());
  };

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.status === 'done' && styles.taskCardDone]}
      onPress={() => toggleTask(item.id, item.status)}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskLeft}>
          <TouchableOpacity
            style={[styles.checkbox, item.status === 'done' && styles.checkboxChecked]}
            onPress={() => toggleTask(item.id, item.status)}
          >
            {item.status === 'done' && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={[styles.taskText, item.status === 'done' && styles.taskTextDone]}>
            {item.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteTask(item.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="trash-2" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.header}>Works</Text>
            <Text style={styles.taskCount}>
              {(tasks?.tasks || []).filter((t: any) => t.status === 'pending').length} pending
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
            <Text style={styles.userEmail}>{user?.email?.split('@')[0] || 'Guest'}</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="add-circle-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              value={newTask}
              onChangeText={setNewTask}
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, !newTask.trim() && styles.addButtonDisabled]}
            onPress={addTask}
            disabled={!newTask.trim()}
          >
            <Text style={[styles.addButtonText, !newTask.trim() && styles.addButtonTextDisabled]}>
              Add Task
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Your Works</Text>
          {tasks?.tasks && tasks.tasks.length > 0 ? (
            <FlatList
              data={tasks.tasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
              style={styles.list}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#333" />
              <Text style={styles.emptyStateTitle}>All caught up!</Text>
              <Text style={styles.emptyStateSubtitle}>No works to show. Add one above.</Text>
            </View>
          )}
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
  taskCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  signOutButton: {
    marginBottom: 4,
  },
  signOutText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    padding: 0,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#9ca3af',
  },
  tasksSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  taskSeparator: {
    height: 8,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  taskCardDone: {
    backgroundColor: '#f8fafc',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  taskTextDone: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
