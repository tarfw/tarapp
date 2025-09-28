// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react-native';

const rules = {
  "products": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.userId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "customers": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "lineItems": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "tasks": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "productVariants": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "collections": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "locations": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "inventoryMovements": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "taskComments": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "payments": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "$default": {
    "allow": {
      "$default": false
    }
  },
  "stores": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "taskCategories": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "team": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "orders": {
    "bind": [
      "isOwner",
      "auth.id != null && auth.id == data.creatorId"
    ],
    "allow": {
      "view": "true",
      "create": "isOwner",
      "delete": "isOwner",
      "update": "isOwner"
    }
  }
} satisfies InstantRules;

export default rules;
