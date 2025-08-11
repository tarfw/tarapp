# Turso Local-First Items Module

## Overview

The Items module implements a comprehensive product management system using Turso's local-first database architecture. It manages Items, Option Groups, Option Values, and Variants with full offline functionality and automatic cloud synchronization.

## Data Model

### Item
The base product without pricing information:
```typescript
type Item = {
  id: string;
  name: string;
  category: string | null;
  options: string; // JSON string of option value IDs array
};
```

### Option Group (OpGroup)
Defines an option category like Size, Color, Material:
```typescript
type OpGroup = {
  id: string;
  name: string;
  code: string | null;
};
```

### Option Value (OpValue)
Belongs to an Option Group and represents specific values:
```typescript
type OpValue = {
  id: string;
  group_id: string;
  value: string;
  code: string | null;
};
```

### Variant
A sellable product unit with stock, price, and specific options:
```typescript
type Variant = {
  id: string;
  item_id: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  stock: number;
  status: string; // e.g. 'active', 'inactive', 'archived'
  options: string; // JSON string of option value IDs array
};
```

## Database Schema

### Items Table
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  options TEXT DEFAULT '[]'
);
```

### Option Groups Table
```sql
CREATE TABLE op_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT
);
```

### Option Values Table
```sql
CREATE TABLE op_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  value TEXT NOT NULL,
  code TEXT,
  FOREIGN KEY (group_id) REFERENCES op_groups (id) ON DELETE CASCADE
);
```

### Variants Table
```sql
CREATE TABLE variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  sku TEXT,
  barcode TEXT,
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  options TEXT DEFAULT '[]',
  FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);
```

## Local-First Implementation

### Context Provider
The `ItemsProvider` manages all four entity types with full CRUD operations:

```typescript
const {
  items, opGroups, opValues, variants,
  createItem, updateItem, deleteItem,
  createOpGroup, updateOpGroup, deleteOpGroup,
  createOpValue, updateOpValue, deleteOpValue,
  createVariant, updateVariant, deleteVariant,
  syncItems, toggleSync, isSyncing
} = useItems();
```

### Automatic Table Initialization
Tables are created automatically on app startup with proper foreign key relationships:

```typescript
const initializeTables = useCallback(async () => {
  // Creates all four tables with proper relationships
  // Handles foreign key constraints for data integrity
}, [db]);
```

### Sync Operations
Following the same pattern as Notes:

#### Local Operations
```typescript
// Create a new item locally
const newItem = await createItem({
  name: "T-Shirt",
  category: "Clothing",
  options: JSON.stringify([])
});
```

#### Push Sync (Local → Cloud)
```typescript
// Sync all local changes to cloud
await syncItems();
// or use the sync button in UI
```

#### Pull Sync (Cloud → Local)
```typescript
// Pull remote changes and update local data
await syncItems();
// Automatically refreshes all entity lists
```

## Usage Examples

### Creating a Complete Product Setup

1. **Create Option Groups**:
```typescript
const sizeGroup = await createOpGroup({ name: "Size", code: "SIZE" });
const colorGroup = await createOpGroup({ name: "Color", code: "COLOR" });
```

2. **Create Option Values**:
```typescript
const smallSize = await createOpValue({ 
  group_id: sizeGroup.id, 
  value: "Small", 
  code: "S" 
});
const redColor = await createOpValue({ 
  group_id: colorGroup.id, 
  value: "Red", 
  code: "RED" 
});
```

3. **Create Base Item**:
```typescript
const tshirt = await createItem({
  name: "Basic T-Shirt",
  category: "Clothing",
  options: JSON.stringify([sizeGroup.id, colorGroup.id])
});
```

4. **Create Variants**:
```typescript
const redSmallTshirt = await createVariant({
  item_id: tshirt.id,
  sku: "TSHIRT-RED-S",
  barcode: "1234567890123",
  price: 19.99,
  stock: 50,
  status: "active",
  options: JSON.stringify([smallSize.id, redColor.id])
});
```

## Key Features

### Relational Data Management
- Foreign key relationships ensure data integrity
- Cascade deletes prevent orphaned records
- Automatic relationship handling in the context

### Offline-First Experience
- All operations work completely offline
- Local changes are tracked automatically by Turso
- Sync happens when connectivity is restored

### Flexible Option System
- Items can have multiple option groups (Size, Color, Material, etc.)
- Variants combine specific option values
- JSON storage for flexible option combinations

### Inventory Management
- Stock tracking per variant
- SKU and barcode support
- Status management (active/inactive/archived)

## Best Practices

### Option Management
- Create option groups before option values
- Use meaningful codes for easier identification
- Keep option structures consistent across similar items

### Variant Creation
- Always link variants to existing items
- Use descriptive SKUs for easy identification
- Set appropriate stock levels and pricing

### Sync Strategy
- Sync after bulk operations (importing products)
- Use automatic sync for real-time collaboration
- Manual sync for controlled data updates

## Error Handling

The context includes comprehensive error handling:
- Database operation failures are logged
- UI operations continue even if individual operations fail
- Sync errors are handled gracefully with user feedback

## Performance Considerations

### Efficient Queries
- Separate fetch functions for each entity type
- Ordered results for consistent UI display
- Minimal data fetching on context initialization

### Batch Operations
- Multiple independent operations can be performed
- Sync operations handle multiple changes efficiently
- Foreign key relationships maintained automatically

This Items module provides a robust foundation for product management with the same local-first benefits as the Notes module, extended to handle complex relational data structures.