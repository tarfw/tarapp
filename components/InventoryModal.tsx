import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { id } from '@instantdb/react-native';
import db from '../lib/db';

// Type definitions
type Location = {
  id: string;
  name?: string;
};

type Inventory = {
  id: string;
  available?: number;
  committed?: number;
  incoming?: number;
  'item-id'?: string;
  locations?: Location;
};

type InventoryModalProps = {
  visible: boolean;
  onClose: () => void;
  itemId: string;
  locations: Location[];
  onInventoryAdded?: () => void;
  onInventoryUpdated?: () => void;
  inventoryToEdit?: Inventory | null; // Add this for edit mode
};

const InventoryModal: React.FC<InventoryModalProps> = ({
  visible,
  onClose,
  itemId,
  locations,
  onInventoryAdded,
  onInventoryUpdated,
  inventoryToEdit,
}) => {
  // Initialize state based on whether we're editing or adding
  const [available, setAvailable] = useState(inventoryToEdit?.available?.toString() || '0');
  const [committed, setCommitted] = useState(inventoryToEdit?.committed?.toString() || '0');
  const [incoming, setIncoming] = useState(inventoryToEdit?.incoming?.toString() || '0');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    inventoryToEdit?.locations?.id || null
  );

  const handleSave = () => {
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }
    
    if (!itemId && !inventoryToEdit?.id) {
      alert('Item ID or Inventory ID is required');
      return;
    }

    if (inventoryToEdit) {
      // Editing existing inventory
      db.transact([
        db.tx.inventory[inventoryToEdit.id].update({
          available: parseInt(available) || 0,
          committed: parseInt(committed) || 0,
          incoming: parseInt(incoming) || 0,
        }),
        db.tx.inventory[inventoryToEdit.id].relink({ locations: selectedLocation }),
      ]);

      // Call update callback
      if (onInventoryUpdated) {
        onInventoryUpdated();
      }
    } else {
      // Creating new inventory
      const inventoryId = id();
      const newInventory = {
        id: inventoryId,
        available: parseInt(available) || 0,
        committed: parseInt(committed) || 0,
        incoming: parseInt(incoming) || 0,
      };

      db.transact([
        db.tx.inventory[inventoryId].create(newInventory),
        db.tx.inventory[inventoryId].link({ item: itemId }),
        db.tx.inventory[inventoryId].link({ locations: selectedLocation }),
      ]);

      // Call add callback
      if (onInventoryAdded) {
        onInventoryAdded();
      }
    }

    // Reset form
    setAvailable(inventoryToEdit?.available?.toString() || '0');
    setCommitted(inventoryToEdit?.committed?.toString() || '0');
    setIncoming(inventoryToEdit?.incoming?.toString() || '0');
    setSelectedLocation(inventoryToEdit?.locations?.id || null);
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{inventoryToEdit ? 'Edit Inventory' : 'Add Inventory'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
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

          <Text style={styles.label}>Location</Text>
          <View style={styles.selectorContainer}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.selectorOption,
                  selectedLocation === location.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedLocation(location.id)}
              >
                <Text style={styles.selectorOptionText}>
                  {location.name || location.id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  content: {
    padding: 20,
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
});

export default InventoryModal;