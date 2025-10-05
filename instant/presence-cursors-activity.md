# Presence, Cursors, and Activity

Presence features in InstantDB allow you to track user activity, show who's online, and enable collaborative features like shared cursors.

## Basic Presence

Presence allows you to track when users are online or offline in real-time:

```javascript
// Set presence status
db.presence.update({ status: 'online', location: 'dashboard' });

// Subscribe to presence changes
import { View, Text, FlatList } from 'react-native';

function UserList() {
  const { data: presence } = db.usePresence();

  const presenceArray = Object.entries(presence).map(([userId, userPresence]) => ({
    id: userId,
    ...userPresence
  }));

  return (
    <FlatList
      data={presenceArray}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Text>{item.status} - {item.location}</Text>
      )}
    />
  );
}
```

## Setting User Presence

```javascript
// Update your presence
db.presence.update({
  status: 'editing',
  location: 'document-123',
  cursorPosition: { x: 100, y: 200 },
});

// Or update specific fields
db.presence.updateField('location', 'editor');
db.presence.updateField('typing', true);
```

## Watching Specific User Presence

```javascript
// Watch presence for specific users
import { View, Text } from 'react-native';

function CollaborationPanel() {
  const { data: collaborators } = db.usePresenceQuery({
    where: {
      location: { $eq: 'current-document' }
    }
  });

  const collaboratorsArray = Array.isArray(collaborators) ? collaborators : [];

  return (
    <View style={styles.collaborationPanel}>
      {collaboratorsArray.map(([userId, presence]) => (
        <View key={userId} style={styles.collaborator}>
          <View style={styles.statusIndicator} />
          <Text>{presence.displayName || 'Anonymous'}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  collaborationPanel: {
    // Add your styles here
  },
  collaborator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
});
```

## Cursor Tracking

Enable cursor tracking for real-time collaborative editing:

```javascript
// Update cursor position
function Editor({ documentId }) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const newPosition = { x: e.clientX, y: e.clientY };
    setCursorPosition(newPosition);
    
    // Update presence with cursor position
    db.presence.update({
      location: `document-${documentId}`,
      cursor: newPosition,
      active: true,
    });
  };

  return (
    <div onMouseMove={handleMouseMove} className="editor">
      <ContentArea />
      <CursorLayer />
    </div>
  );
}
```

## Displaying Other Users' Cursors

```javascript
// Show other users' cursors
function CursorLayer() {
  const { data: presences } = db.usePresenceQuery({
    where: {
      location: { $eq: 'current-document' }
    }
  });

  return (
    <div className="cursor-layer">
      {Object.entries(presences)
        .filter(([userId, presence]) => userId !== db.auth.user?.id)
        .map(([userId, presence]) => (
          <div
            key={userId}
            className="user-cursor"
            style={{
              left: presence.cursor?.x || 0,
              top: presence.cursor?.y || 0,
            }}
          >
            <div className="cursor-triangle" style={{ backgroundColor: getUserColor(userId) }} />
            <div className="cursor-name" style={{ backgroundColor: getUserColor(userId) }}>
              {presence.displayName || 'User'}
            </div>
          </div>
        ))}
    </div>
  );
}
```

## Real-time Editing Awareness

```javascript
// Show who's editing the same document
function EditorHeader({ documentId }) {
  const { data: activeUsers } = db.usePresenceQuery({
    where: {
      location: { $eq: `document-${documentId}` },
      active: { $eq: true },
    }
  });

  return (
    <header className="editor-header">
      <h1>Document Editor</h1>
      <div className="active-users">
        {activeUsers.length > 1 && (
          <span>{activeUsers.length - 1} other user(s) editing</span>
        )}
      </div>
    </header>
  );
}
```

## Custom Presence Attributes

You can store custom attributes in presence:

```javascript
// Store user preferences
db.presence.update({
  displayName: 'Jane Doe',
  color: '#3b82f6',
  timezone: 'America/New_York',
  notifications: true,
});

// Use custom attributes
function UserBadge({ userId }) {
  const { data: userPresence } = db.usePresence(userId);

  return (
    <div className="user-badge" style={{ borderLeftColor: userPresence.color }}>
      <span>{userPresence.displayName}</span>
    </div>
  );
}
```

## Presence Options and Configuration

```javascript
// Initialize with presence options
const db = init({ 
  appId: APP_ID,
  schema,
  // Enable detailed presence tracking
  presence: {
    heartbeatInterval: 5000, // Heartbeat every 5 seconds
    timeout: 15000, // Mark as offline after 15 seconds without heartbeat
  }
});
```

## Activity Monitoring

Track and display user activity:

```javascript
// Track recent activity
function ActivityLog({ roomId }) {
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Subscribe to presence changes
    const unsub = db.presence.subscribe((updates) => {
      Object.entries(updates).forEach(([userId, presence]) => {
        setRecentActivity(prev => [
          {
            userId,
            action: presence.status,
            timestamp: Date.now(),
            ...presence
          },
          ...prev.slice(0, 9) // Keep only the 10 most recent
        ]);
      });
    });

    return unsub;
  }, []);

  return (
    <div className="activity-log">
      <h3>Recent Activity</h3>
      <ul>
        {recentActivity.map((activity, index) => (
          <li key={index} className="activity-item">
            <span className="timestamp">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </span>
            <span className="user">{activity.displayName || 'User'}</span>
            <span className="action">{activity.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Presence with Permissions

You can control who can see presence information using permissions:

```typescript
// instant.perms.ts
const rules = {
  presence: {
    allow: {
      // Who can see presence data
      read: 'isAuthenticated()',
      // Who can update their own presence
      update: 'userId() == authId()',
    },
  },
};
```

## Best Practices

1. **Use presence efficiently**: Only subscribe to presence when needed
2. **Clean up subscriptions**: Always unsubscribe when components unmount
3. **Optimize updates**: Don't update presence too frequently
4. **Handle offline states**: Gracefully handle when users go offline
5. **Privacy considerations**: Be mindful of what presence information you share