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

// Load persisted refresh token on app start
const loadPersistedAuth = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('instant_refresh_token');
    if (refreshToken) {
      db.auth.setRefreshToken(refreshToken);
      console.log('Loaded persisted auth token');
    }
  } catch (error) {
    console.error('Error loading persisted auth:', error);
  }
};

loadPersistedAuth();

export default db;