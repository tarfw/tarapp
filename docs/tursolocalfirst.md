# Turso Local-First Database Architecture

## Overview

Turso implements a local-first database architecture using embedded replicas that provide offline functionality with automatic cloud synchronization. This document explains how the sync process works in our notes application.

## How Turso Local-First Works

### Embedded Replicas (Local Database)

- **Local SQLite Database**: Each client maintains a local SQLite database that works completely offline
- **Automatic Change Tracking**: The local database maintains a transaction log of all changes (inserts, updates, deletes) since the last sync
- **No Manual Tracking Required**: Developers don't need to manually track what changed - Turso handles this automatically

### Sync Preparation

Turso's local database automatically prepares for cloud syncs by:

1. **Transaction Logging**: Every local operation is logged with metadata for sync purposes
2. **Change Detection**: The system knows exactly what has changed since the last sync
3. **Conflict Preparation**: Changes are prepared with conflict resolution metadata
4. **Offline Queue**: Changes are queued locally until a sync operation is triggered

## Our Implementation Flow

### 1. Local Operations (Save to Local DB)
```javascript
// When user presses "Save" button in note editor
const handleSave = async () => {
  await updateNote(id, { title: note.title, content: note.content });
  // This saves to local Turso replica and is automatically tracked for sync
};
```

### 2. Push Sync (Local → Cloud)
```javascript
// When user presses "Push" button on home screen
<Button title="Push" onPress={() => db.syncLibSQL()} />
```
- Sends all pending local changes to the cloud database
- Turso automatically determines what needs to be synced
- Handles conflict resolution if needed

### 3. Pull Sync (Cloud → Local)
```javascript
// When user presses "Pull" button on home screen
<Button title="Pull" onPress={() => syncNotes()} />
```
- Fetches remote changes from the cloud database
- Merges changes into the local replica
- Updates the local UI with new data

## Key Benefits

### Automatic Sync Preparation
- **No Manual Change Tracking**: Turso automatically tracks all local changes
- **Efficient Sync**: Only changed data is synchronized, not entire datasets
- **Conflict Resolution**: Built-in algorithms handle conflicts when multiple clients modify the same data

### Offline-First Experience
- **Full Offline Functionality**: App works completely without internet connection
- **Seamless Sync**: When connection is restored, sync happens transparently
- **Data Integrity**: Local changes are never lost, even during network issues

### Developer Experience
- **Simple API**: Just call `db.syncLibSQL()` to sync - no complex sync logic needed
- **Automatic Batching**: Multiple changes are batched efficiently for sync
- **Error Handling**: Turso handles network errors and retry logic

## Sync States in Our App

### Local State
- User edits notes in the editor
- Changes are held in component state until "Save" is pressed
- Save button writes to local Turso replica

### Pending Sync State
- Local changes are automatically tracked by Turso
- Changes wait in the local transaction log
- Ready to be pushed to cloud when user triggers sync

### Synced State
- After successful push/pull operations
- Local and cloud databases are in sync
- Transaction log is cleared for synced changes

## Best Practices

### When to Sync
- **Push**: After making significant local changes that should be backed up
- **Pull**: When starting the app or when expecting updates from other devices
- **Automatic**: Consider implementing periodic background sync for better UX

### Error Handling
- Sync operations can fail due to network issues
- Turso provides error information for proper user feedback
- Failed syncs can be retried - local changes remain safe

### Conflict Resolution
- Turso uses last-writer-wins by default
- More sophisticated conflict resolution can be implemented if needed
- Consider app-specific conflict resolution strategies for critical data

## Technical Implementation

### Database Setup
```javascript
// SQLite provider with Turso configuration
<SQLiteProvider
  databaseName={DB_NAME}
  options={{
    libSQLOptions: {
      url: tursoOptions.url,
      authToken: tursoOptions.authToken,
    },
  }}
>
```

### Sync Operations
```javascript
// Push local changes to cloud
await db.syncLibSQL();

// Pull and merge remote changes
await db.syncLibSQL();
await fetchNotes(); // Refresh local UI
```

## Conclusion

Turso's local-first architecture provides a robust foundation for offline-capable applications. The automatic change tracking and sync preparation means developers can focus on application logic rather than complex synchronization code. The clear separation between local saves and cloud sync gives users control over their data while maintaining a seamless experience.