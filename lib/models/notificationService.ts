import {
  registerForPushNotificationsAsync,
  setupNotificationHandlers,
} from '@/lib/pushNotification';
import {
  arrayRemove,
  arrayUnion,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export class NotificationService {
  private static cleanupFn: (() => void) | null = null;
  private static currentToken: string | null = null;

  static async initialize(userId: string) {
    if (!userId) {
      console.warn('NotificationService.initialize called without userId');
      return; // Exit if no userId
    }
    try {
      const token = await registerForPushNotificationsAsync();
      // Nếu token đã được đăng ký rồi thì không đăng ký lại nữa
      if (!token || token === this.currentToken) {
        // Không log lại nếu đã đăng ký
        return;
      }
      this.currentToken = token;
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      await setDoc(
        userRef,
        {
          fcmTokens: arrayUnion(token),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      this.cleanupFn = setupNotificationHandlers();
    } catch (error) {
      console.error('NotificationService initialization error:', error);
    }
  }

  static async cleanup(userId?: string) {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
    if (userId && this.currentToken) {
      try {
        const firestore = getFirestore();
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, {
          fcmTokens: arrayRemove(this.currentToken),
        });
        console.log('Token removed on logout:', this.currentToken);
      } catch (err) {
        console.error('Error removing token on logout:', err);
      }
      this.currentToken = null;
    }
  }

  static listenForTokenRefresh(userId: string) {
    messaging().onTokenRefresh(async (newToken) => {
      try {
        const firestore = getFirestore();
        const userRef = doc(firestore, 'users', userId);
        if (this.currentToken) {
          await updateDoc(userRef, {
            fcmTokens: arrayRemove(this.currentToken),
          });
        }
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(newToken),
          updatedAt: serverTimestamp(),
        });
        this.currentToken = newToken;
        console.log('Token refreshed:', newToken);
      } catch (err) {
        console.error('Error updating refreshed token:', err);
      }
    });
  }
}
