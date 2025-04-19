import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Device } from './deviceStore';

export interface Connection {
  id: string;         // Unique connection ID
  userId: string;     // Reference to the user
  deviceId: string;   // Reference to the device
  name: string;       // Friendly name set by the user
  createdAt: Date;
  updatedAt?: Date;
}

interface ConnectionState {
  connections: Connection[];
  selectedConnectionId?: string;
  isConnected: boolean;
  
  // Connection management actions
  addConnection: (connection: Connection) => void;
  removeConnection: (connectionId: string) => void;
  updateConnection: (connectionId: string, updates: Partial<Connection>) => void;
  selectConnection: (connectionId: string) => void;
  setConnectionStatus: (isConnected: boolean, connectionId?: string) => void;
  getConnectionByDeviceId: (deviceId: string) => Connection | undefined;
  clearAllConnections: () => void;
}

// TEMPORARY: Static mock connections for UI testing
const mockConnections: Connection[] = [
  {
    id: 'conn-001',
    userId: 'user-001',
    deviceId: 'device-001',
    name: 'Baby Room Camera',
    createdAt: new Date(2024, 3, 15),
    updatedAt: new Date()
  },
  {
    id: 'conn-002',
    userId: 'user-001',
    deviceId: 'device-002',
    name: 'Living Room Monitor', 
    createdAt: new Date(2024, 2, 20),
    updatedAt: new Date(2024, 3, 10)
  },
  {
    id: 'conn-003',
    userId: 'user-001',
    deviceId: 'device-003',
    name: 'Nursery Camera',
    createdAt: new Date(2024, 3, 18),
    updatedAt: new Date()
  }
];

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      // TEMPORARY: Using static mock connections instead of empty array
      connections: mockConnections,
      selectedConnectionId: mockConnections.length > 0 ? mockConnections[0].id : undefined,
      isConnected: mockConnections.length > 0,

      addConnection: (connection) => 
        set((state) => ({
          connections: [...state.connections, connection],
          isConnected: true,
          selectedConnectionId: connection.id
        })),

      removeConnection: (connectionId) =>
        set((state) => {
          const updatedConnections = state.connections.filter(conn => conn.id !== connectionId);
          return { 
            connections: updatedConnections,
            isConnected: updatedConnections.length > 0,
            selectedConnectionId: updatedConnections.length > 0 ? updatedConnections[0].id : undefined
          };
        }),

      updateConnection: (connectionId, updates) =>
        set((state) => ({
          connections: state.connections.map(connection => 
            connection.id === connectionId 
              ? { ...connection, ...updates, updatedAt: new Date() } 
              : connection
          )
        })),
        
      selectConnection: (connectionId) => 
        set((state) => {
          const connection = state.connections.find(c => c.id === connectionId);
          if (connection) {
            return { selectedConnectionId: connectionId };
          }
          return state;
        }),

      setConnectionStatus: (isConnected, connectionId = undefined) =>
        set((state) => {
          if (connectionId) {
            return { 
              isConnected, 
              selectedConnectionId: isConnected ? connectionId : undefined
            };
          }
          return { isConnected, selectedConnectionId: isConnected ? state.selectedConnectionId : undefined };
        }),
        
      getConnectionByDeviceId: (deviceId: string) => {
        const state = get();
        return state.connections.find(connection => connection.deviceId === deviceId);
      },

      clearAllConnections: () => set({ connections: [], selectedConnectionId: undefined, isConnected: false }),

      /* Original implementation (commented for development)
      connections: [],
      selectedConnectionId: undefined,
      isConnected: false,

      addConnection: (connection) => 
        set((state) => ({
          connections: [...state.connections, connection],
          isConnected: true,
          selectedConnectionId: connection.id
        })),

      removeConnection: (connectionId) =>
        set((state) => {
          const updatedConnections = state.connections.filter(conn => conn.id !== connectionId);
          return { 
            connections: updatedConnections,
            isConnected: updatedConnections.length > 0,
            selectedConnectionId: updatedConnections.length > 0 ? updatedConnections[0].id : undefined
          };
        }),

      updateConnection: (connectionId, updates) =>
        set((state) => ({
          connections: state.connections.map(connection => 
            connection.id === connectionId 
              ? { ...connection, ...updates, updatedAt: new Date() } 
              : connection
          )
        })),
        
      selectConnection: (connectionId) => 
        set((state) => {
          const connection = state.connections.find(c => c.id === connectionId);
          if (connection) {
            return { selectedConnectionId: connectionId };
          }
          return state;
        }),

      setConnectionStatus: (isConnected, connectionId = undefined) =>
        set((state) => {
          if (connectionId) {
            return { 
              isConnected, 
              selectedConnectionId: isConnected ? connectionId : undefined
            };
          }
          return { isConnected, selectedConnectionId: isConnected ? state.selectedConnectionId : undefined };
        }),
        
      getConnectionByDeviceId: (deviceId: string) => {
        const state = get();
        return state.connections.find(connection => connection.deviceId === deviceId);
      },
      */
    }),
    {
      name: 'babycare-connections',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
