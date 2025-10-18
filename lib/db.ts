// lib/db.ts
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { init } from '@instantdb/react-native';
import schema from '../instant.schema';

const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID!,
  schema,
  storage: AsyncStorage,
});

// Auth persistence handled automatically by Instant DB

export default db;