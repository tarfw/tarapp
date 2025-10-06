import { useState } from 'react';
import { Text, View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import db from '../../lib/db';

import OrdersAgent from '../../agent/orders';
import ProductsAgent from '../../agent/products';
import InventoryAgent from '../../agent/inventory';
import CollectionsAgent from '../../agent/collections';

export default function AgentsScreen() {
  const user = db.useUser();
  const [agentSelectorVisible, setAgentSelectorVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Agent options with emojis and corresponding components
  const agents = [
    { id: 'orders', emoji: '🛒', name: 'Orders', component: <OrdersAgent /> },
    { id: 'products', emoji: '🛍️', name: 'Products', component: <ProductsAgent /> },
    { id: 'inventory', emoji: '📦', name: 'Inventory', component: <InventoryAgent /> },
    { id: 'collections', emoji: '🎈', name: 'Collections', component: <CollectionsAgent /> },
  ];

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setAgentSelectorVisible(false);
  };

  const renderAgentItem = ({ item }: { item: { id: string; emoji: string; name: string } }) => (
    <TouchableOpacity
      style={styles.agentItem}
      onPress={() => handleSelectAgent(item.id)}
    >
      <Text style={styles.agentItemEmoji}>{item.emoji}</Text>
      <Text style={styles.agentItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerRight: () => (
            <Text style={{ fontSize: 12, marginRight: 10 }}>
              {user?.email || 'Guest'}
            </Text>
          ) 
        }} 
      />
      
      {/* Agent Selector Bar */}
      <View style={styles.agentSelector}>
        <TouchableOpacity
          style={styles.agentSelectorContainer}
          onPress={() => setAgentSelectorVisible(true)}
        >
          {selectedAgent ? (
            <Text style={styles.agentSelectorEmoji}>
              {agents.find(agent => agent.id === selectedAgent)?.emoji || '🤖'}
            </Text>
          ) : (
            <Text style={styles.agentSelectorText}>Agents</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Render selected agent component or default content */}
      <View style={styles.content}>
        {selectedAgentData ? selectedAgentData.component : (
          <View style={styles.defaultContent}>
            <Text style={styles.defaultText}>Select an agent to begin</Text>
          </View>
        )}
      </View>

      {/* Full-screen agent selection modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={agentSelectorVisible}
        onRequestClose={() => setAgentSelectorVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Agent</Text>
            <TouchableOpacity
              onPress={() => setAgentSelectorVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={agents}
            renderItem={renderAgentItem}
            keyExtractor={(item) => item.id}
            style={styles.agentList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  agentSelector: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  agentSelectorContainer: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  agentSelectorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  agentSelectorEmoji: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  defaultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  defaultText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  agentList: {
    flex: 1,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  agentItemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  agentItemText: {
    fontSize: 16,
    color: '#333',
  },
});