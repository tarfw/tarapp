import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Text,
  Button,
} from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Plus, Search, X, ArrowLeft } from 'lucide-react-native';
import { SwipeableItem } from '../components/SwipeableItem';
import { useItems } from '../context/ItemsContext';
import { useSQLiteContext } from 'expo-sqlite';

export default function ItemsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const db = useSQLiteContext();
  const { items, createItem, deleteItem, isSyncing, toggleSync, syncItems } =
    useItems();

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateItem = () => {
    router.push('/item/new');
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }: any) => (
    <SwipeableItem
      item={item}
      onPress={() => router.push(`/item/${item.id}`)}
      onDelete={() => deleteItem(item.id)}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Items',
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
              <Button title="Pull" onPress={() => syncItems()} />
            </View>
          ),
        }}
      />
      <Animated.View entering={FadeIn} style={styles.itemsList}>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search items"
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
          showsVerticalScrollIndicator={false}
        />
        <Pressable style={styles.fab} onPress={handleCreateItem}>
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
  itemsList: {
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