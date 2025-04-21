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
  imageUrl: string;
}

interface DeviceState {
  devices: Device[];
  events: DeviceEvent[];
  notifications: DeviceNotification[];
  
  // Device management actions
  addDevice: (device: Device) => void;
  getDeviceById: (deviceId: string) => Device | undefined;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  clearAllDevices: () => void;
  
  // Event and notification actions
  addEvent: (event: DeviceEvent) => void;
  getEventsByDeviceId: (deviceId: string) => DeviceEvent[];
  addNotification: (notification: DeviceNotification) => void;
  getNotificationsByDeviceId: (deviceId: string) => DeviceNotification[];
  clearEvents: (deviceId?: string) => void;
  clearNotifications: (deviceId?: string) => void;
}

// TEMPORARY: Static mock devices for UI testing
const mockDevices: Device[] = [
  {
    id: 'device-001',
    uri: 'rtsp://example.com/stream1',
    isOnline: true,
    cryingThreshold: 70,
    sideThreshold: 45,
    proneThreshold: 40,
    noBlanketThreshold: 60,
    createdAt: new Date(2024, 3, 15),
    updatedAt: new Date(),
  },
  {
    id: 'device-002',
    uri: 'rtsp://example.com/stream2',
    isOnline: false,
    cryingThreshold: 65,
    sideThreshold: 50,
    proneThreshold: 35,
    noBlanketThreshold: 55,
    createdAt: new Date(2024, 2, 20),
    updatedAt: new Date(2024, 3, 10),
  },
  {
    id: 'device-003',
    uri: 'rtsp://example.com/stream3',
    isOnline: true,
    cryingThreshold: 75,
    sideThreshold: 40,
    proneThreshold: 45,
    noBlanketThreshold: 50,
    createdAt: new Date(2024, 3, 18),
    updatedAt: new Date(),
  },
];

// TEMPORARY: Mock events for testing
const mockEvents: DeviceEvent[] = [
  {
    id: 'event-001',
    deviceId: 'device-001',
    type: 'Crying',
    time: new Date(2024, 3, 20, 14, 30),
  },
  {
    id: 'event-002',
    deviceId: 'device-001',
    type: 'NoCrying',
    time: new Date(2024, 3, 20, 14, 35),
  },
  {
    id: 'event-003',
    deviceId: 'device-002',
    type: 'Side',
    time: new Date(2024, 3, 19, 21, 15),
  },
  {
    id: 'event-004',
    deviceId: 'device-003',
    type: 'Prone',
    time: new Date(2024, 3, 20, 9, 45),
  }
];

// TEMPORARY: Mock notifications for testing
const mockNotifications: DeviceNotification[] = [
  {
    id: 'notif-001',
    deviceId: 'device-001',
    type: 'Crying',
    duration: 300,
    time: new Date(2024, 3, 20, 14, 30),
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/crying1.jpg',
  },
  {
    id: 'notif-002',
    deviceId: 'device-002',
    type: 'Side',
    duration: 180,
    time: new Date(2024, 3, 19, 21, 15),
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/side1.jpg',
  },
  {
    id: 'notif-003',
    deviceId: 'device-003',
    type: 'Prone',
    duration: 240,
    time: new Date(2024, 3, 20, 9, 45),
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/prone1.jpg',
  }
];

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      // TEMPORARY: Using static mock data instead of empty arrays
      devices: mockDevices,
      events: mockEvents,
      notifications: mockNotifications,

      addDevice: (device) => 
        set((state) => {
          // Only add if device doesn't already exist
          if (!state.devices.some(d => d.id === device.id)) {
            return {
              devices: [...state.devices, device]
            };
          }
          return state;
        }),

      getDeviceById: (deviceId: string) => {
        const state = get();
        return state.devices.find(device => device.id === deviceId);
      },

      updateDevice: (deviceId: string, updates) =>
        set((state) => ({
          devices: state.devices.map(device => 
            device.id === deviceId 
              ? { ...device, ...updates, updatedAt: new Date() } 
              : device
          )
        })),

      clearAllDevices: () => set({ devices: [] }),
      
      // Event management
      addEvent: (event) => 
        set((state) => ({
          events: [...state.events, event]
        })),
        
      getEventsByDeviceId: (deviceId: string) => {
        const state = get();
        return state.events.filter(event => event.deviceId === deviceId);
      },
      
      // Notification management
      addNotification: (notification) => 
        set((state) => ({
          notifications: [...state.notifications, notification]
        })),
        
      getNotificationsByDeviceId: (deviceId: string) => {
        const state = get();
        return state.notifications.filter(notification => notification.deviceId === deviceId);
      },
      
      clearEvents: (deviceId) => 
        set((state) => {
          if (deviceId) {
            return {
              events: state.events.filter(event => event.deviceId !== deviceId)
            };
          }
          return { events: [] };
        }),
        
      clearNotifications: (deviceId) => 
        set((state) => {
          if (deviceId) {
            return {
              notifications: state.notifications.filter(notification => notification.deviceId !== deviceId)
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
