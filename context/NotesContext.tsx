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
export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  modifiedDate: Date | null;
}

export const DB_NAME = 'tar.db'; // Turso db name

export const tursoOptions = {
  url: process.env.EXPO_PUBLIC_TURSO_DB_URL,
  authToken: process.env.EXPO_PUBLIC_TURSO_DB_AUTH_TOKEN,
};

interface NotesContextType {
  notes: Note[];
  createNote: () => Promise<Note | undefined>;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  syncNotes: () => void;
  toggleSync: (enabled: boolean) => void;
  isSyncing: boolean;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Add a small delay to ensure database initialization is complete
    const timer = setTimeout(() => {
      initializeDatabase();
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

  const initializeDatabase = useCallback(async () => {
    try {
      console.log('Initializing tar.db database...');
      
      // Create the notes table with proper schema
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          content TEXT,
          modifiedDate TEXT DEFAULT (datetime('now'))
        );
      `);
      
      console.log('tar.db database initialized successfully');
      await fetchNotes();
    } catch (error) {
      console.error('Error initializing tar.db database:', error);
    }
  }, [db]);

  const fetchNotes = useCallback(async () => {
    try {
      const notes = await db.getAllAsync<Note>(
        'SELECT * FROM notes ORDER BY modifiedDate DESC'
      );
      setNotes(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  }, [db]);

  const syncNotes = useCallback(async () => {
    console.log('Syncing notes with Turso DB...');

    try {
      await db.syncLibSQL();
      await fetchNotes();
      console.log('Synced notes with Turso DB');
    } catch (e) {
      console.log(e);
    }
  }, [db, fetchNotes]);

  const toggleSync = useCallback(
    async (enabled: boolean) => {
      setIsSyncing(enabled);
      if (enabled) {
        console.log('Starting sync interval...');
        await syncNotes(); // Sync immediately when enabled
        syncIntervalRef.current = setInterval(syncNotes, 2000);
      } else if (syncIntervalRef.current) {
        console.log('Stopping sync interval...');
        clearInterval(syncIntervalRef.current);
      }
    },
    [syncNotes]
  );

  const createNote = async () => {
    const newNote = {
      title: '',
      content: '',
      modifiedDate: new Date(),
    };

    try {
      const result = await db.runAsync(
        'INSERT INTO notes (title, content, modifiedDate) VALUES (?, ?, ?)',
        newNote.title,
        newNote.content,
        newNote.modifiedDate.toISOString()
      );
      await fetchNotes();
      return { ...newNote, id: result.lastInsertRowId.toString() };
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const existingNote = await db.getFirstAsync<Note>(
        'SELECT * FROM notes WHERE id = ?',
        [id]
      );

      if (!existingNote) return;

      const updatedNote = {
        title: updates.title ?? existingNote.title,
        content: updates.content ?? existingNote.content,
        modifiedDate: updates.modifiedDate ?? new Date(),
      };

      await db.runAsync(
        'UPDATE notes SET title = ?, content = ?, modifiedDate = ? WHERE id = ?',
        updatedNote.title,
        updatedNote.content,
        updatedNote.modifiedDate.toISOString(),
        id
      );
      await fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };
  const deleteNote = async (id: string) => {
    try {
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        createNote,
        updateNote,
        deleteNote,
        syncNotes,
        toggleSync,
        isSyncing,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
