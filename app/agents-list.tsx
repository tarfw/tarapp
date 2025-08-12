import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function AgentsListScreen() {
  const router = useRouter();

  const agents = [
    {
      id: 'notes',
      title: 'Notes',
      emoji: '📮',
      route: '/notes',
    },
    {
      id: 'items',
      title: 'Items',
      emoji: '📦',
      route: '/items',
    },
  ];

  const handleAgentPress = (route: string) => {
    router.push(route as any);
  };

  const handleClose = () => {
    router.back();
  };

  const renderAgent = ({ item, index }: { item: typeof agents[0]; index: number }) => {
    return (
      <View>
        <Pressable
          style={styles.agentItem}
          onPress={() => handleAgentPress(item.route)}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.agentTitle}>{item.title}</Text>
        </Pressable>
        {index < agents.length - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Agents',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
          headerLeft: () => (
            <Pressable onPress={handleClose} style={styles.backButton}>
              <ArrowLeft size={24} color="#007AFF" />
            </Pressable>
          ),
          headerShadowVisible: false,
          headerStyle: {
            borderBottomWidth: 0.5,
            borderBottomColor: '#E5E5E7',
          },
          presentation: 'modal',
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={agents}
          renderItem={({ item, index }) => renderAgent({ item, index })}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  agentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E5E7',
    marginLeft: 56,
  },
});