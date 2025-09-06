import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function CreateScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <ThemedText type="title">Create</ThemedText>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput placeholder="Write a concise title" placeholderTextColor={Colors.light.muted} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            placeholder="Add details, context, or steps to reproduce"
            placeholderTextColor={Colors.light.muted}
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
          <ThemedText style={styles.primaryButtonText}>Create task</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  headerRow: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: Colors.light.muted,
    fontSize: 14,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
