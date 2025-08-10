import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DB_NAME, NotesProvider, tursoOptions } from '../context/NotesContext';
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
          // First, ensure the table exists with the correct schema
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="workspace"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="modules-list"
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
      </NotesProvider>
    </SQLiteProvider>
  );
}
