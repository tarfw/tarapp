import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';

// Item represents the base product without price
export interface Item {
  id: string;
  name: string;
  category: string | null;
  options: string; // JSON string of option value IDs array
}

// Option Group defines an option category (like Size, Color)
export interface OpGroup {
  id: string;
  name: string;
  code: string | null;
}

// Option Value belongs to an Option Group and has a code and value
export interface OpValue {
  id: string;
  group_id: string;
  value: string;
  code: string | null;
}

// Variant is a sellable product unit with stock, price, and options
export interface Variant {
  id: string;
  item_id: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  stock: number;
  status: string; // e.g. 'active', 'inactive', 'archived'
  options: string; // JSON string of option value IDs array
}

interface ItemsContextType {
  items: Item[];
  opGroups: OpGroup[];
  opValues: OpValue[];
  variants: Variant[];
  
  // Item operations
  createItem: (item: Omit<Item, 'id'>) => Promise<Item | undefined>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Option Group operations
  createOpGroup: (group: Omit<OpGroup, 'id'>) => Promise<OpGroup | undefined>;
  updateOpGroup: (id: string, updates: Partial<OpGroup>) => Promise<void>;
  deleteOpGroup: (id: string) => Promise<void>;
  
  // Option Value operations
  createOpValue: (value: Omit<OpValue, 'id'>) => Promise<OpValue | undefined>;
  updateOpValue: (id: string, updates: Partial<OpValue>) => Promise<void>;
  deleteOpValue: (id: string) => Promise<void>;
  
  // Variant operations
  createVariant: (variant: Omit<Variant, 'id'>) => Promise<Variant | undefined>;
  updateVariant: (id: string, updates: Partial<Variant>) => Promise<void>;
  deleteVariant: (id: string) => Promise<void>;
  
  // Sync operations
  syncItems: () => Promise<void>;
  toggleSync: (enabled: boolean) => void;
  isSyncing: boolean;
  
  // Database operations
  resetDatabase: () => Promise<boolean>;
  checkHealth: () => Promise<boolean>;
}

