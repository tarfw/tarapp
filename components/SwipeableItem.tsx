import React from 'react';
import { Pressable, StyleSheet, Text, View, LogBox } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
  Layout,
  LinearTransition,
  configureReanimatedLogger,
} from 'react-native-reanimated';
import { Trash2, Package } from 'lucide-react-native';

LogBox.ignoreAllLogs();
configureReanimatedLogger({ strict: false });

interface Item {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  status: string;
  options: any;
}

interface Props {
  item: Item;
  onPress: () => void;
  onDelete: () => void;
}

export function SwipeableItem({ item, onPress, onDelete }: Props) {
  const RightAction = (
    prog: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 60 }],
      };
    });

    return (
      <Pressable
        onPress={() => {
          onDelete();
        }}
      >
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <Trash2 size={24} color="red" />
        </Reanimated.View>
      </Pressable>
    );
  };

  const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;

  return (
    <Reanimated.View
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition}
    >
      <ReanimatedSwipeable
        key={item.id}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}
        overshootRight={false}
        enableContextMenu
        containerStyle={{
          backgroundColor: '#FFFFFF',
        }}
      >
        <Pressable
          onPress={() => {
            onPress();
          }}
          style={styles.swipeable}
        >
          <View style={styles.itemHeader}>
            <View style={styles.iconContainer}>
              <Package size={24} color="#34C759" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.sku && (
                <Text style={styles.itemSku}>SKU: {item.sku}</Text>
              )}
              {item.barcode && (
                <Text style={styles.itemBarcode}>Barcode: {item.barcode}</Text>
              )}
              <Text style={styles.itemStatus}>Status: {item.status}</Text>
            </View>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  swipeable: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rightAction: {
    width: 60,
    height: '100%',
    paddingBottom: 12,
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C75915',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  itemBarcode: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  itemStatus: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});