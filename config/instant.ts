import { init } from '@instantdb/react-native';

// Replace with your actual Instant DB app ID
const APP_ID = '688f0dcf-344b-4893-ae31-950545f51e52';

export const db = init({
  appId: APP_ID,
  // For magic code auth, we don't need API secret
});