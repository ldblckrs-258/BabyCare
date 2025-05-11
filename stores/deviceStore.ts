import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Device {
  id: string;
  uri: string;
  isOnline: boolean;
  cryingThreshold: number;
  sideThreshold: number;
  proneThreshold: number;
  noBlanketThreshold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface định nghĩa sự kiện từ thiết bị
export interface DeviceEvent {
  id: string;
  deviceId: string;
  type: 'Side' | 'Prone' | 'Blanket' | 'NoBlanket' | 'Crying' | 'Supine' | 'NoCrying';
  time: Date;
}

// Interface định nghĩa thông báo
export interface DeviceNotification {
  id: string;
  deviceId: string;
  type: 'Side' | 'Prone' | 'Blanket' | 'NoBlanket' | 'Crying';
  duration: number;
  time: Date;
  imageUrl?: string;
}

interface DeviceState {
  devices: Device[];
  events: DeviceEvent[];
  notifications: DeviceNotification[];

  // Device management actions
  addDevice: (device: Device) => void;
  getDeviceById: (deviceId: string) => Device | undefined;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  removeDevice: (deviceId: string) => void;
  clearAllDevices: () => void;

  // Event and notification actions
  addEvent: (event: DeviceEvent) => void;
  getEventsByDeviceId: (deviceId: string) => DeviceEvent[];
  addNotification: (notification: DeviceNotification) => void;
  getNotificationsByDeviceId: (deviceId: string) => DeviceNotification[];
  clearEvents: (deviceId?: string) => void;
  clearNotifications: (deviceId?: string) => void;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      devices: [],
      events: [],
      notifications: [],

      addDevice: (device) =>
        set((state) => {
          // Only add if device doesn't already exist
          if (!state.devices.some((d) => d.id === device.id)) {
            return {
              devices: [...state.devices, device],
            };
          }
          return state;
        }),

      getDeviceById: (deviceId: string) => {
        const state = get();
        return state.devices.find((device) => device.id === deviceId);
      },

      updateDevice: (deviceId: string, updates) =>
        set((state) => ({
          devices: state.devices.map((device) =>
            device.id === deviceId ? { ...device, ...updates, updatedAt: new Date() } : device
          ),
        })),

      removeDevice: (deviceId: string) =>
        set((state) => ({
          devices: state.devices.filter((device) => device.id !== deviceId),
        })),

      clearAllDevices: () => set({ devices: [] }),

      // Event management
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      getEventsByDeviceId: (deviceId: string) => {
        const state = get();
        return state.events.filter((event) => event.deviceId === deviceId);
      },

      // Notification management
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),

      getNotificationsByDeviceId: (deviceId: string) => {
        const state = get();
        return state.notifications.filter((notification) => notification.deviceId === deviceId);
      },

      clearEvents: (deviceId) =>
        set((state) => {
          if (deviceId) {
            return {
              events: state.events.filter((event) => event.deviceId !== deviceId),
            };
          }
          return { events: [] };
        }),

      clearNotifications: (deviceId) =>
        set((state) => {
          if (deviceId) {
            return {
              notifications: state.notifications.filter(
                (notification) => notification.deviceId !== deviceId
              ),
            };
          }
          return { notifications: [] };
        }),
    }),
    {
      name: 'babycare-devices',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
