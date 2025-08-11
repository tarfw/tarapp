import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FileText, Plus, Grid3X3 } from 'lucide-react-native';

export default function WorkspaceScreen() {
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
  ];

  const handleModulePress = (route: string) => {
    router.push(route as any);
  };

  const handleTitlePress = () => {
    router.push('/modules-list');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: true,
          headerTitle: () => (
            <Pressable onPress={handleTitlePress}>
              <Text style={styles.headerTitle}>Workspace</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleTitlePress}>
              <Grid3X3 size={24} color="#007AFF" />
            </Pressable>
          ),
        }}
      />
      <Animated.View entering={FadeIn} style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to your Workspace</Text>
            <Text style={styles.welcomeSubtitle}>
              Choose a module to get started
            </Text>
          </View>

          <View style={styles.modulesGrid}>
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Pressable
                  key={module.id}
                  style={styles.moduleCard}
                  onPress={() => handleModulePress(module.route)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${module.color}15` }]}>
                    <IconComponent size={32} color={module.color} />
                  </View>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Pressable style={styles.quickActionButton}>
              <Plus size={20} color="#007AFF" />
              <Text style={styles.quickActionText}>Create New</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  moduleCard: {
    flex: 1,
    minWidth: 150,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  quickActionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});