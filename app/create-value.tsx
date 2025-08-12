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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useItems, OpGroup, OpValue } from '../context/ItemsContext';

export default function CreateValueScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { opGroups, opValues, createOpValue, updateOpValue } = useItems();

  const [formData, setFormData] = useState({ group_id: '', value: '', code: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<OpValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const valueId = Array.isArray(params.valueId) ? params.valueId[0] : params.valueId;

    if (!valueId) {
      setIsEditing(false);
      setEditingValue(null);
      setFormData({ group_id: opGroups[0]?.id || '', value: '', code: '' });
      setIsLoading(false);
      return;
    }

    if (opValues.length === 0) return; // wait for context load

    const value = opValues.find(v => String(v.id) === String(valueId));
    if (value) {
      setEditingValue(value);
      setIsEditing(true);
      setFormData({ group_id: value.group_id, value: value.value, code: value.code || '' });
      setIsLoading(false);
    } else {
      Alert.alert('Error', `Value not found: ${valueId}`);
      router.back();
    }
  }, [params.valueId, opGroups, opValues, router]);

  const handleSave = async () => {
    if (!formData.group_id || !formData.value.trim()) {
      Alert.alert('Error', 'Group and value are required');
      return;
    }

    try {
      if (isEditing && editingValue) {
        await updateOpValue(editingValue.id, formData);
        Alert.alert('Success', 'Value updated successfully');
      } else {
        await createOpValue(formData);
        Alert.alert('Success', 'Value created successfully');
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save value');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading value...</Text>
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
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Value' : 'Create Value'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.inputLabel}>Select Group</Text>
          <View style={styles.groupChips}>
            {opGroups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[styles.chip, formData.group_id === group.id && styles.chipSelected]}
                onPress={() => setFormData({ ...formData, group_id: group.id })}
              >
                <Text style={[styles.chipText, formData.group_id === group.id && styles.chipTextSelected]}>
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Value *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter value"
              value={formData.value}
              onChangeText={(text) => setFormData({ ...formData, value: text })}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter code (optional)"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text })}
              placeholderTextColor="#999"
            />
          </View>
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
  groupChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
  },
  chipTextSelected: {
    color: '#fff',
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
});

