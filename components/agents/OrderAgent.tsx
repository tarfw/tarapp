import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function OrderAgent() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Order Agent</ThemedText>
      <ThemedText style={styles.description}>
        AI agent for order management
      </ThemedText>
      {/* Add Order-specific UI components here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
});