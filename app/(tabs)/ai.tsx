import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAI } from '@/contexts/AIContext';
import { agentComponents } from '@/components/agents';

export default function AIScreen() {
  const router = useRouter();
  const { selectedAgent } = useAI();
  const AgentComponent = agentComponents[selectedAgent as keyof typeof agentComponents];

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity 
          style={styles.agentSelectorContainer} 
          onPress={() => router.push('/agent-selector')}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.selectedAgentName}>{selectedAgent}</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.agentContainer}>
          {AgentComponent ? (
            <AgentComponent />
          ) : (
            <ThemedText>Agent component not found</ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  agentSelectorContainer: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 20,
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAgentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  agentContainer: {
    width: '100%',
    marginTop: 20,
  },
});
