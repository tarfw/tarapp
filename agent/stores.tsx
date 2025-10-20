import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { id } from '@instantdb/react-native';
import db from '../lib/db';

// Store type based on schema
type Store = {
  id: string;
  name?: string;
  domain?: string;
  currency?: string;
  timezone?: string;
};

export default function StoresAgent() {
  const user = db.useUser();
  const [stores, setStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

  // Query user's teams first
  const { data: userData } = db.useQuery({
    $users: {
      $: { where: { id: user?.id } },
      teams: {}
    }
  });

  // Query stores linked to teams that the user belongs to
  const { data, isLoading, error } = db.useQuery({
    stores: {
      // Filter stores by teams that the user is part of
      $: { where: { 'teams.$users.id': user?.id } },
      teams: {
        $users: {}
      }
    }
  });

  useEffect(() => {
    if (data?.stores) {
      setStores(data.stores);
    }
  }, [data]);

  const handleCreateStore = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    const userTeams = userData?.$users?.[0]?.teams || [];
    let teamIdToUse;

    if (userTeams.length > 0) {
      // Use existing team
      teamIdToUse = userTeams[0].id;
    } else {
      // Create new team for the user
      teamIdToUse = id();
    }

    const storeId = id();
    const newStore: any = {
      name: name.trim(),
    };

    // Only add optional fields if they have values
    if (domain.trim()) {
      newStore.domain = domain.trim();
    }
    if (currency.trim()) {
      newStore.currency = currency.trim();
    }
    if (timezone.trim()) {
      newStore.timezone = timezone.trim();
    }

    const transactions = [
      db.tx.stores[storeId].create(newStore),
      // Link store to team
      db.tx.stores[storeId].link({ teams: teamIdToUse })
    ];

    // If creating new team, also link user to it
    if (userTeams.length === 0) {
      transactions.push(
        db.tx.teams[teamIdToUse].create({}),
        db.tx.teams[teamIdToUse].link({ $users: user?.id })
      );
    }

    db.transact(transactions);

    resetForm();
    setShowForm(false);
  };

  const handleUpdateStore = () => {
    if (!currentStore || !name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    const updatedStore: any = {
      id: currentStore.id,
      name: name.trim(),
    };

    // Only add optional fields if they have values, otherwise set to null to clear them
    if (domain.trim()) {
      updatedStore.domain = domain.trim();
    } else {
      updatedStore.domain = null;
    }
    if (currency.trim()) {
      updatedStore.currency = currency.trim();
    } else {
      updatedStore.currency = null;
    }
    if (timezone.trim()) {
      updatedStore.timezone = timezone.trim();
    } else {
      updatedStore.timezone = null;
    }

    db.transact([
      db.tx.stores[currentStore.id].update(updatedStore)
    ]);

    resetForm();
    setShowForm(false);
  };

  const showDeleteConfirmation = (id: string) => {
    setStoreToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteStore = () => {
    if (storeToDelete) {
      db.transact([
        db.tx.stores[storeToDelete].delete()
      ]);
      setShowDeleteConfirm(false);
      setStoreToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setStoreToDelete(null);
  };

  const resetForm = () => {
    setName('');
    setDomain('');
    setCurrency('');
    setTimezone('');
    setCurrentStore(null);
    setIsEditing(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const openEditForm = (store: Store) => {
    setCurrentStore(store);
    setName(store.name || '');
    setDomain(store.domain || '');
    setCurrency(store.currency || '');
    setTimezone(store.timezone || '');
    setIsEditing(true);
    setShowForm(true);
  };

  const renderItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => openEditForm(item)}
      onLongPress={() => showDeleteConfirmation(item.id)}
    >
      <View style={styles.storeHeader}>
        <Text style={styles.listItemTitle}>{item.name || 'Unnamed Store'}</Text>
        {item.domain && (
          <Text style={styles.domainText}>{item.domain}</Text>
        )}
      </View>
      {(item.currency || item.timezone) && (
        <View style={styles.storeDetails}>
          {item.currency && <Text style={styles.detailText}>Currency: {item.currency}</Text>}
          {item.timezone && <Text style={styles.detailText}>Timezone: {item.timezone}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading stores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }

  if (showForm) {
    return (
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={closeForm}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>
            {isEditing ? 'Edit Store' : 'Create New Store'}
          </Text>
          <TouchableOpacity
            onPress={isEditing ? handleUpdateStore : handleCreateStore}
          >
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.label}>Store Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter store name"
          />

          <Text style={styles.label}>Domain</Text>
          <TextInput
            style={styles.input}
            value={domain}
            onChangeText={setDomain}
            placeholder="Enter domain"
          />

          <Text style={styles.label}>Currency</Text>
          <TextInput
            style={styles.input}
            value={currency}
            onChangeText={setCurrency}
            placeholder="Enter currency (e.g., USD)"
          />

          <Text style={styles.label}>Timezone</Text>
          <TextInput
            style={styles.input}
            value={timezone}
            onChangeText={setTimezone}
            placeholder="Enter timezone"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stores</Text>
        <TouchableOpacity onPress={openCreateForm}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No stores found</Text>
          </View>
        }
      />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>Confirm to delete?</Text>
            <View style={styles.confirmationActions}>
              <TouchableOpacity onPress={cancelDelete}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteStore}>
                <Text style={styles.deleteText}>Confirm to delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Hide the default header since we have custom header
export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  error: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#e74c3c',
  },
  addText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  confirmationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  confirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  domainText: {
    fontSize: 14,
    color: '#666',
  },
  storeDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContent: {
    padding: 20,
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
