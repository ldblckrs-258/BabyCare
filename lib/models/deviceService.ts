import { doc, getDoc, setDoc, updateDoc, query, where, collection, onSnapshot, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Device } from '@/stores/deviceStore';

const DEFAULT_CRYING_THRESHOLD = 60; // secs
const DEFAULT_POSITION_THRESHOLD = 30; // secs

/**
 * Service class for Device-related Firebase operations
 */
export class DeviceService {
  /**
   * Fetch a device by ID
   */
  static async getDevice(deviceId: string): Promise<Device | null> {
    try {
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (!deviceSnap.exists()) {
        return null;
      }
      
      const deviceData = deviceSnap.data() as Device;
      return {
        id: deviceData.id,
        uri: deviceData.uri || '',
        isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
        cryingThreshold: deviceData.cryingThreshold || DEFAULT_CRYING_THRESHOLD,
        sideThreshold: deviceData.sideThreshold || DEFAULT_POSITION_THRESHOLD,
        proneThreshold: deviceData.proneThreshold || DEFAULT_POSITION_THRESHOLD,
        noBlanketThreshold: deviceData.noBlanketThreshold || DEFAULT_POSITION_THRESHOLD,
        createdAt: deviceData.createdAt ? new Date(deviceData.createdAt) : new Date(),
        updatedAt: deviceData.updatedAt ? new Date(deviceData.updatedAt) : undefined
      };
    } catch (err) {
      console.error('Error fetching device:', err);
      throw err;
    }
  }

  /**
   * Create a new device or update if it already exists
   */
  static async createOrUpdateDevice(deviceId: string, deviceData?: Partial<Device>): Promise<Device> {
    try {
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (!deviceSnap.exists()) {
        // Create new device
        const newDevice: Device = {
          id: deviceId,
          uri: deviceData?.uri || '',
          isOnline: deviceData?.isOnline !== undefined ? deviceData.isOnline : true,
          cryingThreshold: deviceData?.cryingThreshold || DEFAULT_CRYING_THRESHOLD,
          sideThreshold: deviceData?.sideThreshold || DEFAULT_POSITION_THRESHOLD,
          proneThreshold: deviceData?.proneThreshold || DEFAULT_POSITION_THRESHOLD,
          noBlanketThreshold: deviceData?.noBlanketThreshold || DEFAULT_POSITION_THRESHOLD,
          createdAt: new Date()
        };
        
        await setDoc(deviceRef, newDevice);
        return newDevice;
      } else {
        // Return existing device data
        const existingData = deviceSnap.data() as Device;
        return {
          id: deviceId,
          uri: existingData.uri || '',
          isOnline: existingData.isOnline !== undefined ? existingData.isOnline : true,
          cryingThreshold: existingData.cryingThreshold || DEFAULT_CRYING_THRESHOLD,
          sideThreshold: existingData.sideThreshold || DEFAULT_POSITION_THRESHOLD,
          proneThreshold: existingData.proneThreshold || DEFAULT_POSITION_THRESHOLD,
          noBlanketThreshold: existingData.noBlanketThreshold || DEFAULT_POSITION_THRESHOLD,
          createdAt: existingData.createdAt ? new Date(existingData.createdAt) : new Date(),
          updatedAt: existingData.updatedAt ? new Date(existingData.updatedAt) : undefined
        };
      }
    } catch (err) {
      console.error('Error creating/updating device:', err);
      throw err;
    }
  }

  /**
   * Update device properties
   */
  static async updateDevice(deviceId: string, updates: Partial<Device>): Promise<void> {
    try {
      const deviceRef = doc(firestore, 'devices', deviceId);
      await updateDoc(deviceRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error updating device:', err);
      throw err;
    }
  }

  /**
   * Setup a listener for multiple devices
   * @returns Function to unsubscribe
   */
  static listenToDevices(deviceIds: string[], onUpdate: (device: Device) => void): () => void {
    if (deviceIds.length === 0) {
      return () => {}; // No-op if no device IDs
    }
    
    const devicesQuery = query(
      collection(firestore, 'devices'),
      where('id', 'in', deviceIds)
    );
    
    return onSnapshot(devicesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const deviceData = change.doc.data() as Device;
        
        if (change.type === 'added' || change.type === 'modified') {
          const device: Device = {
            id: deviceData.id,
            uri: deviceData.uri || '',
            isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
            cryingThreshold: deviceData.cryingThreshold || DEFAULT_CRYING_THRESHOLD,
            sideThreshold: deviceData.sideThreshold || DEFAULT_POSITION_THRESHOLD,
            proneThreshold: deviceData.proneThreshold || DEFAULT_POSITION_THRESHOLD,
            noBlanketThreshold: deviceData.noBlanketThreshold || DEFAULT_POSITION_THRESHOLD,
            createdAt: deviceData.createdAt ? new Date(deviceData.createdAt) : new Date(),
            updatedAt: deviceData.updatedAt ? new Date(deviceData.updatedAt) : undefined
          };
          
          onUpdate(device);
        }
      });
    });
  }
}

export { DEFAULT_CRYING_THRESHOLD, DEFAULT_POSITION_THRESHOLD };
