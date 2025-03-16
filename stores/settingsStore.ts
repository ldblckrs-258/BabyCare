import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/lib/i18n';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  setLanguage: (language: string) => void;
  setDeviceConnection: (isConnected: boolean, deviceId?: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
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
