import i18n from '@/lib/i18n';
import { Notification } from '@/lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationSettings {
  enableNotifications: boolean;
  deviceDisconnected: boolean;
}

interface SettingsState {
  language: string;
  notifications: NotificationSettings;
  userNotifications: Notification[];
  setLanguage: (language: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const initialNotificationSettings: NotificationSettings = {
  enableNotifications: true,
  deviceDisconnected: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      notifications: initialNotificationSettings,
      userNotifications: [],

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...settings,
          },
        })),

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
        }
      },
    }
  )
);
