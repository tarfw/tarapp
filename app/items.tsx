import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Text,
} from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Plus, Search, X, ArrowLeft, Package } from 'lucide-react-native';

// Mock data for items
const mockItems = [
  {
    id: '1',
    name: 'Laptop',
    description: 'MacBook Pro 16-inch',
    category: 'Electronics',
    quantity: 1,
    price: 2499.99,
  },
  {
    id: '2',
    name: 'Office Chair',
    description: 'Ergonomic office chair',
    category: 'Furniture',
    quantity: 2,
    price: 299.99,
  },
  {
    id: '3',
    name: 'Notebook',
    description: 'Moleskine notebook',
    category: 'Stationery',
    quantity: 5,
    price: 19.99,
  },
];

export default function ItemsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(mockItems);
  const router = useRouter();

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    router.back();
  };

  const handleCreateItem = () => {
    // TODO: Implement item creation
    console.log('Create new item');
  };

  const renderItem = ({ item }: { item: typeof mockItems[0] }) => (
    <Pressable style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.iconContainer}>
          <Package size={24} color="#34C759" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
        </View>
      </View>
    </Pressable>
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
        }}
      />
      <Animated.View entering={FadeIn} style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  listContent: {
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C75915',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
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