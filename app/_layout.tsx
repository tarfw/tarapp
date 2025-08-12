import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DB_NAME, NotesProvider, tursoOptions } from '../context/NotesContext';
import { ItemsProvider } from '../context/ItemsContext';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SQLiteProvider
      databaseName={DB_NAME}
      options={{
        libSQLOptions: {
          url: tursoOptions.url,
          authToken: tursoOptions.authToken,
        },
      }}
      onInit={async (db: SQLiteDatabase) => {
        console.log('Database initialization started...');
        
        try {
          // First, ensure the tables exist with the correct schema
          console.log('Creating/ensuring notes table exists...');
          await db.execAsync(
            `CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY NOT NULL, title TEXT, content TEXT, modifiedDate TEXT);`
          );
          
          // Always ensure modifiedDate column exists
          try {
            console.log('Checking if modifiedDate column exists...');
            const tableInfo = await db.getAllAsync('PRAGMA table_info(notes)');
            const hasModifiedDate = tableInfo.some((col: any) => col.name === 'modifiedDate');
            
            if (!hasModifiedDate) {
              console.log('Adding missing modifiedDate column...');
              await db.execAsync(`ALTER TABLE notes ADD COLUMN modifiedDate TEXT DEFAULT datetime('now')`);
              console.log('Successfully added modifiedDate column');
            } else {
              console.log('modifiedDate column already exists');
            }
            
            // Log final schema
            const finalTableInfo = await db.getAllAsync('PRAGMA table_info(notes)');
            console.log('Final notes table schema:', finalTableInfo);
            
          } catch (columnError) {
            console.log('Error checking/adding modifiedDate column:', columnError);
          }

          // Initialize Items tables
          try {
            console.log('Creating items tables...');
            
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
                status INTEGER NOT NULL DEFAULT 1,
                options TEXT DEFAULT '[]',
                FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
              );
            `);

            console.log('Items tables created successfully');
          } catch (itemsError) {
            console.log('Error creating items tables:', itemsError);
          }

          // Set database version
          await db.execAsync(`PRAGMA user_version = 2`);
          console.log('Database initialization completed successfully');

          // Sync with libSQL after local setup is complete
          try {
            console.log('Starting libSQL sync...');
            await db.syncLibSQL();
            console.log('libSQL sync completed');
          } catch (syncError) {
            console.log('Error syncing with libSQL (this is often normal):', syncError);
          }

        } catch (error) {
          console.log('Error during database initialization:', error);
        }
      }}
    >
      <NotesProvider>
        <ItemsProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
              gestureEnabled: false,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="agents-list"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="notes"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="items"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="note/[id]"
              options={{
                headerShown: true,
              }}
            />

          </Stack>
          <StatusBar barStyle={'dark-content'} />
          </GestureHandlerRootView>
        </ItemsProvider>
      </NotesProvider>
    </SQLiteProvider>
  );
}
