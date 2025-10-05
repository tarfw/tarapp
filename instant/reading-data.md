# Reading Data

In InstantDB, you read data using queries. Queries are reactive and automatically update when the underlying data changes.

## Basic Query

To read data, use the `db.useQuery` hook (in React) or `db.query` method:

```javascript
// React Native component
import { View, Text, FlatList } from 'react-native';

function TodoList() {
  const { data: todos, isLoading, error } = db.useQuery({ 
    todos: {} 
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```

## Query Structure

Queries follow this structure:

```javascript
{
  namespace: {
    $: { /* query options */ },
    linkedNamespace: { /* nested query for related data */ }
  }
}
```

## Filtering Data

Use the `$` property to add filters, sorting, and other options:

```javascript
// Get all todos that are not done
const { data } = db.useQuery({
  todos: {
    $: {
      where: {
        done: false,
      },
    },
  },
});

// Get todos with more complex conditions
const { data } = db.useQuery({
  todos: {
    $: {
      where: {
        done: false,
        priority: { $in: ['high', 'medium'] },
      },
    },
  },
});
```

## Available Filter Operators

- `$eq`: Equal to (default behavior)
- `$neq`: Not equal to
- `$gt`: Greater than
- `$gte`: Greater than or equal to
- `$lt`: Less than
- `$lte`: Less than or equal to
- `$in`: Value is in the provided array
- `$nin`: Value is not in the provided array

```javascript
// Todos created after a specific date
{
  todos: {
    $: {
      where: {
        createdAt: { $gt: Date.now() - 86400000 }, // last 24 hours
      },
    },
  },
}
```

## Sorting Results

Use the `order` property to sort results:

```javascript
// Order todos by creation date (newest first)
const { data } = db.useQuery({
  todos: {
    $: {
      order: {
        createdAt: 'desc',
      },
    },
  },
});

// Multiple sort criteria
{
  todos: {
    $: {
      order: {
        done: 'asc',
        createdAt: 'desc',
      },
    },
  },
}
```

## Limiting Results

Use `limit` to restrict the number of returned results:

```javascript
// Get only the 10 most recent todos
{
  todos: {
    $: {
      order: { createdAt: 'desc' },
      limit: 10,
    },
  },
}
```

## Querying Related Data

You can query related data by including the linked namespace in your query:

```javascript
// Get todos with their authors
const { data } = db.useQuery({
  todos: {
    author: {}, // This will include author data for each todo
  },
});

// Get authors with their todos
{
  authors: {
    todos: {}, // This will include todos for each author
  },
}
```

## Advanced Query Options

```javascript
{
  todos: {
    $: {
      // Multiple conditions
      where: {
        done: false,
        priority: { $in: ['high', 'medium'] },
        createdAt: { $gte: Date.now() - 7 * 86400000 }, // last week
      },
      // Sort and limit
      order: { createdAt: 'desc' },
      limit: 20,
    },
    // Include related data
    author: {},
  },
}
```

## Server-side Queries

For server-side rendering or non-react contexts:

```javascript
// For server-side rendering or non-React Native contexts
const result = await db.query({ todos: {} });
const { data: todos } = result;
```

## Real-time Updates

Queries automatically update when data changes:

```javascript
// This component will automatically re-render when todos change
function TodoList() {
  const { data: todos } = db.useQuery({ todos: {} });
  
  // The todos array will automatically update when:
  // - new todos are added
  // - existing todos are updated
  // - todos are deleted
  // - links between todos and other entities change
}
```

## Error Handling

```javascript
import { View, Text } from 'react-native';

function TodoList() {
  const { data, isLoading, error } = db.useQuery({ todos: {} });
  
  if (error) {
    // Handle different types of errors
    if (error.status === 403) {
      return <Text>Access denied</Text>;
    }
    return <Text>Error: {error.message}</Text>;
  }
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```