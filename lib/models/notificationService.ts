import {
  registerForPushNotificationsAsync,
  setupNotificationHandlers,
} from '@/lib/pushNotification';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export class NotificationService {
  private static cleanupFn: (() => void) | null = null;
  private static currentToken: string | null = null;

  static async initialize(userId: string) {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        this.currentToken = token;
        const userRef = firestore().collection('users').doc(userId);

        await userRef.set(
          {
            fcmTokens: firestore.FieldValue.arrayUnion(token),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log('Push notification token saved:', token);
      }

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
        const userRef = firestore().collection('users').doc(userId);
        await userRef.update({
          fcmTokens: firestore.FieldValue.arrayRemove(this.currentToken),
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
        const userRef = firestore().collection('users').doc(userId);

        // Xoá token cũ
        if (this.currentToken) {
          await userRef.update({
            fcmTokens: firestore.FieldValue.arrayRemove(this.currentToken),
          });
        }

        // Lưu token mới
        await userRef.update({
          fcmTokens: firestore.FieldValue.arrayUnion(newToken),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        this.currentToken = newToken;
        console.log('Token refreshed:', newToken);
      } catch (err) {
        console.error('Error updating refreshed token:', err);
      }
    });
  }
}
