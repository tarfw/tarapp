// lib/db.ts
import 'react-native-get-random-values';
import { init } from '@instantdb/react-native';
import schema from '../instant.schema';

const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID!,
  schema,
});

export default db;