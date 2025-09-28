// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    "$files": i.entity({
      "path": i.string().unique().indexed(),
      "url": i.string().optional(),
    }),
    "$users": i.entity({
      "email": i.string().unique().indexed().optional(),
    }),
    "collections": i.entity({
      "createdAt": i.date(),
      "description": i.string().optional(),
      "handle": i.string().unique(),
      "publishedAt": i.date().indexed().optional(),
      "seoDescription": i.string().optional(),
      "seoTitle": i.string().optional(),
      "sortOrder": i.string(),
      "title": i.string(),
      "updatedAt": i.date(),
    }),
    "customers": i.entity({
      "acceptsMarketing": i.boolean(),
      "createdAt": i.date().indexed(),
      "email": i.string().unique().indexed(),
      "firstName": i.string(),
      "lastName": i.string(),
      "phone": i.string().optional(),
    }),
    "inventoryMovements": i.entity({
      "description": i.string().optional(),
      "occurredAt": i.date(),
      "quantity": i.number(),
      "reason": i.string(),
    }),
    "lineItems": i.entity({
      "createdAt": i.date(),
      "price": i.number(),
      "quantity": i.number(),
      "title": i.string(),
      "totalDiscount": i.number(),
    }),
    "locations": i.entity({
      "address": i.any(),
      "isActive": i.boolean(),
      "name": i.string(),
    }),
    "orders": i.entity({
      "channel": i.string(),
      "createdAt": i.date().indexed(),
      "currency": i.string(),
      "financialStatus": i.string(),
      "fulfillmentStatus": i.string(),
      "name": i.string(),
      "subtotal": i.number(),
      "tax": i.number(),
      "totalPrice": i.number(),
      "updatedAt": i.date(),
    }),
    "payments": i.entity({
      "amount": i.number(),
      "createdAt": i.date(),
      "currency": i.string(),
      "gateway": i.string(),
      "processedAt": i.date().optional(),
      "status": i.string(),
    }),
    "products": i.entity({
      "createdAt": i.date().indexed(),
      "description": i.string().optional(),
      "productType": i.string().optional(),
      "status": i.string(),
      "tags": i.string(),
      "title": i.string(),
      "updatedAt": i.date(),
      "userId": i.string().indexed(),
      "vendor": i.string().optional(),
    }),
    "productVariants": i.entity({
      "barcode": i.string().optional(),
      "compareAtPrice": i.number().optional(),
      "cost": i.number().optional(),
      "createdAt": i.date(),
      "inventoryQuantity": i.number(),
      "price": i.number(),
      "sku": i.string().unique(),
      "title": i.string(),
      "updatedAt": i.date(),
      "weight": i.number().optional(),
    }),
    "stores": i.entity({
      "address": i.any(),
      "createdAt": i.date().indexed(),
      "currency": i.string(),
      "name": i.string(),
      "timeZone": i.string(),
    }),
    "taskCategories": i.entity({
      "color": i.string().optional(),
      "createdAt": i.date().indexed(),
      "name": i.string(),
      "updatedAt": i.date(),
    }),
    "taskComments": i.entity({
      "authorId": i.string(),
      "content": i.string(),
      "createdAt": i.date().indexed(),
      "taskId": i.string(),
      "updatedAt": i.date(),
    }),
    "tasks": i.entity({
      "actualHours": i.number().optional(),
      "assignedTo": i.string().optional(),
      "completedAt": i.date().optional(),
      "createdAt": i.date().indexed(),
      "description": i.string().optional(),
      "dueDate": i.date().optional(),
      "estimatedHours": i.number().optional(),
      "priority": i.string(),
      "progress": i.number().optional(),
      "status": i.string(),
      "tags": i.any(),
      "title": i.string(),
      "updatedAt": i.date(),
    }),
    "team": i.entity({
      "createdAt": i.date(),
      "email": i.string().unique(),
      "firstName": i.string(),
      "lastName": i.string(),
      "pin": i.string().optional(),
      "role": i.string(),
    }),
  },
  links: {
    "collectionsProducts": {
      "forward": {
        "on": "collections",
        "has": "many",
        "label": "products"
      },
      "reverse": {
        "on": "products",
        "has": "many",
        "label": "collections"
      }
    },
    "customersTasks": {
      "forward": {
        "on": "customers",
        "has": "many",
        "label": "tasks"
      },
      "reverse": {
        "on": "tasks",
        "has": "one",
        "label": "customer"
      }
    },
    "lineItemsVariant": {
      "forward": {
        "on": "lineItems",
        "has": "one",
        "label": "variant"
      },
      "reverse": {
        "on": "productVariants",
        "has": "many",
        "label": "lineItems"
      }
    },
    "locationsMovements": {
      "forward": {
        "on": "locations",
        "has": "many",
        "label": "movements"
      },
      "reverse": {
        "on": "inventoryMovements",
        "has": "one",
        "label": "location"
      }
    },
    "ordersCustomer": {
      "forward": {
        "on": "orders",
        "has": "one",
        "label": "customer"
      },
      "reverse": {
        "on": "customers",
        "has": "many",
        "label": "orders"
      }
    },
    "ordersLineItems": {
      "forward": {
        "on": "orders",
        "has": "many",
        "label": "lineItems"
      },
      "reverse": {
        "on": "lineItems",
        "has": "one",
        "label": "order"
      }
    },
    "ordersPayments": {
      "forward": {
        "on": "orders",
        "has": "many",
        "label": "payments"
      },
      "reverse": {
        "on": "payments",
        "has": "one",
        "label": "order"
      }
    },
    "ordersTasks": {
      "forward": {
        "on": "orders",
        "has": "many",
        "label": "tasks"
      },
      "reverse": {
        "on": "tasks",
        "has": "one",
        "label": "order"
      }
    },
    "productsTasks": {
      "forward": {
        "on": "products",
        "has": "many",
        "label": "tasks"
      },
      "reverse": {
        "on": "tasks",
        "has": "one",
        "label": "product"
      }
    },
    "productsVariants": {
      "forward": {
        "on": "products",
        "has": "many",
        "label": "variants"
      },
      "reverse": {
        "on": "productVariants",
        "has": "one",
        "label": "product"
      }
    },
    "productVariantsMovements": {
      "forward": {
        "on": "productVariants",
        "has": "many",
        "label": "movements"
      },
      "reverse": {
        "on": "inventoryMovements",
        "has": "one",
        "label": "variant"
      }
    },
    "storesLocations": {
      "forward": {
        "on": "stores",
        "has": "many",
        "label": "locations"
      },
      "reverse": {
        "on": "locations",
        "has": "one",
        "label": "store"
      }
    },
    "storesOrders": {
      "forward": {
        "on": "stores",
        "has": "many",
        "label": "orders"
      },
      "reverse": {
        "on": "orders",
        "has": "one",
        "label": "store"
      }
    },
    "storesProducts": {
      "forward": {
        "on": "stores",
        "has": "many",
        "label": "products"
      },
      "reverse": {
        "on": "products",
        "has": "one",
        "label": "store"
      }
    },
    "storesTeam": {
      "forward": {
        "on": "stores",
        "has": "many",
        "label": "team"
      },
      "reverse": {
        "on": "team",
        "has": "one",
        "label": "store"
      }
    },
    "tasksCategories": {
      "forward": {
        "on": "tasks",
        "has": "many",
        "label": "categories"
      },
      "reverse": {
        "on": "taskCategories",
        "has": "one",
        "label": "task"
      }
    },
    "tasksComments": {
      "forward": {
        "on": "tasks",
        "has": "many",
        "label": "comments"
      },
      "reverse": {
        "on": "taskComments",
        "has": "one",
        "label": "task"
      }
    },
    "teamMovements": {
      "forward": {
        "on": "team",
        "has": "many",
        "label": "movements"
      },
      "reverse": {
        "on": "inventoryMovements",
        "has": "one",
        "label": "team"
      }
    },
    "teamTasks": {
      "forward": {
        "on": "team",
        "has": "many",
        "label": "tasks"
      },
      "reverse": {
        "on": "tasks",
        "has": "one",
        "label": "teamMember"
      }
    }
  },
  rooms: {}
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
