import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Device {
  id: string;
  status: string; // online/offline
  cryingThreshold: number;
  positionThreshold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeviceState {
  devices: Device[];
  
  // Device management actions
  addDevice: (device: Device) => void;
  getDeviceById: (deviceId: string) => Device | undefined;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  clearAllDevices: () => void;
  // Devices are not removed, just the connection to them
}

// TEMPORARY: Static mock devices for UI testing
const mockDevices: Device[] = [
  {
    id: 'device-001',
    status: 'online',
    cryingThreshold: 70,
    positionThreshold: 45,
    createdAt: new Date(2024, 3, 15),
    updatedAt: new Date(),
  },
  {
    id: 'device-002',
    status: 'offline',
    cryingThreshold: 65,
    positionThreshold: 50,
    createdAt: new Date(2024, 2, 20),
    updatedAt: new Date(2024, 3, 10),
  },
  {
    id: 'device-003',
    status: 'online',
    cryingThreshold: 75,
    positionThreshold: 40,
    createdAt: new Date(2024, 3, 18),
    updatedAt: new Date(),
  },
];

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      // TEMPORARY: Using static mock devices instead of empty array
      devices: mockDevices,

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

      /* Original implementation (commented for development)
      devices: [],

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
      */
    }),
    {
      name: 'babycare-devices',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
