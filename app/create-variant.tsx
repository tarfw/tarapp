import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useItems, Item, OpGroup, OpValue, Variant } from '../context/ItemsContext';

export default function CreateVariantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { items, opGroups, opValues, variants, createVariant, updateVariant } = useItems();

  const [formData, setFormData] = useState({
    item_id: '',
    sku: '',
    barcode: '',
    price: '0',
    stock: '0',
    status: 1, // 0=Inactive, 1=Active, 2=Archived
    options: [] as string[],
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const variantId = Array.isArray(params.variantId) ? params.variantId[0] : params.variantId;
    const itemId = Array.isArray(params.itemId) ? params.itemId[0] : params.itemId;

    if (!variantId) {
      // Creating new variant
      setIsEditing(false);
      setEditingVariant(null);
      setFormData({
        item_id: itemId || (items.length > 0 ? items[0].id : ''),
        sku: '',
        barcode: '',
        price: '0',
        stock: '0',
        status: 1, // Default to Active
        options: [],
      });
      setSelectedOptions([]);
      setIsLoading(false);
      return;
    }

    if (variants.length === 0) return; // wait for context load

    const variant = variants.find(v => String(v.id) === String(variantId));
    if (variant) {
      setEditingVariant(variant);
      setIsEditing(true);
      setFormData({
        item_id: variant.item_id,
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        price: variant.price.toString(),
        stock: variant.stock.toString(),
        status: getStatusCode(variant.status),
        options: [],
      });

      try {
        const parsedOptions = JSON.parse(variant.options);
        const validOptions = Array.isArray(parsedOptions) ? parsedOptions : [];
        setSelectedOptions(validOptions);
      } catch (error) {
        console.log('Error parsing variant options:', error);
        setSelectedOptions([]);
      }
      setIsLoading(false);
    } else {
      Alert.alert('Error', `Variant not found: ${variantId}`);
      router.back();
    }
  }, [params.variantId, params.itemId, variants, items, router]);


  const handleSave = async () => {
    if (!formData.item_id) {
      Alert.alert('Error', 'Item is required');
      return;
    }

    const price = parseFloat(formData.price) || 0;
    const stock = parseInt(formData.stock) || 0;

    if (price < 0) {
      Alert.alert('Error', 'Price cannot be negative');
      return;
    }

    if (stock < 0) {
      Alert.alert('Error', 'Stock cannot be negative');
      return;
    }

    try {
      const variantData = {
        item_id: formData.item_id,
        sku: formData.sku,
        barcode: formData.barcode,
        price: price,
        stock: stock,
        status: formData.status,
        options: JSON.stringify(selectedOptions),
      };

      if (isEditing && editingVariant) {
        await updateVariant(editingVariant.id, variantData);
        Alert.alert('Success', 'Variant updated successfully');
      } else {
        await createVariant(variantData);
        Alert.alert('Success', 'Variant created successfully');
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save variant');
    }
  };


  const navigateToOptionsSelection = () => {
    router.push({
      pathname: '/select-options',
      params: {
        selectedOptions: JSON.stringify(selectedOptions)
      }
    });
  };

  // Handle options selection result from separate screen
  useEffect(() => {
    if (params.selectedOptionsResult && !isEditing) {
      try {
        const options = JSON.parse(params.selectedOptionsResult as string);
        setSelectedOptions(Array.isArray(options) ? options : []);
      } catch (error) {
        console.log('Error parsing options result:', error);
      }
    }
  }, [params.selectedOptionsResult, params.timestamp, isEditing]);

  const getSelectedOptionsText = () => {
    if (selectedOptions.length === 0) {
      return 'No options selected';
    }
    
    const optionTexts = selectedOptions.map(optionId => {
      const option = opValues.find(v => v.id === optionId);
      const group = option ? opGroups.find(g => g.id === option.group_id) : null;
      return option && group ? `${group.name}: ${option.value}` : null;
    }).filter(Boolean);
    
    return optionTexts.length > 0 ? optionTexts.join(', ') : 'Invalid options';
  };

  const getSelectedItemName = () => {
    const selectedItem = items.find(item => item.id === formData.item_id);
    return selectedItem ? selectedItem.name : 'Select Item';
  };

  // Status conversion helpers
  const getStatusCode = (status: string | number): number => {
    if (typeof status === 'number') return status;
    switch (status.toLowerCase()) {
      case 'inactive': return 0;
      case 'active': return 1;
      case 'archived': return 2;
      default: return 1; // Default to active
    }
  };

  const getStatusText = (code: number): string => {
    switch (code) {
      case 0: return 'Inactive';
      case 1: return 'Active';
      case 2: return 'Archived';
      default: return 'Active';
    }
  };

  const statusOptions = [
    { code: 1, label: 'Active' },
    { code: 0, label: 'Inactive' },
    { code: 2, label: 'Archived' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading variant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Variant' : 'Create Variant'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Selected Item</Text>
            <Text style={styles.fieldValue}>{getSelectedItemName()}</Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>SKU</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter SKU (optional)"
              value={formData.sku}
              onChangeText={(text) => setFormData({ ...formData, sku: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.fieldLabel}>Barcode</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter barcode (optional)"
              value={formData.barcode}
              onChangeText={(text) => setFormData({ ...formData, barcode: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Pricing & Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
          
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.fieldLabel}>Stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.fieldLabel}>Variant Status</Text>
            <View style={styles.statusOptions}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.statusOption, formData.status === option.code && styles.statusOptionSelected]}
                  onPress={() => setFormData({ ...formData, status: option.code })}
                >
                  <Text style={[styles.statusOptionText, formData.status === option.code && styles.statusOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Variant Options</Text>
          
          <View style={[styles.field, styles.fieldLast]}>
            <Text style={styles.fieldLabel}>Product Options</Text>
            
            {isEditing ? (
              // Read-only display for existing variants
              <View style={styles.readOnlyField}>
                <Text style={styles.fieldValue}>{getSelectedOptionsText()}</Text>
                <Text style={styles.readOnlyNote}>
                  Options cannot be changed after creation
                </Text>
              </View>
            ) : (
              // Interactive selector for new variants
              <TouchableOpacity 
                style={styles.selectableField}
                onPress={navigateToOptionsSelection}
              >
                <View style={styles.selectableFieldContent}>
                  <Text style={styles.fieldValue}>{getSelectedOptionsText()}</Text>
                </View>
                <Text style={styles.selectableFieldArrow}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.025,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  field: {
    marginBottom: 32,
  },
  fieldLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  inputFocused: {
    borderBottomColor: '#2563eb',
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    lineHeight: 20,
  },
  fieldValueSecondary: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  selectableField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  selectableFieldContent: {
    flex: 1,
  },
  selectableFieldArrow: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 12,
  },
  readOnlyField: {
    paddingVertical: 12,
  },
  readOnlyNote: {
    fontSize: 12,
    color: '#f59e0b',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  bottomSpace: {
    height: 60,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
});
