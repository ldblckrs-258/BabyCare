import i18n from '@/lib/i18n';
import { UserService } from '@/lib/models/userService';
import { Notification } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  language: string;
  userNotifications: Notification[];
  setLanguage: (language: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      userNotifications: [],

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });

        // Update language preference in Firestore if user is logged in
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.uid) {
          // Update in Firestore
          UserService.updateLanguage(currentUser.uid, language)
            .then(() => {
              // Update in userStore
              const userStore = useUserStore.getState();
              if (userStore.preferences) {
                userStore.updateLanguage(language);
              }
            })
            .catch((error) => {
              console.error('Error saving language preference:', error);
            });
        }
      },

      addNotification: (notification) =>
        set((state) => ({
          userNotifications: [notification, ...state.userNotifications],
        })),

      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          userNotifications: state.userNotifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          ),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          userNotifications: state.userNotifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),

      clearNotifications: () => set({ userNotifications: [] }),
    }),
    {
      name: 'babycare-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated, set the language in i18next
        if (state) {
          i18n.changeLanguage(state.language);

          // Also synchronize with user preferences if available
          const userStore = useUserStore.getState();
          const currentUser = useAuthStore.getState().user;

          if (
            currentUser?.uid &&
            userStore.preferences &&
            userStore.preferences.language !== state.language
          ) {
            UserService.updateLanguage(currentUser.uid, state.language).catch((error) =>
              console.error('Error syncing language preference:', error)
            );
          }
        }
      },
    }
  )
);
