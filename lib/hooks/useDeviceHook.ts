import { Device, useDeviceStore } from '@/stores/deviceStore';
import { Connection, useConnectionStore } from '@/stores/connectionStore';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DeviceViewModel } from '@/lib/viewmodels/deviceViewModel';

export type DeviceWithConnection = {
  device: Device;
  connection: Connection;
};

/**
 * Hook for device management following MVVC pattern
 * Provides functions to interact with device and connection data both locally and in Firestore
 */
export interface DeviceHookReturn {
  devices: Device[];
  connections: Connection[];
  connectedDevices: DeviceWithConnection[];
  selectedConnectionId?: string;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  getDevice: (deviceId: string) => Device | undefined;
  getConnection: (connectionId: string) => Connection | undefined;
  getConnectionByDeviceId: (deviceId: string) => Connection | undefined;
  connectDevice: (deviceId: string, name?: string) => Promise<void>;
  disconnectDevice: (connectionId: string) => Promise<void>;
  renameConnection: (connectionId: string, name: string) => Promise<void>;
  updateDeviceThresholds: (deviceId: string, updates: Partial<Device>) => Promise<void>;
  selectConnection: (connectionId: string) => void;
  clearAll: () => void;
}

export const useDeviceHook = (): DeviceHookReturn => {
  const authStore = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Access Zustand stores directly for realtime updates
  // This ensures components using this hook will re-render when store data changes
  const deviceStore = useDeviceStore();
  const connectionStore = useConnectionStore();
  
  // Create the view model instance using useRef to ensure it persists between renders
  const viewModelRef = useRef<DeviceViewModel | null>(null);
  if (!viewModelRef.current) {
    viewModelRef.current = new DeviceViewModel(setLoading, setError);
  }
  const viewModel = viewModelRef.current;
  
  // Load data from Firestore and set up listeners when auth state changes
  useEffect(() => {
    if (!authStore.user) return;
    
    setLoading(true);
    
    // Set up data listeners for the current user
    const unsubscribe = viewModel.setupDataListeners(authStore.user.uid);
    
    setLoading(false);
    
    // Clean up listeners when the component unmounts or auth state changes
    return unsubscribe;
  }, [authStore.user]);
    // Calculate connectedDevices in real-time based on current connections and devices
  const connectedDevices = connectionStore.connections
    .map((connection) => {
      const device = deviceStore.getDeviceById(connection.deviceId);
      if (device) {
        return {
          device,
          connection,
        };
      }
      return null;
    })
    .filter((item): item is DeviceWithConnection => item !== null);

  return {
    // Return realtime data directly from Zustand stores
    devices: deviceStore.devices,
    connections: connectionStore.connections,
    connectedDevices,
    selectedConnectionId: connectionStore.selectedConnectionId,
    isConnected: connectionStore.isConnected,
    loading,
    error,
    getDevice: (deviceId: string) => deviceStore.getDeviceById(deviceId),
    getConnection: (connectionId: string) => connectionStore.connections.find(conn => conn.id === connectionId),
    getConnectionByDeviceId: (deviceId: string) => connectionStore.getConnectionByDeviceId(deviceId),
    connectDevice: (deviceId: string, name?: string) => viewModel.connectDevice(deviceId, name),
    disconnectDevice: (connectionId: string) => viewModel.disconnectDevice(connectionId),
    renameConnection: (connectionId: string, name: string) => viewModel.renameConnection(connectionId, name),
    updateDeviceThresholds: (deviceId: string, updates: Partial<Device>) => viewModel.updateDeviceThresholds(deviceId, updates),
    selectConnection: (connectionId: string) => connectionStore.selectConnection(connectionId),
    clearAll: () => {
      deviceStore.clearAllDevices();
      connectionStore.clearAllConnections();
    }
  };
};