const ItemsContext = createContext<ItemsContextType | null>(null);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Item[]>([]);
  const [opGroups, setOpGroups] = useState<OpGroup[]>([]);
  const [opValues, setOpValues] = useState<OpValue[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeTables();
      fetchAllData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [db]);

  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const initializeTables = useCallback(async () => {
    try {
      // Create Items table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT,
          options TEXT DEFAULT '[]'
        );
      `);

      // Create Option Groups table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS op_groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          code TEXT
        );
      `);

      // Create Option Values table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS op_values (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id INTEGER NOT NULL,
          value TEXT NOT NULL,
          code TEXT,
          FOREIGN KEY (group_id) REFERENCES op_groups (id) ON DELETE CASCADE
        );
      `);

      // Create Variants table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS variants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          sku TEXT,
          barcode TEXT,
          price REAL NOT NULL DEFAULT 0,
          stock INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          options TEXT DEFAULT '[]',
          FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
        );
      `);

      console.log('Items tables initialized successfully');
      
      // Verify tables were created
      const tables = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Available tables:', tables.map(t => t.name));
    } catch (error) {
      console.error('Error initializing items tables:', error);
    }
  }, [db]);

  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchItems(),
        fetchOpGroups(),
        fetchOpValues(),
        fetchVariants(),
      ]);
    } catch (error) {
      console.error('Error fetching items data:', error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const items = await db.getAllAsync<Item>('SELECT * FROM items ORDER BY name');
      setItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  }, [db]);

  const fetchOpGroups = useCallback(async () => {
    try {
      const groups = await db.getAllAsync<OpGroup>('SELECT * FROM op_groups ORDER BY name');
      setOpGroups(groups);
    } catch (error) {
      console.error('Error fetching option groups:', error);
      setOpGroups([]);
    }
  }, [db]);

  const fetchOpValues = useCallback(async () => {
    try {
      const values = await db.getAllAsync<OpValue>('SELECT * FROM op_values ORDER BY group_id, value');
      setOpValues(values);
    } catch (error) {
      console.error('Error fetching option values:', error);
      setOpValues([]);
    }
  }, [db]);

  const fetchVariants = useCallback(async () => {
    try {
      const variants = await db.getAllAsync<Variant>('SELECT * FROM variants ORDER BY item_id, sku');
      setVariants(variants);
    } catch (error) {
      console.error('Error fetching variants:', error);
      setVariants([]);
    }
  }, [db]);

  // Item operations
  const createItem = useCallback(async (item: Omit<Item, 'id'>) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO items (name, category, options) VALUES (?, ?, ?)',
        item.name,
        item.category,
        item.options
      );
      await fetchItems();
      return { ...item, id: result.lastInsertRowId.toString() };
    } catch (error) {
      console.error('Error creating item:', error);
    }
  }, [db, fetchItems]);

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    try {
      const existingItem = await db.getFirstAsync<Item>('SELECT * FROM items WHERE id = ?', [id]);
      if (!existingItem) return;

      const updatedItem = {
        name: updates.name ?? existingItem.name,
        category: updates.category ?? existingItem.category,
        options: updates.options ?? existingItem.options,
      };

      await db.runAsync(
        'UPDATE items SET name = ?, category = ?, options = ? WHERE id = ?',
        updatedItem.name,
        updatedItem.category,
        updatedItem.options,
        id
      );
      await fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }, [db, fetchItems]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }, [db, fetchItems]);

  // Option Group operations
  const createOpGroup = useCallback(async (group: Omit<OpGroup, 'id'>) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO op_groups (name, code) VALUES (?, ?)',
        group.name,
        group.code
      );
      await fetchOpGroups();
      return { ...group, id: result.lastInsertRowId.toString() };
    } catch (error) {
      console.error('Error creating option group:', error);
    }
  }, [db, fetchOpGroups]);

  const updateOpGroup = useCallback(async (id: string, updates: Partial<OpGroup>) => {
    try {
      const existingGroup = await db.getFirstAsync<OpGroup>('SELECT * FROM op_groups WHERE id = ?', [id]);
      if (!existingGroup) return;

      const updatedGroup = {
        name: updates.name ?? existingGroup.name,
        code: updates.code ?? existingGroup.code,
      };

      await db.runAsync(
        'UPDATE op_groups SET name = ?, code = ? WHERE id = ?',
        updatedGroup.name,
        updatedGroup.code,
        id
      );
      await fetchOpGroups();
    } catch (error) {
      console.error('Error updating option group:', error);
    }
  }, [db, fetchOpGroups]);

  const deleteOpGroup = useCallback(async (id: string) => {
    try {
      await db.runAsync('DELETE FROM op_groups WHERE id = ?', [id]);
      await fetchOpGroups();
    } catch (error) {
      console.error('Error deleting option group:', error);
    }
  }, [db, fetchOpGroups]);

  // Option Value operations
  const createOpValue = useCallback(async (value: Omit<OpValue, 'id'>) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO op_values (group_id, value, code) VALUES (?, ?, ?)',
        value.group_id,
        value.value,
        value.code
      );
      await fetchOpValues();
      return { ...value, id: result.lastInsertRowId.toString() };
    } catch (error) {
      console.error('Error creating option value:', error);
    }
  }, [db, fetchOpValues]);

  const updateOpValue = useCallback(async (id: string, updates: Partial<OpValue>) => {
    try {
      const existingValue = await db.getFirstAsync<OpValue>('SELECT * FROM op_values WHERE id = ?', [id]);
      if (!existingValue) return;

      const updatedValue = {
        group_id: updates.group_id ?? existingValue.group_id,
        value: updates.value ?? existingValue.value,
        code: updates.code ?? existingValue.code,
      };

      await db.runAsync(
        'UPDATE op_values SET group_id = ?, value = ?, code = ? WHERE id = ?',
        updatedValue.group_id,
        updatedValue.value,
        updatedValue.code,
        id
      );
      await fetchOpValues();
    } catch (error) {
      console.error('Error updating option value:', error);
    }
  }, [db, fetchOpValues]);

  const deleteOpValue = useCallback(async (id: string) => {
    try {
      await db.runAsync('DELETE FROM op_values WHERE id = ?', [id]);
      await fetchOpValues();
    } catch (error) {
      console.error('Error deleting option value:', error);
    }
  }, [db, fetchOpValues]);

  // Variant operations
  const createVariant = useCallback(async (variant: Omit<Variant, 'id'>) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO variants (item_id, sku, barcode, price, stock, status, options) VALUES (?, ?, ?, ?, ?, ?, ?)',
        variant.item_id,
        variant.sku,
        variant.barcode,
        variant.price,
        variant.stock,
        variant.status,
        variant.options
      );
      await fetchVariants();
      return { ...variant, id: result.lastInsertRowId.toString() };
    } catch (error) {
      console.error('Error creating variant:', error);
    }
  }, [db, fetchVariants]);

  const updateVariant = useCallback(async (id: string, updates: Partial<Variant>) => {
    try {
      const existingVariant = await db.getFirstAsync<Variant>('SELECT * FROM variants WHERE id = ?', [id]);
      if (!existingVariant) return;

      const updatedVariant = {
        item_id: updates.item_id ?? existingVariant.item_id,
        sku: updates.sku ?? existingVariant.sku,
        barcode: updates.barcode ?? existingVariant.barcode,
        price: updates.price ?? existingVariant.price,
        stock: updates.stock ?? existingVariant.stock,
        status: updates.status ?? existingVariant.status,
        options: updates.options ?? existingVariant.options,
      };

      await db.runAsync(
        'UPDATE variants SET item_id = ?, sku = ?, barcode = ?, price = ?, stock = ?, status = ?, options = ? WHERE id = ?',
        updatedVariant.item_id,
        updatedVariant.sku,
        updatedVariant.barcode,
        updatedVariant.price,
        updatedVariant.stock,
        updatedVariant.status,
        updatedVariant.options,
        id
      );
      await fetchVariants();
    } catch (error) {
      console.error('Error updating variant:', error);
    }
  }, [db, fetchVariants]);

  const deleteVariant = useCallback(async (id: string) => {
    try {
      await db.runAsync('DELETE FROM variants WHERE id = ?', [id]);
      await fetchVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  }, [db, fetchVariants]);

  // Sync operations
  const syncItems = useCallback(async () => {
    console.log('Syncing items with Turso DB...');
    try {
      await db.syncLibSQL();
      await fetchAllData();
      console.log('Synced items with Turso DB');
    } catch (error) {
      console.error('Error syncing items:', error);
    }
  }, [db, fetchAllData]);

  const toggleSync = useCallback(async (enabled: boolean) => {
    setIsSyncing(enabled);
    if (enabled) {
      console.log('Starting items sync interval...');
      await syncItems();
      syncIntervalRef.current = setInterval(syncItems, 2000);
    } else if (syncIntervalRef.current) {
      console.log('Stopping items sync interval...');
      clearInterval(syncIntervalRef.current);
    }
  }, [syncItems]);

  // Database operations
  const resetDatabase = useCallback(async () => {
    try {
      await db.execAsync('DROP TABLE IF EXISTS variants');
      await db.execAsync('DROP TABLE IF EXISTS op_values');
      await db.execAsync('DROP TABLE IF EXISTS op_groups');
      await db.execAsync('DROP TABLE IF EXISTS items');
      
      await initializeTables();
      await fetchAllData();
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      return false;
    }
  }, [db, initializeTables, fetchAllData]);

  const checkHealth = useCallback(async () => {
    try {
      const tables = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'");
      const requiredTables = ['items', 'op_groups', 'op_values', 'variants'];
      const existingTables = tables.map((t: any) => t.name);
      
      return requiredTables.every(table => existingTables.includes(table));
    } catch (error) {
      console.error('Error checking database health:', error);
      return false;
    }
  }, [db]);

  return (
    <ItemsContext.Provider
      value={{
        items,
        opGroups,
        opValues,
        variants,
        createItem,
        updateItem,
        deleteItem,
        createOpGroup,
        updateOpGroup,
        deleteOpGroup,
        createOpValue,
        updateOpValue,
        deleteOpValue,
        createVariant,
        updateVariant,
        deleteVariant,
        syncItems,
        toggleSync,
        isSyncing,
        resetDatabase,
        checkHealth,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}