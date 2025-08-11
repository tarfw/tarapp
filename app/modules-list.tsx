import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FileText, Package, ChevronRight, X } from 'lucide-react-native';

export default function ModulesListScreen() {
  const router = useRouter();

  const modules = [
    {
      id: 'notes',
      title: 'Notes',
      description: 'Create and manage your notes',
      icon: FileText,
      color: '#007AFF',
      route: '/notes',
    },
    {
      id: 'items',
      title: 'Items',
      description: 'Manage products, variants, and options',
      icon: Package,
      color: '#34C759',
      route: '/items',
    },
  ];

  const handleModulePress = (route: string) => {
    router.push(route as any);
  };

  const handleClose = () => {
    router.back();
  };

  const renderModule = ({ item }: { item: typeof modules[0] }) => {
    const IconComponent = item.icon;
    
    return (
      <Pressable
        style={styles.moduleItem}
        onPress={() => handleModulePress(item.route)}
      >
        <View style={styles.moduleContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
            <IconComponent size={24} color={item.color} />
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>{item.title}</Text>
            <Text style={styles.moduleDescription}>{item.description}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#C7C7CC" />
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Modules',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
          headerLeft: () => (
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#007AFF" />
            </Pressable>
          ),
          presentation: 'fullScreenModal',
        }}
      />
      <Animated.View entering={FadeIn} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Modules</Text>
          <Text style={styles.headerSubtitle}>
            Select a module to access its features
          </Text>
        </View>

        <FlatList
          data={modules}
          renderItem={renderModule}
          keyExtractor={(item) => item.id}
          style={styles.modulesList}
          contentContainerStyle={styles.modulesContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  modulesList: {
    flex: 1,
  },
  modulesContent: {
    paddingHorizontal: 20,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  moduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});