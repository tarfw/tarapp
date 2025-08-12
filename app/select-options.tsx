import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useItems, OpGroup, OpValue } from '../context/ItemsContext';

export default function SelectOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { opGroups, opValues } = useItems();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    // Parse existing selected options from params
    const existingOptions = params.selectedOptions;
    if (existingOptions) {
      try {
        const parsed = JSON.parse(existingOptions as string);
        setSelectedOptions(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.log('Error parsing existing options:', error);
        setSelectedOptions([]);
      }
    }
  }, [params.selectedOptions]);

  const toggleOptionValue = (valueId: string) => {
    setSelectedOptions(prev => 
      prev.includes(valueId) 
        ? prev.filter(id => id !== valueId)
        : [...prev, valueId]
    );
  };

  const handleSave = () => {
    // Navigate back with selected options
    router.back();
    // Pass the selected options back via navigation params
    if (router.canGoBack()) {
      router.setParams({ 
        selectedOptionsResult: JSON.stringify(selectedOptions),
        timestamp: Date.now().toString() // Force param update
      });
    }
  };

  const getSelectedValuesForGroup = (groupId: string) => {
    return opValues
      .filter(value => value.group_id === groupId && selectedOptions.includes(value.id))
      .map(value => value.value)
      .join(', ');
  };

  const renderOptionGroup = (group: OpGroup) => {
    const groupValues = opValues.filter(value => value.group_id === group.id);
    const selectedInGroup = getSelectedValuesForGroup(group.id);

    return (
      <View key={group.id} style={styles.optionGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{group.name}</Text>
          {selectedInGroup && (
            <Text style={styles.selectedCount}>
              Selected: {selectedInGroup}
            </Text>
          )}
        </View>
        
        <View style={styles.optionValues}>
          {groupValues.map(value => (
            <TouchableOpacity
              key={value.id}
              style={[
                styles.optionValue,
                selectedOptions.includes(value.id) && styles.optionValueSelected
              ]}
              onPress={() => toggleOptionValue(value.id)}
            >
              <Text style={[
                styles.optionValueText,
                selectedOptions.includes(value.id) && styles.optionValueTextSelected
              ]}>
                {value.value}
                {value.code && <Text style={styles.optionCode}> ({value.code})</Text>}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const selectedCount = selectedOptions.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Options</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selection Summary */}
        {selectedCount > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryText}>
              {selectedCount} option{selectedCount !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* Options Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Options</Text>
          <Text style={styles.sectionSubtitle}>
            Select option values that apply to this item
          </Text>

          {opGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No option groups available. Create groups and values first.
              </Text>
            </View>
          ) : (
            opGroups.map(renderOptionGroup)
          )}
        </View>

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
  summarySection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 32,
  },
  groupHeader: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '400',
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionValue: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
  },
  optionValueSelected: {
    backgroundColor: '#007AFF',
  },
  optionValueText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  optionValueTextSelected: {
    color: '#fff',
  },
  optionCode: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
