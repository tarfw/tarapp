import { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import db from '../../lib/db';
import { id } from '@instantdb/react-native';

export default function HomeScreen() {
  const [newTask, setNewTask] = useState('');

  // Get all tasks - this hook should be consistent
  const { data: tasks, isLoading: tasksLoading } = db.useQuery({ tasks: {} });
  
  // Get user info - this hook should be consistent
  const user = db.useUser();

  // If tasks are loading, show loading state
  if (tasksLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
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
    <View style={styles.taskItem}>
      <View style={styles.taskContent}>
        <Text style={[styles.taskText, item.status === 'done' && styles.taskTextDone]}>
          {item.title}
        </Text>
      </View>
      <View style={styles.taskActions}>
        <Switch
          value={item.status === 'done'}
          onValueChange={() => toggleTask(item.id, item.status)}
        />
        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Tasks</Text>
        <Text style={styles.userEmail}>{user?.email || 'Guest'}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          value={newTask}
          onChangeText={setNewTask}
          style={styles.input}
          placeholder="What needs to be done?"
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={tasks?.tasks || []}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white', // Changed to white background
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 8,
    borderRadius: 4,
  },
  list: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 16,
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#ff6b6b',
  },
});
