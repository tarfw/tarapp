# Permissions

Permissions in InstantDB control who can read, write, and modify your data. They provide a flexible, fine-grained access control system.

## Permission Structure

Permissions are defined in `instant.perms.ts`:

```typescript
// instant.perms.ts
import type { InstantRules } from '@instantdb/react-native';

const rules = {
  // Entity-level permissions
  entities: {
    allow: {
      $default: 'false',
    },
    todos: {
      allow: {
        create: 'isAuthenticated()',
        read: 'isAuthenticated()',
        update: 'isOwner()',
        delete: 'isOwner()',
      },
    },
  },
  // Attribute-level permissions
  attrs: {
    allow: {
      $default: 'false',
    },
    allow: {
      email: 'isAuthenticated() == true',
    },
  },
} satisfies InstantRules;

export default rules;
```

## Permission Functions

### User Authentication

```javascript
// Check if user is authenticated
isAuthenticated()

// Check specific user ID
userId() == 'user-id-123'

// Check user email
userEmail() == 'user@example.com'
```

### Ownership

```javascript
// Check if user is the owner of an entity
isOwner()

// Check if the 'ownerId' attribute matches the current user
data.ownerId == userId()
```

### Role-based Access

```javascript
// Check user roles (if stored in user data)
userRoles().includes('admin')
```

## Entity-level Permissions

Control access to entire entities:

```typescript
entities: {
  todos: {
    allow: {
      // Who can create todos
      create: 'isAuthenticated()',
      // Who can read todos
      read: 'isAuthenticated()',
      // Who can update todos
      update: 'data.ownerId == userId()',
      // Who can delete todos
      delete: 'data.ownerId == userId()',
    },
  },
},
```

## Attribute-level Permissions

Control access to specific attributes:

```typescript
attrs: {
  todos: {
    text: {
      allow: {
        create: 'isAuthenticated()',
        read: 'isAuthenticated()',
        update: 'data.ownerId == userId()',
      },
    },
    isPrivate: {
      allow: {
        read: 'data.ownerId == userId()',
        update: 'data.ownerId == userId()',
      },
    },
  },
},
```

## Advanced Permission Patterns

### Time-based Permissions

```javascript
update: 'data.createdAt > (time() - 3600000)' // Only allow updates within 1 hour
```

### Collaborative Permissions

```javascript
// Allow access to todos if user is the owner OR is in the collaborators list
update: 'data.ownerId == userId() || data.collaborators.includes(userId())'
```

### Read Permissions with Filters

```typescript
entities: {
  posts: {
    allow: {
      read: 'data.isPublic == true || data.authorId == userId()',
    },
  },
},
```

## Pushing Permissions

Use the CLI to push permissions to your app:

```bash
npx instant-cli@latest push perms
```

## Default Permissions

By default, if no permissions are defined, Instant allows all operations for authenticated users.

## Conditional Permissions

You can use complex conditions in permissions:

```typescript
update: `
  (data.ownerId == userId()) || 
  (data.collaborators.includes(userId()) && 
   data.permissions.includes('editor'))
`
```

## Troubleshooting Permissions

- Start with permissive permissions during development
- Use the Instant dashboard to test permissions
- Remember that permissions are checked on the server
- Permissions are evaluated as boolean expressions