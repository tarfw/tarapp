# Authentication

Instant comes with support for auth. We currently offer magic codes, Google OAuth, LinkedIn OAuth, Sign In with Apple, Clerk, and Guest Auth. If you want to build your own flow, you can use the Admin SDK.

## Auth Overview

To get the current user in your application, you can use the `db.useUser` hook.

```javascript
import db from '../lib/db';

function Dashboard() {
  const user = db.useUser();

  return <Text>Signed in as: {user.email}</Text>;
}
```

The `useUser` hook will throw an error if it is accessed while the user is not logged in, so it should be gated behind `<db.SignedIn>`

```javascript
import db from '../lib/db';

// Note: This example shows the basic auth pattern.
// In React Native, you would use React Native components (View, Text, etc.) instead of divs.

export default function App() {
  return (
    <View>
      <db.SignedIn>
        <Dashboard />
      </db.SignedIn>
      <db.SignedOut>
        <Text>Log in to see the dashboard!</Text>
      </db.SignedOut>
    </View>
  );
}

function Dashboard() {
  // This component will only render if the user is signed in
  // so it's safe to call useUser here!
  const user = db.useUser();

  return <Text>Signed in as: {user.email}</Text>;
}
```

Use `<db.SignedIn>` and `<db.SignedOut>` to conditionally render components based on the user's authentication state.

You can then use `db.auth.signOut()` to sign a user out.

```javascript
import db from '../lib/db';

// ... Same app component from above

function Dashboard() {
  const user = db.useUser();

  return (
    <View>
      <Text>Signed in as: {user.email}</Text>
      <TouchableOpacity onPress={() => db.auth.signOut()}>
        <Text>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
```

Putting it all together, you can conditionally render a login and dashboard component like so:

```javascript
import db from '../lib/db';

export default function App() {
  return (
    <View>
      <db.SignedIn>
        <Dashboard />
      </db.SignedIn>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
    </View>
  );
}

function Dashboard() {
  // This component will only render if the user is signed in
  // so it's safe to call useUser here!
  const user = db.useUser();

  return <Text>Signed in as: {user.email}</Text>;
}

function Login() {
  // Implement a login flow here via magic codes, OAuth, Clerk, etc.
}
```

To implement a login flow use one of the authentication method guides below.

## Authentication Methods

- **MAGIC CODES**: Send login codes to your users via email. Removes the need for passwords.
- **GOOGLE OAUTH**: We provide flows for Web and React Native to enable Google OAuth for your app.
- **SIGN IN WITH APPLE**: Sign In to native apps with Apple ID.
- **CLERK**: Integrate Clerk's auth flow with Instant.
- **CUSTOM AUTH**: Integrate your own auth flow with the Admin SDK.
- **GUEST AUTH**: Allow your users to try your app before they sign up.

## Additional Auth APIs

Sometimes you need finer control over the state of auth in your application. In those cases, you can use some of the lower-level API.

### useAuth

Use `useAuth` to fetch the current user. In this example we guard against loading our Main component until a user is logged in:

```javascript
import { View, Text } from 'react-native';

function App() {
  const { isLoading, user, error } = db.useAuth();
  if (isLoading) {
    return <Text>Loading...</Text>; // or a loading spinner
  }
  if (error) {
    return <Text style={{ padding: 16, color: 'red' }}>Uh oh! {error.message}</Text>;
  }
  if (user) {
    return <Main />;
  }
  return <Login />;
}
```

### Get auth

For scenarios where you want to know the current auth state without subscribing to changes, you can use `getAuth`.

```javascript
const user = await db.getAuth();
console.log('logged in as', user.email);