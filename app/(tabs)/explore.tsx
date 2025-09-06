import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function ExploreScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.screenTitle}>Explore</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>What's new</ThemedText>
          <ThemedText style={styles.cardMeta}>Latest product updates and tips</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Templates</ThemedText>
          <ThemedText style={styles.cardMeta}>Get started faster with curated templates</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingTop: 16, // Reduced padding since profile button is removed
  },
  headerRow: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardMeta: {
    color: Colors.light.muted,
    fontSize: 14,
  },
});
