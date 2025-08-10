import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Item, useItems } from '../../context/ItemsContext';
import { useSQLiteContext } from 'expo-sqlite';

export default function ItemScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const { items, updateItem, createItem } = useItems();
  const [item, setItem] = useState({
    name: '',
    sku: '',
    barcode: '',
    status: 'active',
    options: {}
  });
  const [originalItem, setOriginalItem] = useState({
    name: '',
    sku: '',
    barcode: '',
    status: 'active',
    options: {}
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (id === 'new') {
        setIsNewItem(true);
        setHasUnsavedChanges(true);
        return;
      }

      const currentItem = await db.getFirstAsync<Item>(
        'SELECT * FROM items WHERE id = ?',
        [id as string]
      );
      
      if (currentItem) {
        const options = typeof currentItem.options === 'string' 
          ? JSON.parse(currentItem.options) 
          : currentItem.options;
          
        const itemData = {
          name: currentItem.name || '',
          sku: currentItem.sku || '',
          barcode: currentItem.barcode || '',
          status: currentItem.status || 'active',
          options: options || {}
        };
        setItem(itemData);
        setOriginalItem(itemData);
        setHasUnsavedChanges(false);
      }
    };
    fetchItem();
  }, [id, items]);

  const checkForChanges = (newItem: typeof item) => {
    const hasChanges = 
      newItem.name !== originalItem.name ||
      newItem.sku !== originalItem.sku ||
      newItem.barcode !== originalItem.barcode ||
      newItem.status !== originalItem.status ||
      JSON.stringify(newItem.options) !== JSON.stringify(originalItem.options);
    
    setHasUnsavedChanges(hasChanges || isNewItem);
  };

  const handleNameChange = (name: string) => {
    const newItem = { ...item, name };
    setItem(newItem);
    checkForChanges(newItem);
  };

  const handleSkuChange = (sku: string) => {
    const newItem = { ...item, sku };
    setItem(newItem);
    checkForChanges(newItem);
  };

  const handleBarcodeChange = (barcode: string) => {
    const newItem = { ...item, barcode };
    setItem(newItem);
    checkForChanges(newItem);
  };

  const handleStatusChange = (status: string) => {
    const newItem = { ...item, status };
    setItem(newItem);
    checkForChanges(newItem);
  };

  const handleSave = async () => {
    try {
      if (isNewItem) {
        const newItem = await createItem({
          name: item.name,
          sku: item.sku || null,
          barcode: item.barcode || null,
          status: item.status,
          options: item.options
        });
        
        if (newItem) {
          router.replace(`/item/${newItem.id}`);
          setIsNewItem(false);
        }
      } else {
        await updateItem(id as string, {
          name: item.name,
          sku: item.sku || null,
          barcode: item.barcode || null,
          status: item.status,
          options: item.options
        });
      }
      
      setOriginalItem({ ...item });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: isNewItem ? 'New Item' : (item.name || 'Untitled Item'),
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              disabled={!hasUnsavedChanges}
            />
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={item.name}
              onChangeText={handleNameChange}
              placeholder="Item name"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>SKU</Text>
            <TextInput
              style={styles.input}
              value={item.sku}
              onChangeText={handleSkuChange}
              placeholder="Stock Keeping Unit"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Barcode</Text>
            <TextInput
              style={styles.input}
              value={item.barcode}
              onChangeText={handleBarcodeChange}
              placeholder="Barcode number"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={item.status}
              onChangeText={handleStatusChange}
              placeholder="active, inactive, discontinued"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
});