import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/lib/i18n';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Notification } from '@/lib/notifications';

interface NotificationSettings {
  cryDetection: number;
  sleepPosition: number;
  deviceDisconnected: boolean;
  dailyReport: boolean;
}

interface SettingsState {
  language: string;
  isDeviceConnected: boolean;
  deviceId?: string;
  notifications: NotificationSettings;
  userNotifications: Notification[];
  setLanguage: (language: string) => void;
  setDeviceConnection: (isConnected: boolean, deviceId?: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const initialNotificationSettings: NotificationSettings = {
  cryDetection: 5, // minutes
  sleepPosition: 5, // minutes
  deviceDisconnected: true,
  dailyReport: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      isDeviceConnected: false,
      deviceId: undefined,
      notifications: initialNotificationSettings,
      userNotifications: [],

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      setDeviceConnection: (isConnected, deviceId = undefined) =>
        set({ isDeviceConnected: isConnected, deviceId }),

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
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          ),
        })),
        
      markAllNotificationsAsRead: () =>
        set((state) => ({
          userNotifications: state.userNotifications.map((notification) => ({ 
            ...notification, 
            read: true 
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
