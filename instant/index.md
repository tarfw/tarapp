# InstantDB Documentation for React Native

Welcome to the complete InstantDB documentation for React Native development. This collection contains all the essential information you need to understand and work with InstantDB in your Expo React Native app.

## Table of Contents

### INTRODUCTION
- [Getting Started with React Native](./getting-started-react-native.md) - Build your first InstantDB app with React Native (Mobile)
- [Init](./init.md) - Initialize InstantDB in your React Native application
- [Modeling Data](./modeling-data.md) - Define your data schema and relationships

### WORKING WITH DATA
- [Reading Data](./reading-data.md) - Query your data with real-time updates
- [Writing Data](./writing-data.md) - Create, update, and delete data with transactions

### AUTHENTICATION AND PERMISSIONS
- [Authentication](./auth.md) - Set up user authentication
- [Guest Authentication](./guest-auth.md) - Allow users to try your app before signing up
- [Permissions](./permissions.md) - Control access to your data

### PLATFORM FEATURES
- [Presence, Cursors, and Activity](./presence-cursors-activity.md) - Enable real-time collaboration features

## About InstantDB

InstantDB is a real-time database designed to make building collaborative mobile applications easy. It provides:

- Real-time data synchronization for mobile apps
- Client-side type safety
- Flexible permission system
- Built-in authentication
- Collaborative features like presence and cursors
- Offline-first architecture with automatic sync
- Easy schema management

## Quick Start

Start with the [Getting Started with React Native](./getting-started-react-native.md) guide to build your first Expo mobile app with InstantDB in minutes.

## Architecture Overview

InstantDB follows a client-first, mobile-optimized architecture:

1. **Client-side**: Your React Native application code runs directly on the mobile device, interacting with the database
2. **Real-time synchronization**: Changes are automatically synced to all connected mobile clients
3. **Offline-first**: Data persists locally using AsyncStorage and syncs when connectivity is available
4. **Server-side validation**: Permissions and validation rules ensure data integrity
5. **Schema management**: Define your data structure in code and deploy with the CLI

## Support

For additional help with InstantDB:
- Visit the [official documentation](https://www.instantdb.com/docs)
- Join the community for support
- Check out the API reference for detailed method documentation