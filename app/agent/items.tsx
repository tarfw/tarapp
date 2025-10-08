import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { id } from '@instantdb/react-native';
import db from '../../lib/db';
import InventoryModal from '../../components/InventoryModal';

// Export options to hide header
export const options = {
  headerShown: false,
};

// Item type based on schema
type Item = {
  id: string;
  barcode?: string;
  cost?: number;
  op1?: string;
  op2?: string;
  op3?: string;
  price?: number;
  sku?: string;
};

// Product type for reference
type Product = {
  id: string;
  title?: string;
};

// Location type
type Location = {
  id: string;
  name?: string;
};

export default function ItemsAgent() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [op1, setOp1] = useState('');
  const [op2, setOp2] = useState('');
  const [op3, setOp3] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Query items for the specific product
  const { data, isLoading, error } = db.useQuery({
    items: {
      $: {
        where: {
          product: productId,
        },
      },
    },
    products: {
      $: {
        where: {
          id: productId,
        },
      },
    },
    locations: {}
  });

  useEffect(() => {
    if (data?.items) {
      setItems(data.items);
    }
    if (data?.products && data.products.length > 0) {
      setProduct(data.products[0]);
    }
  }, [data]);

  const locationsData = data?.locations || [];

  // Query for inventory items for the current item specifically
  const inventoryQuery = db.useQuery({
    inventory: {
      $: {
        where: currentItem?.id ? { 'item.id': currentItem.id } : { id: 'non-existent-id' },
      },
      locations: {},
    }
  });
  
  const inventoryItems = inventoryQuery.data?.inventory || [];
  
  // State for inventory modal
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [selectedInventoryToEdit, setSelectedInventoryToEdit] = useState<any>(null);

  const handleCreateItem = () => {
    if (!sku.trim()) {
      Alert.alert('Error', 'SKU is required');
      return;
    }

    const newItem = {
      sku: sku.trim(),
      barcode: barcode.trim(),
      cost: cost.trim() ? parseFloat(cost.trim()) : undefined,
      price: price.trim() ? parseFloat(price.trim()) : undefined,
      op1: op1.trim(),
      op2: op2.trim(),
      op3: op3.trim(),
      product: productId as string,
    };

    const itemId = id();
    db.transact([
      db.tx.items[itemId].create(newItem),
    ]);

    resetForm();
    setShowForm(false);
  };

  const handleUpdateItem = () => {
    if (!currentItem || !sku.trim()) {
      Alert.alert('Error', 'SKU is required');
      return;
    }

    const updatedItem = {
      id: currentItem.id,
      sku: sku.trim(),
      barcode: barcode.trim(),
      cost: cost.trim() ? parseFloat(cost.trim()) : undefined,
      price: price.trim() ? parseFloat(price.trim()) : undefined,
      op1: op1.trim(),
      op2: op2.trim(),
      op3: op3.trim(),
    };

    db.transact([
      db.tx.items[currentItem.id].update(updatedItem)
    ]);

    resetForm();
    setShowForm(false);
  };

  const showDeleteConfirmation = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      db.transact([
        db.tx.items[itemToDelete].delete()
      ]);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Function to delete inventory
  const handleDeleteInventory = (inventoryId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this inventory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            db.transact([
              db.tx.inventory[inventoryId].delete(),
            ]);
          },
        },
      ]
    );
  };

  // Function to edit inventory
  const handleEditInventory = (inventory: any) => {
    // Open the modal in edit mode
    setSelectedInventoryToEdit(inventory);
    setInventoryModalVisible(true);
  };

  const resetForm = () => {
    setSku('');
    setBarcode('');
    setCost('');
    setPrice('');
    setOp1('');
    setOp2('');
    setOp3('');
    setCurrentItem(null);
    setIsEditing(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const openEditForm = (item: Item) => {
    setCurrentItem(item);
    setSku(item.sku || '');
    setBarcode(item.barcode || '');
    setCost(item.cost?.toString() || '');
    setPrice(item.price?.toString() || '');
    setOp1(item.op1 || '');
    setOp2(item.op2 || '');
    setOp3(item.op3 || '');
    setIsEditing(true);
    setShowForm(true);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => openEditForm(item)}
      onLongPress={() => showDeleteConfirmation(item.id)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.listItemTitle}>{item.sku || 'Untitled Item'}</Text>
        {item.price && (
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
        )}
      </View>
      {item.barcode && (
        <Text style={styles.subtitleText}>Barcode: {item.barcode}</Text>
      )}
      {item.cost && (
        <Text style={styles.subtitleText}>Cost: ${item.cost.toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContentLeft}>
            <Text style={styles.headerTitle}>
              {product?.title || 'Items'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Items
            </Text>
          </View>
          <TouchableOpacity onPress={openCreateForm}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loading}>Loading items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContentLeft}>
            <Text style={styles.headerTitle}>
              {product?.title || 'Items'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Items
            </Text>
          </View>
          <TouchableOpacity onPress={openCreateForm}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showForm) {
    return (
      <SafeAreaView style={styles.formContainer}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={closeForm}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>
            {isEditing ? 'Edit Item' : 'Create New Item'}
          </Text>
          <TouchableOpacity
            onPress={isEditing ? handleUpdateItem : handleCreateItem}
          >
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.label}>SKU *</Text>
          <TextInput
            style={styles.input}
            value={sku}
            onChangeText={setSku}
            placeholder="Enter item SKU"
            autoFocus={true} // Focus on SKU field when form opens
          />

          <Text style={styles.label}>Barcode</Text>
          <TextInput
            style={styles.input}
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Enter barcode"
          />

          <Text style={styles.label}>Cost</Text>
          <TextInput
            style={styles.input}
            value={cost}
            onChangeText={setCost}
            placeholder="Enter cost"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Option 1</Text>
          <TextInput
            style={styles.input}
            value={op1}
            onChangeText={setOp1}
            placeholder="Enter option 1"
          />

          <Text style={styles.label}>Option 2</Text>
          <TextInput
            style={styles.input}
            value={op2}
            onChangeText={setOp2}
            placeholder="Enter option 2"
          />

          <Text style={styles.label}>Option 3</Text>
          <TextInput
            style={styles.input}
            value={op3}
            onChangeText={setOp3}
            placeholder="Enter option 3"
          />

          {/* Inventory Management Section - Only shown when editing */}
          {isEditing && (
            <View style={styles.inventorySection}>
              <View style={styles.inventoryHeader}>
                <Text style={styles.inventoryTitle}>Inventory Locations</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    if (currentItem?.id) {
                      setInventoryModalVisible(true);
                    } else {
                      Alert.alert('Error', 'Please select an item first');
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Existing Inventory List */}
              {inventoryItems && inventoryItems.length > 0 ? (
                <View style={styles.inventoryList}>
                  {inventoryItems.map((inventory) => (
                    <TouchableOpacity 
                      key={inventory.id} 
                      style={styles.inventoryListItem}
                      onPress={() => handleEditInventory(inventory)}
                      onLongPress={() => handleDeleteInventory(inventory.id)}
                    >
                      <View style={styles.inventoryItemHeader}>
                        <Text style={styles.inventoryItemLocation}>
                          {Array.isArray(inventory.locations) 
                            ? (inventory.locations[0]?.name || 'Unknown Location') 
                            : (inventory.locations?.name || inventory.locations?.id || 'Unknown Location')}
                        </Text>
                        <Text style={styles.inventoryValueText}>{inventory.available || 0}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noInventoryContainer}>
                  <Text style={styles.noInventoryText}>No inventory added for this item</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Inventory Modal */}
        {inventoryModalVisible && (
          <InventoryModal
            visible={inventoryModalVisible}
            onClose={() => {
              setInventoryModalVisible(false);
              setSelectedInventoryToEdit(null); // Reset when closing
            }}
            itemId={currentItem?.id || ''}
            locations={locationsData || []}
            inventoryToEdit={selectedInventoryToEdit}
            onInventoryAdded={() => {
              // The query will automatically update due to reactivity
              console.log('Inventory added, query should update automatically');
            }}
            onInventoryUpdated={() => {
              // The query will automatically update due to reactivity
              console.log('Inventory updated, query should update automatically');
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContentLeft}>
          <Text style={styles.headerTitle}>
            {product?.title || 'Items'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Items
          </Text>
        </View>
        <TouchableOpacity onPress={openCreateForm}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items found</Text>
          </View>
        }
      />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>Confirm to delete?</Text>
            <View style={styles.confirmationActions}>
              <TouchableOpacity onPress={cancelDelete}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteItem}>
                <Text style={styles.deleteText}>Confirm to delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContentLeft: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  addText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  error: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContent: {
    padding: 20,
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  confirmationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  confirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  inventorySection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inventoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inventoryForm: {
    marginBottom: 15,
  },
  inventoryList: {
    marginTop: 15,
  },
  inventoryListItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  inventoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inventoryItemLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inventoryValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  noInventoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  noInventoryText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});