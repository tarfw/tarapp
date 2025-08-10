import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';

if (
  !process.env.EXPO_PUBLIC_TURSO_DB_URL ||
  !process.env.EXPO_PUBLIC_TURSO_DB_AUTH_TOKEN
) {
  throw new Error('Turso DB URL and Auth Token must be set in .env.local');
}

export interface Item {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  status: string;
  options: any;
}

export const DB_NAME = 'notes-app-db.db'; // Same Turso db as notes

export const tursoOptions = {
  url: process.env.EXPO_PUBLIC_TURSO_DB_URL,
  authToken: process.env.EXPO_PUBLIC_TURSO_DB_AUTH_TOKEN,
};

interface ItemsContextType {
  items: Item[];
  createItem: (itemData: Partial<Item>) => Promise<Item | undefined>;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  syncItems: () => void;
  toggleSync: (enabled: boolean) => void;
  isSyncing: boolean;
}

const ItemsContext = createContext<ItemsContextType | null>(null);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Item[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [db, fetchItems]);

  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const items = await db.getAllAsync<Item>(
        'SELECT * FROM items ORDER BY name ASC'
      );
      setItems(items);
    } catch (error) {
      console.log('Error fetching items:', error);
      try {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT UNIQUE,
            barcode TEXT,
            status TEXT DEFAULT 'active',
            options JSON NOT NULL
          );`
        );
        const items = await db.getAllAsync<Item>(
          'SELECT * FROM items ORDER BY name ASC'
        );
        setItems(items);
      } catch (createError) {
        console.log('Error creating items table:', createError);
        setItems([]);
      }
    }
  }, [db]);

  const syncItems = useCallback(async () => {
    console.log('Syncing items with Turso DB...');

    try {
      await db.syncLibSQL();
      await fetchItems();
      console.log('Synced items with Turso DB');
    } catch (e) {
      console.log(e);
    }
  }, [db, fetchItems]);

  const toggleSync = useCallback(
    async (enabled: boolean) => {
      setIsSyncing(enabled);
      if (enabled) {
        console.log('Starting items sync interval...');
        await syncItems();
        syncIntervalRef.current = setInterval(syncItems, 2000);
      } else if (syncIntervalRef.current) {
        console.log('Stopping items sync interval...');
        clearInterval(syncIntervalRef.current);
      }
    },
    [syncItems]
  );

  const createItem = async (itemData: Partial<Item>) => {
    const newItem = {
      id: Date.now().toString(),
      name: itemData.name || 'New Item',
      sku: itemData.sku || null,
      barcode: itemData.barcode || null,
      status: itemData.status || 'active',
      options: JSON.stringify(itemData.options || {}),
    };

    try {
      await db.runAsync(
        'INSERT INTO items (id, name, sku, barcode, status, options) VALUES (?, ?, ?, ?, ?, ?)',
        newItem.id,
        newItem.name,
        newItem.sku,
        newItem.barcode,
        newItem.status,
        newItem.options
      );
      await fetchItems();
      return { ...newItem, options: JSON.parse(newItem.options) };
    } catch (e) {
      console.log('Error creating item:', e);
      try {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sku TEXT UNIQUE,
            barcode TEXT,
            status TEXT DEFAULT 'active',
            options JSON NOT NULL
          );`
        );
        await db.runAsync(
          'INSERT INTO items (id, name, sku, barcode, status, options) VALUES (?, ?, ?, ?, ?, ?)',
          newItem.id,
          newItem.name,
          newItem.sku,
          newItem.barcode,
          newItem.status,
          newItem.options
        );
        await fetchItems();
        return { ...newItem, options: JSON.parse(newItem.options) };
      } catch (retryError) {
        console.log('Error on retry:', retryError);
        return undefined;
      }
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const existingItem = await db.getFirstAsync<Item>(
        'SELECT * FROM items WHERE id = ?',
        [id]
      );

      if (!existingItem) return;

      const updatedItem = {
        name: updates.name ?? existingItem.name,
        sku: updates.sku ?? existingItem.sku,
        barcode: updates.barcode ?? existingItem.barcode,
        status: updates.status ?? existingItem.status,
        options: JSON.stringify(updates.options ?? JSON.parse(existingItem.options as string)),
      };

      await db.runAsync(
        'UPDATE items SET name = ?, sku = ?, barcode = ?, status = ?, options = ? WHERE id = ?',
        updatedItem.name,
        updatedItem.sku,
        updatedItem.barcode,
        updatedItem.status,
        updatedItem.options,
        id
      );
      await fetchItems();
    } catch (error) {
      console.log('Error updating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await db.runAsync('DELETE FROM items WHERE id = ?', id);
      await fetchItems();
    } catch (error) {
      console.log('Error deleting item:', error);
    }
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        createItem,
        updateItem,
        deleteItem,
        syncItems,
        toggleSync,
        isSyncing,
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