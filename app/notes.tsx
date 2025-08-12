import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Switch,
  Text,
  Button,
} from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Plus, Search, X, ArrowLeft } from 'lucide-react-native';
import { SwipeableNote } from '../components/SwipeableNote';
import { useNotes } from '../context/NotesContext';
import { useSQLiteContext } from 'expo-sqlite';

export default function NotesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const db = useSQLiteContext();
  const { notes, createNote, deleteNote, isSyncing, toggleSync, syncNotes } =
    useNotes();

  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    console.log('Creating note...');
    const newNote = await createNote();
    if (newNote) {
      router.push(`/note/${newNote.id}`);
    } else {
      alert('Failed to create note');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderNote = ({ item }: any) => (
    <SwipeableNote
      note={item}
      onPress={() => router.push(`/note/${item.id}`)}
      onDelete={() => deleteNote(item.id)}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Notes',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
          headerLeft: () => (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#007AFF" />
            </Pressable>
          ),
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Button title="Push" onPress={() => db.syncLibSQL()} />
              <Button title="Pull" onPress={() => syncNotes()} />
            </View>
          ),
          headerShadowVisible: false,
          headerStyle: {
            borderBottomWidth: 0.5,
            borderBottomColor: '#E5E5E7',
          },
        }}
      />
      <Animated.View style={styles.notesList}>
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={20} color="#8E8E93" />
                  </Pressable>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="automatic"
        />
        <Pressable style={styles.fab} onPress={handleCreateNote}>
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 4,
  },
  headerContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  notesList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});