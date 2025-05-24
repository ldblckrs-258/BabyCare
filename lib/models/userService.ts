import { UserPreferences } from '@/stores/userStore';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from '@react-native-firebase/firestore';

/**
 * Service class for User-related Firebase operations
 * Manages user preferences like FCM tokens and language settings
 *
 * Lưu ý: Service này không sử dụng onSnapshot nên không cần cập nhật xử lý snapshot null
 */
export class UserService {
  /**
   * Fetch a user's preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (!userId) {
      console.warn('UserService.getUserPreferences called without userId');
      return null;
    }

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists) {
        return null;
      }

      return userSnap.data() as UserPreferences;
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      return null;
    }
  }

  /**
   * Create or update a user's preferences document
   */
  static async createOrUpdateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    if (!userId) {
      throw new Error('UserService.createOrUpdateUserPreferences called without userId');
    }

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists === false) {
        // Create new user preferences document
        const newUserPrefs: UserPreferences = {
          id: userId,
          language: preferences.language || 'en',
          fcmTokens: preferences.fcmTokens || [],
          updatedAt: new Date(),
        };

        await setDoc(userRef, newUserPrefs);
        return newUserPrefs;
      } else {
        // Update existing user preferences
        const existingData = userSnap.data() as UserPreferences;
        const updatedData = {
          ...existingData,
          ...preferences,
          updatedAt: new Date(),
        };

        await updateDoc(userRef, updatedData as { [key: string]: any });
        return updatedData;
      }
    } catch (err) {
      console.error('Error creating/updating user preferences:', err);
      throw err;
    }
  }

  /**
   * Update or add FCM token to user's document
   * Handles token deduplication
   */
  static async updateFcmToken(userId: string, token: string): Promise<void> {
    if (!userId || !token) {
      console.warn('UserService.updateFcmToken called without userId or token');
      return;
    }

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists === false) {
        // Create new user with this token
        await setDoc(userRef, {
          id: userId,
          fcmTokens: [token],
          updatedAt: new Date(),
        });
      } else {
        // Update existing user
        const userData = userSnap.data() as UserPreferences;
        const fcmTokens = userData.fcmTokens || [];

        // Only add the token if it doesn't exist yet
        if (!fcmTokens.includes(token)) {
          await updateDoc(userRef, {
            fcmTokens: [...fcmTokens, token],
            updatedAt: new Date(),
          });
        }
      }
    } catch (err) {
      console.error('Error updating FCM token:', err);
    }
  }

  /**
   * Remove FCM token from user's document
   */
  static async removeFcmToken(userId: string, tokenToRemove: string): Promise<void> {
    if (!userId || !tokenToRemove) {
      console.warn('UserService.removeFcmToken called without userId or token');
      return;
    }

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists === true) {
        const userData = userSnap.data() as UserPreferences;
        const fcmTokens = userData.fcmTokens || [];

        // Filter out the token to remove
        const updatedTokens = fcmTokens.filter((token) => token !== tokenToRemove);

        await updateDoc(userRef, {
          fcmTokens: updatedTokens,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Error removing FCM token:', err);
    }
  }

  /**
   * Update user language preference
   */
  static async updateLanguage(userId: string, language: string): Promise<void> {
    if (!userId) {
      console.warn('UserService.updateLanguage called without userId');
      return;
    }

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists === false) {
        // Create new user with this language
        await setDoc(userRef, {
          id: userId,
          language,
          fcmTokens: [],
          updatedAt: new Date(),
        });
      } else {
        // Update existing user
        await updateDoc(userRef, {
          language,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Error updating language preference:', err);
    }
  }
}
