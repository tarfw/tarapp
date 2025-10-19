import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InventoryModal } from '../components/InventoryModal'; // Adjust import as needed
import db from '../lib/db';

interface InventoryListProps {
  itemId: string;
  locations: any[];
  onEditInventory: (inventory: any) => void;
  onDeleteInventory: (inventoryId: string) => void;
  onAddInventory: () => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
  itemId, 
  locations,
  onEditInventory,
  onDeleteInventory,
  onAddInventory
}) => {
  // Query for inventory items for the current item specifically
  const { data: inventoryData } = db.useQuery({
    inventory: {
      $: {
        where: itemId ? { 'item.id': itemId } : { id: 'non-existent-id' },
      },
      locations: {},
    }
  });
  
  const inventoryItems = inventoryData?.inventory || [];

  if (inventoryItems.length === 0) {
    return (
      <View style={styles.noInventoryContainer}>
        <Text style={styles.noInventoryText}>No inventory added for this item</Text>
      </View>
    );
  }

  return (
    <View style={styles.inventoryList}>
      {inventoryItems.map((inventory) => (
        <TouchableOpacity 
          key={inventory.id} 
          style={styles.inventoryListItem}
          onPress={() => onEditInventory(inventory)}
          onLongPress={() => onDeleteInventory(inventory.id)}
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
  );
};

const styles = StyleSheet.create({
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
  },
  inventoryItemLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: 'white',
    borderRadius: 8,
  },
  noInventoryText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default InventoryList;