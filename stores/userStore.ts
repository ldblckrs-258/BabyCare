import { UserService } from '@/lib/models/userService';
import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UserPreferences {
  id: string;
  language: string;
  fcmTokens: string[];
  updatedAt: Date;
}

interface UserState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initUserPreferences: (userId: string) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  addFcmToken: (token: string) => Promise<void>;
  removeFcmToken: (token: string) => Promise<void>;
  clearPreferences: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      preferences: null,
      isLoading: false,
      error: null,

      initUserPreferences: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const userPrefs = await UserService.getUserPreferences(userId);

          if (userPrefs) {
            set({ preferences: userPrefs, isLoading: false });
          } else {
            // Create default preferences if none exist
            const defaultPrefs = {
              id: userId,
              language: 'en',
              fcmTokens: [],
              updatedAt: new Date(),
            };
            await UserService.createOrUpdateUserPreferences(userId, defaultPrefs);
            set({ preferences: defaultPrefs, isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing user preferences:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateLanguage: async (language: string) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) {
          set({ error: 'No user logged in' });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          await UserService.updateLanguage(userId, language);

          set((state) => ({
            preferences: state.preferences
              ? { ...state.preferences, language, updatedAt: new Date() }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error updating language:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      addFcmToken: async (token: string) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) {
          set({ error: 'No user logged in' });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          await UserService.updateFcmToken(userId, token);

          set((state) => {
            if (!state.preferences) return { isLoading: false };

            const currentTokens = state.preferences.fcmTokens || [];
            if (currentTokens.includes(token)) {
              // Token already exists, no need to update state
              return { isLoading: false };
            }

            return {
              preferences: {
                ...state.preferences,
                fcmTokens: [...currentTokens, token],
                updatedAt: new Date(),
              },
              isLoading: false,
            };
          });
        } catch (error) {
          console.error('Error adding FCM token:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      removeFcmToken: async (token: string) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) {
          set({ error: 'No user logged in' });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          await UserService.removeFcmToken(userId, token);

          set((state) => {
            if (!state.preferences) return { isLoading: false };

            return {
              preferences: {
                ...state.preferences,
                fcmTokens: state.preferences.fcmTokens.filter((t) => t !== token),
                updatedAt: new Date(),
              },
              isLoading: false,
            };
          });
        } catch (error) {
          console.error('Error removing FCM token:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      clearPreferences: () => {
        set({ preferences: null, error: null });
      },
    }),
    {
      name: 'babycare-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
