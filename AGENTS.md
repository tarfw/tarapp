# Agent Guidelines for TAR App

## Build/Lint/Test Commands
- **Start dev server**: `npm start` or `npx expo start`
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`
- **Lint**: `npm run lint`
- **No testing setup** - add Jest/Testing Library if needed

## Architecture & Codebase Structure

### Tech Stack
- **Frontend**: React Native + Expo
- **Routing**: expo-router (file-based routing)
- **Database**: InstantDB (real-time database)
- **Language**: TypeScript with strict mode
- **Styling**: React Native StyleSheet
- **Auth**: InstantDB magic codes

### Project Structure
```
app/           # Main app screens (expo-router)
├── (tabs)/    # Tab navigation
├── agent/     # CRUD agent screens
└── auth.tsx   # Authentication

agent/         # Reusable agent components
components/    # Shared UI components
lib/           # Utilities and services
  ├── db.ts    # InstantDB client
  └── auth.tsx # Auth helpers

instant.schema.ts  # Database schema definition
instant.perms.ts   # Database permissions
```

### Key Entities (InstantDB)
- **Stores**: Multi-store e-commerce platform
- **Products**: Items for sale with media/images
- **Items**: Product variants (SKU, barcode, pricing)
- **Inventory**: Stock levels by location
- **Orders**: Customer orders with line items
- **Customers**: Customer data with addresses
- **Locations**: Warehouse/store locations
- **Tasks**: Team task management

### Internal APIs
- **InstantDB Client**: `db` from `lib/db.ts`
  - `db.useQuery()` - React hook for data fetching
  - `db.transact()` - Write operations
  - `db.useAuth()` - Authentication state
  - `db.rooms` - Real-time features

## Code Style Guidelines

### Imports
```typescript
// Path aliases
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import db from '../lib/db';

// Group: React/React Native, then third-party, then local
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { id } from '@instantdb/react-native';
import db from '../lib/db';
```

### Types
```typescript
// Define types based on schema
type Item = {
  id: string;
  sku?: string;
  barcode?: string;
  price?: number;
  // ... other optional fields
};
```

### Components
```typescript
// Functional components with hooks
export default function ItemsAgent() {
  const [items, setItems] = useState<Item[]>([]);
  const router = useRouter();

  // InstantDB queries
  const { data, isLoading, error } = db.useQuery({
    items: { $: { where: { product: productId } } }
  });

  // Handle loading/error states
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  // Return JSX
  return (
    <SafeAreaView style={styles.container}>
      {/* Component content */}
    </SafeAreaView>
  );
}
```

### Database Operations
```typescript
// Create
const itemId = id();
db.transact([
  db.tx.items[itemId].create({
    sku: 'NEW-SKU',
    price: 29.99
  })
]);

// Update
db.transact([
  db.tx.items[itemId].update({
    price: 39.99
  })
]);

// Delete
db.transact([
  db.tx.items[itemId].delete()
]);
```

### Error Handling
```typescript
// User-facing errors
const handleSubmit = () => {
  if (!sku.trim()) {
    Alert.alert('Error', 'SKU is required');
    return;
  }
  // ... proceed
};
```

### Naming Conventions
- **Files**: kebab-case (`items-agent.tsx`)
- **Components**: PascalCase (`ItemsAgent`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase (`Item`, `Product`)

### UI Patterns
- **Headers**: Custom headers instead of navigation headers
- **Forms**: Modal overlays with ScrollView
- **Lists**: FlatList with TouchableOpacity items
- **Actions**: Alert.alert for confirmations
- **Loading**: Text indicators or ActivityIndicator
- **Empty states**: Centered text messages

### InstantDB Rules
- Index fields used for filtering/ordering
- Use `where` clauses for queries
- Pagination with `limit`/`offset` on top-level only
- No conditional hooks (rules of hooks)
- Admin operations require admin SDK with tokens
