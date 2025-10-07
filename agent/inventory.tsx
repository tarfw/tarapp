import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { id } from '@instantdb/react-native';
import db from '../lib/db';

// Inventory type based on schema
type Inventory = {
  id: string;
  available?: number;
  committed?: number;
  incoming?: number;
  updatedat?: Date;
  item?: {
    id: string;
    sku?: string;
    barcode?: string;
    price?: number;
    product?: {
      id: string;
      title?: string;
    };
  };
  locations?: {
    id: string;
    name?: string;
  } | {
    id: string;
    name?: string;
  }[];
};

export default function InventoryAgent() {
  const router = useRouter();
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInventory, setCurrentInventory] = useState<Inventory | null>(null);
  const [available, setAvailable] = useState('');
  const [committed, setCommitted] = useState('');
  const [incoming, setIncoming] = useState('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<string | null>(null);

  // Query inventory from the database with their related items, products, and locations
  const { data, isLoading, error } = db.useQuery({ 
    inventory: {
      item: {
        product: {},
      },
      locations: {},
    }
  });

  // Get all items for selection
  const { data: itemsData } = db.useQuery({ 
    items: {}
  });

  // Get all locations for selection
  const { data: locationsData } = db.useQuery({ 
    locations: {}
  });

  useEffect(() => {
    if (data?.inventory) {
      setInventoryItems(data.inventory);
    }
  }, [data]);

  const handleCreateInventory = () => {
    if (!selectedItem || !selectedLocation) {
      Alert.alert('Error', 'Item and Location are required');
      return;
    }

    const newInventory = {
      available: available.trim() ? parseInt(available.trim()) : 0,
      committed: committed.trim() ? parseInt(committed.trim()) : 0,
      incoming: incoming.trim() ? parseInt(incoming.trim()) : 0,
      item: selectedItem,
      locations: selectedLocation,
    };

    db.transact([
      db.tx.inventory[id()].create(newInventory)
    ]);

    resetForm();
    setShowForm(false);
  };

  const handleUpdateInventory = () => {
    if (!currentInventory || !selectedItem || !selectedLocation) {
      Alert.alert('Error', 'Item and Location are required');
      return;
    }

    const updatedInventory = {
      id: currentInventory.id,
      available: available.trim() ? parseInt(available.trim()) : 0,
      committed: committed.trim() ? parseInt(committed.trim()) : 0,
      incoming: incoming.trim() ? parseInt(incoming.trim()) : 0,
      item: selectedItem,
      locations: selectedLocation,
    };

    db.transact([
      db.tx.inventory[currentInventory.id].update(updatedInventory)
    ]);

    resetForm();
    setShowForm(false);
  };

  const showDeleteConfirmation = (id: string) => {
    setInventoryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteInventory = () => {
    if (inventoryToDelete) {
      db.transact([
        db.tx.inventory[inventoryToDelete].delete()
      ]);
      setShowDeleteConfirm(false);
      setInventoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setInventoryToDelete(null);
  };

  const resetForm = () => {
    setAvailable('');
    setCommitted('');
    setIncoming('');
    setSelectedItem('');
    setSelectedLocation('');
    setCurrentInventory(null);
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

  const openEditForm = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setAvailable(inventory.available?.toString() || '');
    setCommitted(inventory.committed?.toString() || '');
    setIncoming(inventory.incoming?.toString() || '');
    setSelectedItem(inventory.item?.id || '');
    // Handle both array and object access for locations
    setSelectedLocation(
      Array.isArray(inventory.locations) 
        ? (inventory.locations[0]?.id || '') 
        : (inventory.locations?.id || '')
    );
    setIsEditing(true);
    setShowForm(true);
  };

  const renderItem = ({ item }: { item: Inventory }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => openEditForm(item)}
      onLongPress={() => showDeleteConfirmation(item.id)}
    >
      <View style={styles.inventoryHeader}>
        <Text style={styles.listItemTitle}>
          {item.item?.product?.title || item.item?.sku || 'Untitled Item'} at {
            Array.isArray(item.locations) 
              ? (item.locations[0]?.name || 'Unknown Location') 
              : (item.locations?.name || 'Unknown Location')
          }
        </Text>
        <TouchableOpacity 
          style={styles.inventoryCountContainer}
          onPress={() => openEditForm(item)}
        >
          <Text style={styles.inventoryCount}>
            {item.available || 0}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inventoryDetails}>
        <Text style={styles.detailText}>Available: {item.available || 0}</Text>
        <Text style={styles.detailText}>Committed: {item.committed || 0}</Text>
        <Text style={styles.detailText}>Incoming: {item.incoming || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading inventory...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }

  if (showForm) {
    return (
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={closeForm}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>
            {isEditing ? 'Edit Inventory' : 'Create New Inventory'}
          </Text>
          <TouchableOpacity
            onPress={isEditing ? handleUpdateInventory : handleCreateInventory}
          >
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.label}>Item</Text>
          <View style={styles.selectorContainer}>
            {itemsData?.items && itemsData.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.selectorOption,
                  selectedItem === item.id && styles.selectedOption
                ]}
                onPress={() => setSelectedItem(item.id)}
              >
                <Text style={styles.selectorOptionText}>{item.sku || item.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <View style={styles.selectorContainer}>
            {locationsData?.locations && locationsData.locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.selectorOption,
                  selectedLocation === location.id && styles.selectedOption
                ]}
                onPress={() => setSelectedLocation(location.id)}
              >
                <Text style={styles.selectorOptionText}>{location.name || location.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Available</Text>
          <TextInput
            style={styles.input}
            value={available}
            onChangeText={setAvailable}
            placeholder="Enter available quantity"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Committed</Text>
          <TextInput
            style={styles.input}
            value={committed}
            onChangeText={setCommitted}
            placeholder="Enter committed quantity"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Incoming</Text>
          <TextInput
            style={styles.input}
            value={incoming}
            onChangeText={setIncoming}
            placeholder="Enter incoming quantity"
            keyboardType="numeric"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <TouchableOpacity onPress={openCreateForm}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={inventoryItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No inventory found</Text>
            </View>
          }
        />
      </View>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>Confirm to delete?</Text>
            <View style={styles.confirmationActions}>
              <TouchableOpacity onPress={cancelDelete}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteInventory}>
                <Text style={styles.deleteText}>Confirm to delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  error: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#e74c3c',
  },
  addText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
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
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyState: {
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
  inventoryHeader: {
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
  inventoryCountContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  inventoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
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
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectorOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  selectorOptionText: {
    color: '#333',
    fontSize: 14,
  },
  selectedOptionText: {
    color: 'white',
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
});