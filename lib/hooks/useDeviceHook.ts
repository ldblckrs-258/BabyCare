import { Device, useDeviceStore } from '@/stores/deviceStore';
import { Connection, useConnectionStore } from '@/stores/connectionStore';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CRYING_THRESHOLD = 60; // secs
const DEFAULT_POSITION_THRESHOLD = 30; // secs

/**
 * Hook for device management following MVVM pattern
 * Provides functions to interact with device and connection data both locally and in Firestore
 */
export interface DeviceHookReturn {
  devices: Device[];
  connections: Connection[];
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
  const deviceStore = useDeviceStore();
  const connectionStore = useConnectionStore();
  const authStore = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get device details
  const getDevice = (deviceId: string): Device | undefined => {
    return deviceStore.getDeviceById(deviceId);
  };

  // Get connection details
  const getConnection = (connectionId: string): Connection | undefined => {
    return connectionStore.connections.find(connection => connection.id === connectionId);
  };

  // Get connection by device ID
  const getConnectionByDeviceId = (deviceId: string): Connection | undefined => {
    return connectionStore.getConnectionByDeviceId(deviceId);
  };

  // Connect to a device (create a new connection)
  const connectDevice = async (deviceId: string, name?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!authStore.user) {
        throw new Error('User not authenticated');
      }
      
      // Check if device exists in Firestore, if not create it
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (!deviceSnap.exists()) {        // Create the device in Firestore
        const newDevice: Device = {
          id: deviceId,
          uri: '',
          isOnline: true,
          cryingThreshold: DEFAULT_CRYING_THRESHOLD,
          sideThreshold: DEFAULT_POSITION_THRESHOLD,
          proneThreshold: DEFAULT_POSITION_THRESHOLD,
          noBlanketThreshold: DEFAULT_POSITION_THRESHOLD,
          createdAt: new Date()
        };
        
        await setDoc(deviceRef, newDevice);
        
        // Add to local device store
        deviceStore.addDevice(newDevice);      } else {
        // Device exists, update local store if needed
        const deviceData = deviceSnap.data() as Device;
        deviceStore.addDevice({
          id: deviceId,
          uri: deviceData.uri || '',
          isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
          cryingThreshold: deviceData.cryingThreshold || DEFAULT_CRYING_THRESHOLD,
          sideThreshold: deviceData.sideThreshold || DEFAULT_POSITION_THRESHOLD,
          proneThreshold: deviceData.proneThreshold || DEFAULT_POSITION_THRESHOLD,
          noBlanketThreshold: deviceData.noBlanketThreshold || DEFAULT_POSITION_THRESHOLD,
          createdAt: deviceData.createdAt ? new Date(deviceData.createdAt) : new Date(),
          updatedAt: deviceData.updatedAt ? new Date(deviceData.updatedAt) : undefined
        });
      }
      
      // Create a new connection
      const connectionId = uuidv4();
      const newConnection: Connection = {
        id: connectionId,
        userId: authStore.user.uid,
        deviceId: deviceId,
        name: name || `Device ${connectionStore.connections.length + 1}`,
        createdAt: new Date()
      };
      
      // Add connection to Firestore
      const connectionRef = doc(firestore, 'connections', connectionId);
      await setDoc(connectionRef, newConnection);
      
      // Add to local connection store
      connectionStore.addConnection(newConnection);
      
      setLoading(false);
    } catch (err) {
      console.error('Error connecting device:', err);
      setError('Failed to connect device');
      setLoading(false);
    }
  };

  // Disconnect a device (remove the connection)
  const disconnectDevice = async (connectionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove from Firestore
      const connectionRef = doc(firestore, 'connections', connectionId);
      await deleteDoc(connectionRef);
      
      // Remove from local connection store
      connectionStore.removeConnection(connectionId);
      
      setLoading(false);
    } catch (err) {
      console.error('Error disconnecting device:', err);
      setError('Failed to disconnect device');
      setLoading(false);
    }
  };

  // Rename a connection
  const renameConnection = async (connectionId: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update in Firestore
      const connectionRef = doc(firestore, 'connections', connectionId);
      await updateDoc(connectionRef, {
        name,
        updatedAt: new Date()
      });
      
      // Update in local connection store
      connectionStore.updateConnection(connectionId, { name });
      
      setLoading(false);
    } catch (err) {
      console.error('Error renaming connection:', err);
      setError('Failed to rename connection');
      setLoading(false);
    }
  };

  // Update device thresholds
  const updateDeviceThresholds = async (deviceId: string, updates: Partial<Device>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update in Firestore
      const deviceRef = doc(firestore, 'devices', deviceId);
      await updateDoc(deviceRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Update in local device store
      deviceStore.updateDevice(deviceId, updates);
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating device thresholds:', err);
      setError('Failed to update thresholds');
      setLoading(false);
    }
  };

  // Select connection
  const selectConnection = (connectionId: string) => {
    connectionStore.selectConnection(connectionId);
  };

  const clearAll = () => {
    deviceStore.clearAllDevices();
    connectionStore.clearAllConnections();
  }

  return {
    devices: deviceStore.devices,
    connections: connectionStore.connections,
    selectedConnectionId: connectionStore.selectedConnectionId,
    isConnected: connectionStore.isConnected,
    loading,
    error,
    getDevice,
    getConnection,
    getConnectionByDeviceId,
    connectDevice,
    disconnectDevice,
    renameConnection,
    updateDeviceThresholds,
    selectConnection,
    clearAll
  };
};
