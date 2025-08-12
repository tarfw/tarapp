import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useItems, Item, OpGroup, OpValue } from '../context/ItemsContext';

export default function CreateItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { items, opGroups, opValues, createItem, updateItem, generateVariants } = useItems();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    options: [] as string[],
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [basePrice, setBasePrice] = useState<string>('0');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const itemId = Array.isArray(params.itemId) ? params.itemId[0] : params.itemId;
    
    console.log('=== CreateItem Effect ===');
    console.log('ItemID from params:', itemId, 'Type:', typeof itemId);
    console.log('Items loaded:', items.length);
    console.log('Available items:', items.map(i => ({ id: i.id, name: i.name, type: typeof i.id })));
    
    if (!itemId) {
      // Creating new item
      console.log('Creating new item - no itemId');
      setIsEditing(false);
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        options: [],
      });
      setSelectedOptions([]);
      setIsLoading(false);
      return;
    }

    // Editing existing item
    if (items.length === 0) {
      console.log('Items not loaded yet, staying in loading state');
      return;
    }

    // Try to find the item
    const item = items.find(i => String(i.id) === String(itemId));
    
    if (item) {
      console.log('Found item for edit:', item);
      setEditingItem(item);
      setIsEditing(true);
      setFormData({
        name: item.name,
        category: item.category || '',
        options: [],
      });
      
      try {
        const parsedOptions = JSON.parse(item.options);
        const validOptions = Array.isArray(parsedOptions) ? parsedOptions : [];
        console.log('Parsed options:', validOptions);
        setSelectedOptions(validOptions);
      } catch (error) {
        console.log('Error parsing options:', error);
        setSelectedOptions([]);
      }
      setIsLoading(false);
    } else {
      console.log('Item not found with ID:', itemId);
      console.log('Available item IDs:', items.map(i => String(i.id)));
      Alert.alert('Error', `Item not found with ID: ${itemId}`);
      router.back();
    }
  }, [params.itemId, items, router]);

  // Handle options selection result from separate screen
  useEffect(() => {
    if (params.selectedOptionsResult) {
      try {
        const options = JSON.parse(params.selectedOptionsResult as string);
        setSelectedOptions(Array.isArray(options) ? options : []);
      } catch (error) {
        console.log('Error parsing options result:', error);
      }
    }
  }, [params.selectedOptionsResult, params.timestamp]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    try {
      const itemData = {
        ...formData,
        options: JSON.stringify(selectedOptions),
      };

      if (isEditing && editingItem) {
        await updateItem(editingItem.id, itemData);
        Alert.alert('Success', 'Item updated successfully');
      } else {
        await createItem(itemData);
        Alert.alert('Success', 'Item created successfully');
      }
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
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

  const handleGenerateVariants = async () => {
    if (!editingItem && !formData.name.trim()) {
      Alert.alert('Error', 'Please save the item first before generating variants');
      return;
    }

    if (selectedOptions.length === 0) {
      Alert.alert('Error', 'Please select options first to generate variants');
      return;
    }

    // Calculate how many variants will be generated
    const optionValuesByGroup: { [groupId: string]: number } = {};
    selectedOptions.forEach(optionId => {
      const optionValue = opValues.find(v => v.id === optionId);
      if (optionValue) {
        optionValuesByGroup[optionValue.group_id] = (optionValuesByGroup[optionValue.group_id] || 0) + 1;
      }
    });
    
    const totalVariants = Object.values(optionValuesByGroup).reduce((acc, count) => acc * count, 1);
    const priceValue = parseFloat(basePrice) || 0;

    Alert.alert(
      'Generate Variants',
      `This will create ${totalVariants} variants with base price $${priceValue.toFixed(2)} each. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: async () => {
            setIsGenerating(true);
            try {
              let itemId = editingItem?.id;
              
              // If we're creating a new item, save it first
              if (!editingItem) {
                const itemData = {
                  ...formData,
                  options: JSON.stringify(selectedOptions),
                };
                const newItem = await createItem(itemData);
                if (!newItem) {
                  throw new Error('Failed to create item');
                }
                itemId = newItem.id;
              }
              
              if (!itemId) {
                throw new Error('No item ID available');
              }
              
              // Generate variants
              const variants = await generateVariants(itemId, selectedOptions, priceValue);
              
              Alert.alert(
                'Success', 
                `Generated ${variants.length} variants successfully! You can view and edit them in the Variants tab.`
              );
            } catch (error) {
              console.error('Variant generation error:', error);
              Alert.alert('Error', 'Failed to generate variants. Please try again.');
            } finally {
              setIsGenerating(false);
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading item data...</Text>
          <Text style={styles.debugText}>
            ItemID: {JSON.stringify(params.itemId)} | Items: {items.length}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Item' : 'Create Item'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category (optional)"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Options Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <TouchableOpacity 
            style={styles.optionsSelector}
            onPress={navigateToOptionsSelection}
          >
            <View style={styles.optionsSelectorContent}>
              <Text style={styles.optionsSelectorLabel}>Selected Options</Text>
              <Text style={styles.optionsSelectorValue}>
                {getSelectedOptionsText()}
              </Text>
            </View>
            <Text style={styles.optionsSelectorArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Generate Variants Section */}
        {selectedOptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Variants</Text>
            <Text style={styles.sectionSubtitle}>
              Generate variant items based on selected options
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Base Price</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={basePrice}
                onChangeText={setBasePrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={handleGenerateVariants}
              disabled={isGenerating}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate Variant Items'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#000',
    backgroundColor: 'transparent',
  },
  optionsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  optionsSelectorContent: {
    flex: 1,
  },
  optionsSelectorLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 4,
  },
  optionsSelectorValue: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  optionsSelectorArrow: {
    fontSize: 18,
    color: '#c7c7cc',
    fontWeight: '400',
  },
  generateButton: {
    backgroundColor: '#34c759',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#a3d977',
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e93',
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
});