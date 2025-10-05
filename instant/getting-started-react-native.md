# Getting Started with React Native

InstantDB works seamlessly with React Native and Expo to build collaborative mobile apps. In this guide, we'll build a simple todo app for iOS and Android.

## Setup

First, create a new Expo app:

```bash
npx create-expo-app instant-rn-demo
cd instant-rn-demo
```

## Install Dependencies

Install InstantDB for React Native and required peer dependencies:

```bash
npm install @instantdb/react-native
npm install @react-native-async-storage/async-storage @react-native-community/netinfo react-native-get-random-values
```

For Expo projects, you might also need:
```bash
npx expo install react-native-get-random-values
```

## Create your app

Go to [instantdb.com/dash](https://instantdb.com/dash) and create a new app. You'll get an app ID that looks something like this: `00000000-0000-0000-0000-000000000000`.

## Configure your app

Add your app ID to your `.env` file:

```bash
EXPO_PUBLIC_INSTANT_APP_ID=00000000-0000-0000-0000-000000000000
```

## Initialize Instant for React Native

Create a new file `lib/db.ts` and initialize Instant for React Native:

```typescript
// lib/db.ts
import { init } from '@instantdb/react-native';

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID!;

const db = init({ appId: APP_ID });

export default db;
```

## Add a schema (Optional for now)

Create a schema file `instant.schema.ts`:

```typescript
// instant.schema.ts
import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    todos: i.entity({
      title: i.string(),
      done: i.boolean(),
      'user-id': i.string(),
    }),
  },
});

// This helps Typescript display better intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
```

Then update your `lib/db.ts` to include the schema:

```typescript
// lib/db.ts
import { init } from '@instantdb/react-native';
import schema from '../instant.schema';

const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID!,
  schema,
});

export default db;
```

## Update your main component

Replace the contents of your main component (e.g., `app/(tabs)/index.tsx` or `App.tsx`) with this code:

```tsx
// App.tsx or app/(tabs)/index.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import db from '../lib/db';

export default function HomeScreen() {
  const [newTodo, setNewTodo] = useState('');

  // Get all todos
  const { data: todos, isLoading } = db.useQuery({ todos: {} });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    db.transact(
      db.tx.todos[db.newId()].update({
        title: newTodo,
        done: false,
        'user-id': db.auth.user?.id,
      })
    );
    setNewTodo('');
  };

  const toggleTodo = (id: string, currentStatus: boolean) => {
    db.transact(
      db.tx.todos[id].update({
        done: !currentStatus,
      })
    );
  };

  const deleteTodo = (id: string) => {
    db.transact(db.tx.todos[id].delete());
  };

  const renderTodo = ({ item }: { item: any }) => (
    <View style={styles.todoItem}>
      <View style={styles.todoContent}>
        <Text style={[styles.todoText, item.done && styles.todoTextDone]}>
          {item.title}
        </Text>
      </View>
      <View style={styles.todoActions}>
        <Switch
          value={item.done}
          onValueChange={() => toggleTodo(item.id, item.done)}
        />
        <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Todos</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          value={newTodo}
          onChangeText={setNewTodo}
          style={styles.input}
          placeholder="What needs to be done?"
        />
        <Button title="Add" onPress={addTodo} />
      </View>

      <FlatList
        data={todos?.todos || []}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 8,
    borderRadius: 4,
  },
  list: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 16,
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#ff6b6b',
  },
});
```

## Running on Mobile

To run the app on your mobile device:

1. Install the Expo Go app on your iOS or Android device
2. Run the application from your terminal:
```bash
npx expo start
```
3. Scan the QR code displayed in your terminal with your mobile device

## Platform-Specific Configuration

For Android (if needed):
- You may need to configure the WebSocket URI in development
- Some users need to add network security config for Android

For iOS:
- No additional configuration needed

## Next Steps

Now that you have a working React Native todo app with real-time collaboration, you can explore:

- [Modeling data](./modeling-data.md) - Learn how to design your data schema
- [Reading data](./reading-data.md) - Understand how to query your data
- [Writing data](./writing-data.md) - Learn more about transactions
- [Authentication](./auth.md) - Add user accounts to your app
- [Permissions](./permissions.md) - Secure your application

Your todo app will automatically sync across all connected clients in real-time. You can test it by running the app on multiple devices or simulators to see the collaboration in action.