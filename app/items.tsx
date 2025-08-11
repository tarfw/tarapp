import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useItems, Item, OpGroup, OpValue, Variant } from '../context/ItemsContext';

export default function ItemsScreen() {
  const {
    items,
    opGroups,
    opValues,
    variants,
    createItem,
    updateItem,
    deleteItem,
    createOpGroup,
    updateOpGroup,
    deleteOpGroup,
    createOpValue,
    updateOpValue,
    deleteOpValue,
    createVariant,
    updateVariant,
    deleteVariant,
    syncItems,
    toggleSync,
    isSyncing,
    resetDatabase,
    checkHealth,
  } = useItems();

  const [activeTab, setActiveTab] = useState<'items' | 'groups' | 'values' | 'variants'>('items');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingGroup, setEditingGroup] = useState<OpGroup | null>(null);
  const [editingValue, setEditingValue] = useState<OpValue | null>(null);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    options: '[]',
  });

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    code: '',
  });

  const [valueFormData, setValueFormData] = useState({
    group_id: '',
    value: '',
    code: '',
  });

  const [variantFormData, setVariantFormData] = useState({
    item_id: '',
    sku: '',
    barcode: '',
    price: '0',
    stock: '0',
    status: 'active',
    options: '[]',
  });

  const handleCreateItem = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
      } else {
        await createItem(formData);
      }
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || '',
      options: item.options,
    });
    setModalVisible(true);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
      ]
    );
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete all items data and recreate the tables. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: async () => {
            const success = await resetDatabase();
            Alert.alert(
              success ? 'Success' : 'Error',
              success ? 'Database reset successfully' : 'Failed to reset database'
            );
          }
        },
      ]
    );
  };

  const handleCheckHealth = async () => {
    const isHealthy = await checkHealth();
    Alert.alert(
      'Database Health',
      isHealthy ? 'Database is healthy' : 'Database has issues - consider resetting'
    );
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', options: '[]' });
    setEditingItem(null);
  };

  const resetGroupForm = () => {
    setGroupFormData({ name: '', code: '' });
    setEditingGroup(null);
  };

  const resetValueForm = () => {
    setValueFormData({ group_id: '', value: '', code: '' });
    setEditingValue(null);
  };

  const resetVariantForm = () => {
    setVariantFormData({
      item_id: '',
      sku: '',
      barcode: '',
      price: '0',
      stock: '0',
      status: 'active',
      options: '[]',
    });
    setEditingVariant(null);
  };

  // Group operations
  const handleCreateGroup = async () => {
    if (!groupFormData.name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      if (editingGroup) {
        await updateOpGroup(editingGroup.id, groupFormData);
      } else {
        await createOpGroup(groupFormData);
      }
      resetGroupForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save group');
    }
  };

  const handleEditGroup = (group: OpGroup) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      code: group.code || '',
    });
    setModalVisible(true);
  };

  const handleDeleteGroup = (id: string) => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This will also delete all associated values.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteOpGroup(id) },
      ]
    );
  };

  // Value operations
  const handleCreateValue = async () => {
    if (!valueFormData.value.trim() || !valueFormData.group_id) {
      Alert.alert('Error', 'Value and group are required');
      return;
    }

    try {
      if (editingValue) {
        await updateOpValue(editingValue.id, valueFormData);
      } else {
        await createOpValue(valueFormData);
      }
      resetValueForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save value');
    }
  };

  const handleEditValue = (value: OpValue) => {
    setEditingValue(value);
    setValueFormData({
      group_id: value.group_id,
      value: value.value,
      code: value.code || '',
    });
    setModalVisible(true);
  };

  const handleDeleteValue = (id: string) => {
    Alert.alert(
      'Delete Value',
      'Are you sure you want to delete this value?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteOpValue(id) },
      ]
    );
  };

  // Variant operations
  const handleCreateVariant = async () => {
    if (!variantFormData.item_id) {
      Alert.alert('Error', 'Item is required');
      return;
    }

    try {
      const variantData = {
        ...variantFormData,
        price: parseFloat(variantFormData.price) || 0,
        stock: parseInt(variantFormData.stock) || 0,
      };

      if (editingVariant) {
        await updateVariant(editingVariant.id, variantData);
      } else {
        await createVariant(variantData);
      }
      resetVariantForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save variant');
    }
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setVariantFormData({
      item_id: variant.item_id,
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      price: variant.price.toString(),
      stock: variant.stock.toString(),
      status: variant.status,
      options: variant.options,
    });
    setModalVisible(true);
  };

  const handleDeleteVariant = (id: string) => {
    Alert.alert(
      'Delete Variant',
      'Are you sure you want to delete this variant?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteVariant(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.category && <Text style={styles.itemCategory}>Category: {item.category}</Text>}
        <Text style={styles.itemOptions}>Options: {item.options}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditItem(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOpGroup = ({ item }: { item: OpGroup }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.code && <Text style={styles.itemCategory}>Code: {item.code}</Text>}
        <Text style={styles.itemCategory}>
          Values: {opValues.filter(v => v.group_id === item.id).length}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditGroup(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteGroup(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOpValue = ({ item }: { item: OpValue }) => {
    const group = opGroups.find(g => g.id === item.group_id);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.value}</Text>
          <Text style={styles.itemCategory}>Group: {group?.name || 'Unknown'}</Text>
          {item.code && <Text style={styles.itemCategory}>Code: {item.code}</Text>}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditValue(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteValue(item.id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVariant = ({ item }: { item: Variant }) => {
    const parentItem = items.find(i => i.id === item.item_id);
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>
            {parentItem?.name || 'Unknown Item'} - {item.sku || 'No SKU'}
          </Text>
          <Text style={styles.itemCategory}>Price: ${item.price.toFixed(2)}</Text>
          <Text style={styles.itemCategory}>Stock: {item.stock}</Text>
          <Text style={styles.itemCategory}>Status: {item.status}</Text>
          {item.barcode && <Text style={styles.itemCategory}>Barcode: {item.barcode}</Text>}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditVariant(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteVariant(item.id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'items': return items;
      case 'groups': return opGroups;
      case 'values': return opValues;
      case 'variants': return variants;
      default: return [];
    }
  };

  const getCurrentRenderer = () => {
    switch (activeTab) {
      case 'items': return renderItem;
      case 'groups': return renderOpGroup;
      case 'values': return renderOpValue;
      case 'variants': return renderVariant;
      default: return renderItem;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Items Management</Text>
        <View style={styles.syncContainer}>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonActive]}
            onPress={() => toggleSync(!isSyncing)}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Stop Sync' : 'Start Sync'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncButton} onPress={syncItems}>
            <Text style={styles.syncButtonText}>Manual Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncButton} onPress={handleCheckHealth}>
            <Text style={styles.syncButtonText}>Health</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.syncButton, { backgroundColor: '#FF3B30' }]} 
            onPress={handleResetDatabase}
          >
            <Text style={styles.syncButtonText}>Reset DB</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(['items', 'groups', 'values', 'variants'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getCurrentData()}
        renderItem={getCurrentRenderer()}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeTab} found</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (activeTab === 'items') {
            resetForm();
          } else if (activeTab === 'groups') {
            resetGroupForm();
          } else if (activeTab === 'values') {
            resetValueForm();
          } else if (activeTab === 'variants') {
            resetVariantForm();
          }
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>
          + Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(0, -1)}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {activeTab === 'items' && (
              <>
                <Text style={styles.modalTitle}>
                  {editingItem ? 'Edit Item' : 'Create Item'}
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Item Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Category (optional)"
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Options JSON (e.g., [])"
                  value={formData.options}
                  onChangeText={(text) => setFormData({ ...formData, options: text })}
                  multiline
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      resetForm();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleCreateItem}
                  >
                    <Text style={styles.modalButtonText}>
                      {editingItem ? 'Update' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'groups' && (
              <>
                <Text style={styles.modalTitle}>
                  {editingGroup ? 'Edit Group' : 'Create Group'}
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Group Name"
                  value={groupFormData.name}
                  onChangeText={(text) => setGroupFormData({ ...groupFormData, name: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Code (optional)"
                  value={groupFormData.code}
                  onChangeText={(text) => setGroupFormData({ ...groupFormData, code: text })}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      resetGroupForm();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleCreateGroup}
                  >
                    <Text style={styles.modalButtonText}>
                      {editingGroup ? 'Update' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'values' && (
              <>
                <Text style={styles.modalTitle}>
                  {editingValue ? 'Edit Value' : 'Create Value'}
                </Text>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Select Group:</Text>
                  <View style={styles.pickerWrapper}>
                    {opGroups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.pickerOption,
                          valueFormData.group_id === group.id && styles.pickerOptionSelected
                        ]}
                        onPress={() => setValueFormData({ ...valueFormData, group_id: group.id })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          valueFormData.group_id === group.id && styles.pickerOptionTextSelected
                        ]}>
                          {group.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Value"
                  value={valueFormData.value}
                  onChangeText={(text) => setValueFormData({ ...valueFormData, value: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Code (optional)"
                  value={valueFormData.code}
                  onChangeText={(text) => setValueFormData({ ...valueFormData, code: text })}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      resetValueForm();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleCreateValue}
                  >
                    <Text style={styles.modalButtonText}>
                      {editingValue ? 'Update' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'variants' && (
              <>
                <Text style={styles.modalTitle}>
                  {editingVariant ? 'Edit Variant' : 'Create Variant'}
                </Text>
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Select Item:</Text>
                  <View style={styles.pickerWrapper}>
                    {items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.pickerOption,
                          variantFormData.item_id === item.id && styles.pickerOptionSelected
                        ]}
                        onPress={() => setVariantFormData({ ...variantFormData, item_id: item.id })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          variantFormData.item_id === item.id && styles.pickerOptionTextSelected
                        ]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="SKU (optional)"
                  value={variantFormData.sku}
                  onChangeText={(text) => setVariantFormData({ ...variantFormData, sku: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Barcode (optional)"
                  value={variantFormData.barcode}
                  onChangeText={(text) => setVariantFormData({ ...variantFormData, barcode: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={variantFormData.price}
                  onChangeText={(text) => setVariantFormData({ ...variantFormData, price: text })}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Stock"
                  value={variantFormData.stock}
                  onChangeText={(text) => setVariantFormData({ ...variantFormData, stock: text })}
                  keyboardType="numeric"
                />
                
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Status:</Text>
                  <View style={styles.pickerWrapper}>
                    {['active', 'inactive', 'archived'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.pickerOption,
                          variantFormData.status === status && styles.pickerOptionSelected
                        ]}
                        onPress={() => setVariantFormData({ ...variantFormData, status })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          variantFormData.status === status && styles.pickerOptionTextSelected
                        ]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      resetVariantForm();
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleCreateVariant}
                  >
                    <Text style={styles.modalButtonText}>
                      {editingVariant ? 'Update' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  syncContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonActive: {
    backgroundColor: '#FF3B30',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemOptions: {
    fontSize: 12,
    color: '#999',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  },
  addButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});