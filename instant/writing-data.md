# Writing Data

In InstantDB, you write data using transactions. Transactions are atomic operations that can create, update, or delete data in your database.

## Basic Transaction

Transactions are performed using the `db.transact` method and the `db.tx` builder:

```javascript
db.transact([
  // Create a new todo
  db.tx.todos[db.newId()].update({
    title: 'Buy milk',
    done: false,
  }),
  
  // Update an existing todo
  db.tx.todos['todo-id-123'].update({
    done: true,
  }),
  
  // Delete a todo
  db.tx.todos['todo-id-456'].delete(),
]);
```

## Creating Entities

To create a new entity, you need to provide an ID and the attributes:

```javascript
// Create with a generated ID
db.transact(
  db.tx.todos[db.newId()].update({
    title: 'My new todo',
    done: false,
  })
);

// Or create with a specific ID
db.transact(
  db.tx.todos['my-custom-id'].update({
    title: 'My new todo',
    done: false,
  })
);
```

## Updating Entities

To update an entity, use the `.update()` method:

```javascript
db.transact(
  db.tx.todos['todo-id'].update({
    title: 'Updated title',
    done: true,
  })
);
```

Note that you must provide all required attributes in an update operation.

## Deleting Entities

To delete an entity:

```javascript
db.transact(
  db.tx.todos['todo-id'].delete()
);
```

## Transaction Functions

Transactions support several functions:

- `.update(attrs)`: Creates or updates attributes
- `.delete()`: Deletes the entity
- `.link(linkName, targetId)`: Creates a link between entities
- `.unlink(linkName, targetId)`: Removes a link between entities

## Linking Entities

To create relationships between entities:

```javascript
// Link a todo to a user
db.transact(
  db.tx.todos['todo-id'].link('author', 'user-id')
);

// Or unlink them
db.transact(
  db.tx.todos['todo-id'].unlink('author', 'user-id')
);
```

## Batch Operations

You can perform multiple operations in a single transaction:

```javascript
db.transact([
  // Create multiple todos
  db.tx.todos[db.newId()].update({ title: 'Todo 1', done: false }),
  db.tx.todos[db.newId()].update({ title: 'Todo 2', done: false }),
  db.tx.todos[db.newId()].update({ title: 'Todo 3', done: true }),
  
  // Update a user's profile
  db.tx.profiles['user-id'].update({ lastSeen: Date.now() }),
]);
```

## Conditional Transactions

Transactions can be conditional using the `when` clause:

```javascript
// Only update if the current value matches expectations
db.transact(
  db.tx.todos['todo-id'].update({
    title: 'New title',
  }).when({
    title: 'Expected current title'
  })
);
```

## Error Handling

Transactions will fail atomically if any part of the transaction is invalid:

```javascript
try {
  await db.transact([
    db.tx.todos[db.newId()].update({ title: 'Todo 1' }),
    db.tx.todos[db.newId()].update({ title: 'Todo 2' }),
  ]);
  console.log('Transaction successful');
} catch (error) {
  console.error('Transaction failed:', error.message);
}
```

## Transaction Best Practices

1. Keep transactions small and focused
2. Group related operations together
3. Handle errors appropriately
4. Use conditional transactions when consistency is critical
5. Consider the order of operations in batch transactions