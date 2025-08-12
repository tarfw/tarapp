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
  Pressable,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Trash2, Play, Square, RotateCw, Activity } from 'lucide-react-native';
import { useItems, Item, OpGroup, OpValue, Variant } from '../context/ItemsContext';

export default function ItemsScreen() {
  const router = useRouter();
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
    router.push(`/create-item?itemId=${item.id}`);
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
    router.push(`/create-group?groupId=${group.id}`);
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
    const id = value.id;
    router.push(`/create-value?valueId=${id}`);
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
    router.push(`/create-variant?variantId=${variant.id}`);
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

  const getOptionDisplayText = (optionsJson: string) => {
    try {
      const optionIds = JSON.parse(optionsJson);
      if (!Array.isArray(optionIds) || optionIds.length === 0) {
        return 'No options selected';
      }
      
      const optionTexts = optionIds.map(id => {
        const option = opValues.find(v => v.id === id);
        const group = option ? opGroups.find(g => g.id === option.group_id) : null;
        return option && group ? `${group.name}: ${option.value}` : null;
      }).filter((text): text is string => text !== null);
      
      return optionTexts.length > 0 ? optionTexts.join(', ') : 'Invalid options';
    } catch {
      return 'Invalid options format';
    }
  };

  const RightAction = (onDelete: () => void) => (
    prog: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 60 }],
      };
    });

    return (
      <Pressable onPress={onDelete}>
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <Trash2 size={24} color="#FF3B30" />
        </Reanimated.View>
      </Pressable>
    );
  };

  const renderItem = ({ item }: { item: Item }) => {
    if (!item || !item.id) return null;
    
    return (
      <ReanimatedSwipeable
        key={String(item.id)}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction(() => handleDeleteItem(String(item.id)))}
        overshootRight={false}
        containerStyle={{ backgroundColor: '#FFFFFF' }}
      >
        <Pressable onPress={() => handleEditItem(item)} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{String(item.name || 'Unnamed Item')}</Text>
            {item.category && (
              <Text style={styles.itemCategory}>Category: {String(item.category)}</Text>
            )}
            <Text style={styles.itemOptions}>Options: {getOptionDisplayText(item.options || '[]')}</Text>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    );
  };

  const renderOpGroup = ({ item }: { item: OpGroup }) => {
    if (!item || !item.id) return null;
    
    return (
      <ReanimatedSwipeable
        key={String(item.id)}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction(() => handleDeleteGroup(String(item.id)))}
        overshootRight={false}
        containerStyle={{ backgroundColor: '#FFFFFF' }}
      >
        <Pressable onPress={() => handleEditGroup(item)} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{String(item.name || 'Unnamed Group')}</Text>
            {item.code && <Text style={styles.itemCategory}>Code: {String(item.code)}</Text>}
            <Text style={styles.itemCategory}>
              Values: {String(opValues.filter(v => v.group_id === item.id).length)}
            </Text>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    );
  };

  const renderOpValue = ({ item }: { item: OpValue }) => {
    if (!item || !item.id) return null;
    
    const group = opGroups.find(g => g.id === item.group_id);
    return (
      <ReanimatedSwipeable
        key={String(item.id)}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction(() => handleDeleteValue(String(item.id)))}
        overshootRight={false}
        containerStyle={{ backgroundColor: '#FFFFFF' }}
      >
        <Pressable onPress={() => handleEditValue(item)} style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{String(item.value || 'Unnamed Value')}</Text>
            <Text style={styles.itemCategory}>Group: {String(group?.name || 'Unknown')}</Text>
            {item.code && <Text style={styles.itemCategory}>Code: {String(item.code)}</Text>}
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    );
  };

  const renderVariant = ({ item }: { item: Variant }) => {
    if (!item || !item.id || !item.item_id) return null;
    
    const parentItem = items.find(i => i.id === item.item_id);
    
    // Convert numeric status to readable text
    const getStatusText = (status: string | number): string => {
      const numStatus = Number(status);
      switch (numStatus) {
        case 0: return 'Inactive';
        case 1: return 'Active';
        case 2: return 'Archived';
        default: return 'Active';
      }
    };

    // Get status color for minimal display
    const getStatusColor = (status: string | number): string => {
      // Ensure we're working with a number and handle string numbers
      const numStatus = Number(status);
      switch (numStatus) {
        case 0: return '#ef4444'; // red - Inactive
        case 1: return '#22c55e'; // green - Active
        case 2: return '#f59e0b'; // orange - Archived
        default: return '#22c55e'; // default to green
      }
    };

    // Ensure all values are properly converted to strings
    const itemName = String(parentItem?.name || 'Unknown Item');
    const skuText = String(item.sku || 'No SKU');
    const priceText = String((Number(item.price) || 0).toFixed(2));
    const stockText = String(Number(item.stock) || 0);
    
    return (
      <ReanimatedSwipeable
        key={String(item.id)}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction(() => handleDeleteVariant(String(item.id)))}
        overshootRight={false}
        containerStyle={{ backgroundColor: '#FFFFFF' }}
      >
        <Pressable onPress={() => handleEditVariant(item)} style={styles.variantContainer}>
          <View style={styles.variantContent}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantTitle}>
                {itemName}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status || 1) }]} />
            </View>
            <View style={styles.variantDetails}>
              <Text style={styles.variantSku}>{skuText}</Text>
              <Text style={styles.variantPrice}>${priceText}</Text>
              <Text style={styles.variantStock}>{stockText} in stock</Text>
            </View>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    );
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'items': return items.filter(item => item && item.id && item.name);
      case 'groups': return opGroups.filter(group => group && group.id && group.name);
      case 'values': return opValues.filter(value => value && value.id && value.value);
      case 'variants': return variants.filter(variant => variant && variant.id && variant.item_id);
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

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'items': return '+ Add Item';
      case 'groups': return '+ Add Group';
      case 'values': return '+ Add Value';
      case 'variants': return '+ Add Variant';
      default: return '+ Add Item';
    }
  };

  // Debug logging
  console.log('ItemsScreen render - activeTab:', activeTab);
  console.log('ItemsScreen render - items count:', items.length);
  console.log('ItemsScreen render - current data count:', getCurrentData().length);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Items Management',
          headerShadowVisible: false,
          headerStyle: {
            borderBottomWidth: 0.5,
            borderBottomColor: '#E5E5E7',
          },
        }}
      />
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.syncContainer}>
          <TouchableOpacity
            style={[styles.iconButton, isSyncing && styles.iconButtonActive]}
            onPress={() => toggleSync(!isSyncing)}
          >
            {isSyncing ? <Square size={20} color="#fff" /> : <Play size={20} color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={syncItems}>
            <RotateCw size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleCheckHealth}>
            <Activity size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, styles.resetButton]} 
            onPress={handleResetDatabase}
          >
            <Text style={styles.resetButtonText}>Reset DB</Text>
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
              {String(tab.charAt(0).toUpperCase() + tab.slice(1))}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getCurrentData()}
        renderItem={(props) => {
          try {
            const renderer = getCurrentRenderer();
            return renderer(props);
          } catch (error) {
            console.error('Error rendering item:', error, props);
            return (
              <View style={styles.itemContainer}>
                <Text style={styles.itemName}>Error rendering item</Text>
              </View>
            );
          }
        }}
        keyExtractor={(item) => String(item?.id || Math.random())}
        style={styles.list}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text style={styles.emptyText}>No {String(activeTab)} found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (activeTab === 'items') {
            router.push('/create-item');
          } else if (activeTab === 'groups') {
            router.push('/create-group');
          } else if (activeTab === 'values') {
            router.push('/create-value');
          } else if (activeTab === 'variants') {
            router.push('/create-variant');
          }
        }}
      >
        <Text style={styles.addButtonText}>
          {getAddButtonText()}
        </Text>
      </TouchableOpacity>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  syncContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#FF3B30',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    width: 'auto',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resetButtonText: {
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
    padding: 0,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
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
    display: 'none',
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
  rightAction: {
    width: 60,
    height: '100%',
    paddingBottom: 12,
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
  // Variant-specific minimal styles
  variantContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  variantContent: {
    flex: 1,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  variantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  variantSku: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  variantPrice: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  variantStock: {
    fontSize: 13,
    color: '#666',
  },
});
