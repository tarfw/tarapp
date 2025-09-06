import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAI } from '@/contexts/AIContext';

export default function AgentSelectorScreen() {
  const router = useRouter();
  const { selectedAgent, setSelectedAgent } = useAI();
  
  // AI agents data
  const aiAgents = [
    { id: '0', name: 'Space', description: 'General AI assistant for all tasks' },
    { id: '1', name: 'Teams', description: 'AI agent for team management' },
    { id: '2', name: 'Products', description: 'AI agent for product development' },
    { id: '3', name: 'Items', description: 'AI agent for item categorization' },
    { id: '4', name: 'Posts', description: 'AI agent for content creation' },
    { id: '5', name: 'Order', description: 'AI agent for order management' },
  ];

  const handleSelectAgent = (agentName: string) => {
    setSelectedAgent(agentName);
    router.back();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>←</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.screenTitle}>Select Agent</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        {aiAgents.map((agent) => (
          <TouchableOpacity 
            key={agent.id} 
            style={[styles.agentCard, selectedAgent === agent.name && styles.selectedAgentCard]} 
            activeOpacity={0.7}
            onPress={() => handleSelectAgent(agent.name)}
          >
            <View style={styles.agentHeader}>
              <ThemedText style={styles.agentName}>{agent.name}</ThemedText>
              {selectedAgent === agent.name && (
                <View style={styles.selectedBadge}>
                  <ThemedText style={styles.selectedText}>Selected</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.agentDescription}>{agent.description}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButton: {
    fontSize: 24,
    color: Colors.light.tint,
    padding: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  agentCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  selectedAgentCard: {
    borderColor: Colors.light.tint,
    backgroundColor: `${Colors.light.tint}10`,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  agentDescription: {
    color: Colors.light.muted,
    fontSize: 14,
  },
});