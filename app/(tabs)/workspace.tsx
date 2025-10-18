import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import db from '../../lib/db';
import { id } from '@instantdb/react-native';

export default function HomeScreen() {
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Get all tasks - this hook should be consistent
  const { data: tasks, isLoading: tasksLoading } = db.useQuery({ tasks: {} });

  // Get user info - this hook should be consistent
  const user = db.useUser();

  const handleLongPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      db.transact(db.tx.tasks[selectedTask.id].delete());
      setModalVisible(false);
      setSelectedTask(null);
    }
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
    setNewTask(''); // Clear input
  };

  const toggleTask = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    db.transact(
      db.tx.tasks[id].update({
        status: newStatus,
      })
    );
  };

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.status === 'done' && styles.taskCardDone]}
      onPress={() => toggleTask(item.id, item.status)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
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
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.header}>ToDos</Text>
            <Text style={styles.taskCount}>
              {(tasks?.tasks || []).filter((t: any) => t.status === 'pending').length} pending
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerAddButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <View style={styles.currentTaskCard}>
          <Text style={styles.currentTaskText}>Current Task</Text>
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Your Tasks</Text>
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
              <Text style={styles.emptyStateSubtitle}>No tasks to show. Add one above.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Drawer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Task Options</Text>
              <TouchableOpacity
                style={styles.deleteOption}
                onPress={() => {
                  Alert.alert(
                    'Delete Task',
                    'Are you sure you want to delete this task?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: handleDeleteTask,
                      },
                    ]
                  );
                }}
              >
                <Feather name="trash-2" size={20} color="#ef4444" />
                <Text style={styles.deleteText}>Delete Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <SafeAreaView style={styles.addModalContainer}>
          <View style={styles.addModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setAddModalVisible(false);
                setNewTask('');
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.addModalTitle}>Add New Task</Text>
            <TouchableOpacity
              style={[styles.saveButton, !newTask.trim() && styles.saveButtonDisabled]}
              onPress={() => {
                if (newTask.trim()) {
                  addTask();
                  setAddModalVisible(false);
                }
              }}
              disabled={!newTask.trim()}
            >
              <Text style={[styles.saveButtonText, !newTask.trim() && styles.saveButtonTextDisabled]}>
                Add Task
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addModalContent}>
            <TextInput
              style={styles.addModalInput}
              value={newTask}
              onChangeText={setNewTask}
              placeholder="What needs to be done?"
              placeholderTextColor="#9CA3AF"
              multiline={true}
              autoFocus={true}
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  headerAddButton: {
    padding: 8,
    marginRight: 8,
  },

  currentTaskCard: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    height: '60%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  currentTaskText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalBody: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
    marginLeft: 12,
  },
  addModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButtonTextDisabled: {
    color: '#9ca3af',
  },
  addModalContent: {
    flex: 1,
    padding: 20,
  },
  addModalInput: {
    fontSize: 18,
    color: '#1f2937',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
