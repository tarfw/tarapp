import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { id } from '@instantdb/react-native';
import db from '../lib/db';

// Product type based on schema
type Product = {
  id: string;
  img?: string;
  medias?: string;
  notes?: string;
  status?: string;
  title?: string;
  type?: string;
  vendor?: string;
  items?: {
    id: string;
    sku?: string;
    barcode?: string;
    price?: number;
  }[];
};

export default function ProductsAgent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [img, setImg] = useState('');
  const [medias, setMedias] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Query products from the database with their items
  const { data, isLoading, error } = db.useQuery({ 
    products: {
      items: {},
    }
  });

  useEffect(() => {
    if (data?.products) {
      setProducts(data.products);
    }
  }, [data]);

  const handleCreateProduct = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const newProduct = {
      title: title.trim(),
      vendor: vendor.trim(),
      type: type.trim(),
      status: status.trim(),
      notes: notes.trim(),
      img: img.trim(),
      medias: medias.trim(),
    };

    db.transact([
      db.tx.products[id()].create(newProduct)
    ]);

    resetForm();
    setShowForm(false);
  };

  const handleUpdateProduct = () => {
    if (!currentProduct || !title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const updatedProduct = {
      id: currentProduct.id,
      title: title.trim(),
      vendor: vendor.trim(),
      type: type.trim(),
      status: status.trim(),
      notes: notes.trim(),
      img: img.trim(),
      medias: medias.trim(),
    };

    db.transact([
      db.tx.products[currentProduct.id].update(updatedProduct)
    ]);

    resetForm();
    setShowForm(false);
  };

  const showDeleteConfirmation = (id: string) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      db.transact([
        db.tx.products[productToDelete].delete()
      ]);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const resetForm = () => {
    setTitle('');
    setVendor('');
    setType('');
    setStatus('');
    setNotes('');
    setImg('');
    setMedias('');
    setCurrentProduct(null);
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

  const openEditForm = (product: Product) => {
    setCurrentProduct(product);
    setTitle(product.title || '');
    setVendor(product.vendor || '');
    setType(product.type || '');
    setStatus(product.status || '');
    setNotes(product.notes || '');
    setImg(product.img || '');
    setMedias(product.medias || '');
    setIsEditing(true);
    setShowForm(true);
  };

  const navigateToItems = (productId: string) => {
    router.push(`/agent/items?productId=${productId}`);
  };

  const navigateToProdCard = (productId: string) => {
    router.push(`/agent/comp/prodcard?productId=${productId}`);
  };

  const renderItem = ({ item }: { item: Product }) => (
  <TouchableOpacity
  style={styles.listItem}
  onPress={() => openEditForm(item)}
  onLongPress={() => showDeleteConfirmation(item.id)}
  >
  <View style={styles.productHeader}>
  <Text style={styles.listItemTitle}>{item.title || 'Untitled Product'}</Text>
  <View style={styles.rightSection}>
  <TouchableOpacity
    onPress={() => navigateToItems(item.id)}
      style={styles.itemsCountContainer}
  >
      <Text style={styles.itemsCount}>
          {item.items?.length || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateToProdCard(item.id)}
            style={styles.arrowContainer}
          >
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
  </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading products...</Text>
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
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </Text>
          <TouchableOpacity
            onPress={isEditing ? handleUpdateProduct : handleCreateProduct}
          >
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter product title"
          />

          <Text style={styles.label}>Vendor</Text>
          <TextInput
            style={styles.input}
            value={vendor}
            onChangeText={setVendor}
            placeholder="Enter vendor name"
          />

          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="Enter product type"
          />

          <Text style={styles.label}>Status</Text>
          <TextInput
            style={styles.input}
            value={status}
            onChangeText={setStatus}
            placeholder="Enter product status"
          />

          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={img}
            onChangeText={setImg}
            placeholder="Enter image URL"
          />

          <Text style={styles.label}>Media URL</Text>
          <TextInput
            style={styles.input}
            value={medias}
            onChangeText={setMedias}
            placeholder="Enter media URL"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter product notes"
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Products</Text>
          <TouchableOpacity onPress={openCreateForm}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>Confirm to delete?</Text>
            <View style={styles.confirmationActions}>
              <TouchableOpacity onPress={cancelDelete}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteProduct}>
                <Text style={styles.deleteText}>Confirm to delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemsCountContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    minHeight: 36,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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