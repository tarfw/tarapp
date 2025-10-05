# Initializing Instant

## BASIC INITIALIZATION

The first step to using Instant in your app is to call init. Here is a simple example at the root of your app.

```typescript
import { init } from '@instantdb/react-native';

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = '__APP_ID__';

const db = init({ appId: APP_ID });

function App() {
  return <Main />;
}
```

With that, you can use db to write data, make queries, handle auth, and more!

## TYPESAFETY

If you're using typescript, init accepts a schema argument. Adding a schema provides auto-completion and typesafety for your queries and transactions.

```typescript
import { init, i } from '@instantdb/react-native';

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = '__APP_ID__';

const schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.any(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.number(),
    }),
  },
});

const db = init({ appId: APP_ID, schema });
```

To learn more about writing schemas, head on over to the Modeling your data section.

## FLEXIBLE INITIALIZATION

Instant maintains a single connection regardless of where or how many times you call init with the same app ID. This means you can safely call init multiple times without worrying about creating multiple connections or performance overhead. However we do recommend the pattern of exporting a reference from a utility file like so:

```typescript
// lib/db.ts
import { init } from '@instantdb/react-native';
import schema from '../instant.schema';

// Visit https://instantdb.com/dash to get your APP_ID :)
const APP_ID = '__APP_ID__';
export const db = init({ appId: APP_ID, schema });
```

## CONFIGURATION OPTIONS

init accepts a few options. For most use cases you'll want to provide appId and schema. Here are all the options you can provide:

- **appId** (required): Your InstantDB application ID. This identifies your app and is used to connect to the correct backend.

- **schema?**: Instant schema export from your instant.schema.ts file. Provide this for typesafety and auto-completion in queries, transactions, and ephemeral features.

- **websocketURI?**: Custom WebSocket endpoint for real-time connections. Defaults to 'wss://api.instantdb.com/runtime/session'. Change this for connecting to development or self-hosted instances. For Android development, you may need to configure this differently.

- **apiURI?**: Custom HTTP API endpoint for auth and storage operations. Defaults to 'https://api.instantdb.com'. Change this for connecting to development or self-hosted instances.

- **devtool?**: Controls the Instant dev tool. Note that the devtool is primarily designed for web development. Set to false for React Native production builds.

- **verbose?**: Enables detailed console logging for debugging. When true, logs WebSocket messages and internal operations. Helpful for troubleshooting connection and sync issues in React Native.

- **queryCacheLimit?**: Maximum number of query subscriptions to cache for offline mode. Defaults to 10. In React Native, this enables offline capabilities using AsyncStorage.

- **useDateObjects?**: When true, all date columns in queries will return a Javascript Date object. Disabled by default.

## React Native Specific Configuration

For React Native apps, you may need additional configuration:

- **Offline Support**: By default, InstantDB persists data locally using AsyncStorage (requires @react-native-async-storage/async-storage)
- **Network Detection**: For better offline handling, use @react-native-community/netinfo to detect network status
- **Unique ID Generation**: Includes react-native-get-random-values for secure ID generation

If you are an LLM trying to learn how to develop with Instant, here are all of the links to the docs:

Getting started w/ React | Getting started w/ React Native | Getting started w/ Vanilla JS | Create Instant App | Recommended Workflow | Using LLMs | Init | Modeling data | Writing data | Reading data | Instant on the backend | Patterns | Auth | Guest Auth | Magic codes | Google OAuth | LinkedIn OAuth | Sign In with Apple | Clerk | Permissions | OAuth apps | Managing users | Presence, Cursors, and Activity | Instant CLI | Devtool | Custom emails | App teams | Storage

Previous: ← Getting started w/ React
Next: Modeling data →

## ON THIS PAGE

1. BASIC INITIALIZATION
2. TYPESAFETY
3. FLEXIBLE INITIALIZATION
4. CONFIGURATION OPTIONS