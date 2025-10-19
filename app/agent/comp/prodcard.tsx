import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import db from '../../../lib/db';

// Types based on schema
type Product = {
  id: string;
  title?: string;
  img?: string;
  items?: {
    id: string;
    sku?: string;
    inventory?: {
      id: string;
      available?: number;
      committed?: number;
      incoming?: number;
    }[];
  }[];
};

type ItemWithQty = {
  id: string;
  sku?: string;
  qty: number; // Total available quantity
  productImage?: string;
};

export default function ProdCard() {
  const { productId } = useLocalSearchParams();
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);

  // Query the specific product
  const { data: productData, isLoading: productLoading } = db.useQuery({
    products: {
      $: { where: { id: productId } },
    }
  });

  // Query inventory data for all items in this product with locations and product image
  const { data: inventoryData } = db.useQuery({
    items: {
      $: { where: { product: productId } },
      product: {}, // Include product data for images
      inventory: {
        locations: {}
      }
    },
    locations: {} // Also query all locations to ensure we have location names
  });

  const product = productData?.products?.[0];

  if (productLoading || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate quantities for each item
  const itemsWithQty: ItemWithQty[] = (inventoryData?.items || []).map((item) => {
    const totalQty = item.inventory?.reduce((sum, inv) => {
      return sum + (inv.available || 0) + (inv.incoming || 0) - (inv.committed || 0);
    }, 0) || 0;

    // Debug logging
    console.log(`Item ${item.sku}:`, {
      inventory: item.inventory,
      totalQty
    });

    return {
      id: item.id,
      sku: item.sku,
      qty: totalQty,
      productImage: item.product?.img
    };
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const getLocationName = (locationId: string) => {
    console.log('Available locations:', inventoryData?.locations);
    const location = inventoryData?.locations?.find(loc => loc.id === locationId);
    console.log('Found location for ID', locationId, ':', location);
    return location?.name || 'Unknown Location';
  };

  const renderItem = ({ item }: { item: ItemWithQty }) => {
    const isExpanded = expandedItemId === item.id;
    const itemInventory = inventoryData?.items?.find(i => i.id === item.id)?.inventory || [];

    return (
      <View>
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.itemLeft}>
            <View style={styles.itemImageContainer}>
              {item.productImage ? (
                <Image
                  source={{ uri: item.productImage }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.itemImagePlaceholderText}>No Image</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemSku}>{item.sku || 'No SKU'}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
            <Text style={styles.itemQty}>{item.qty}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && itemInventory.length > 0 && (
          <View>
            {itemInventory.map((inv: any) => {
              // Debug logging for location data
              console.log('Inventory location data:', inv.locations);

              // Try to get location name from different possible data structures
              let locationName = 'Unknown Location';
              if (inv.locations?.name) {
                locationName = inv.locations.name;
              } else if (inv.locations?.id) {
                locationName = getLocationName(inv.locations.id);
              } else if (Array.isArray(inv.locations) && inv.locations[0]?.name) {
                locationName = inv.locations[0].name;
              }

              return (
                <View key={inv.id} style={styles.locationRow}>
                  <Text style={styles.locationName}>{locationName}</Text>
                  <View style={styles.locationQty}>
                    <Text style={styles.qtyText}>
                      Available: {inv.available || 0}
                    </Text>
                    <Text style={styles.qtyText}>
                      Incoming: {inv.incoming || 0}
                    </Text>
                    <Text style={styles.qtyText}>
                      Committed: {inv.committed || 0}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      </View>

      {/* Top Card */}
      <View style={styles.topCard}>
        <View style={styles.imageContainer}>
          {product.img ? (
            <Image
              source={{ uri: product.img }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.title || 'Untitled Product'}</Text>
        </View>
      </View>

      {/* Items List */}
      {itemsWithQty.length > 0 ? (
        <FlatList
          data={itemsWithQty}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noItemsContainer}>
          <Text style={styles.noItemsText}>No items found</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    height: 50,
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginTop: 8,
  },
  topCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  placeholderText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemsList: {
    marginHorizontal: 8,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  itemImagePlaceholderText: {
    fontSize: 8,
    color: '#6c757d',
    textAlign: 'center',
  },
  itemSku: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  locationQty: {
    alignItems: 'flex-end',
  },
  qtyText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  noItemsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: 8,
  },
  noItemsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
