import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getMessaging } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;
let messaging: ReturnType<typeof getMessaging> | null = null;

try {
  // Initialize các Firebase services
  auth = getAuth(); // Firebase Auth
  firestore = getFirestore(); // Firebase Firestore

  if (Platform.OS === 'android') {
    messaging = getMessaging(); // Firebase Messaging
  }
} catch (error: any) {
  console.error('Firebase init error:', error);
}

export { auth, firestore, messaging };
