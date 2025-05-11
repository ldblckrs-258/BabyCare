import { Device } from '@/stores/deviceStore';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

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
      const firestore = getFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);

      if (!deviceSnap.exists) {
        return null;
      }
      const deviceData = deviceSnap.data() as Device;
      return {
        id: deviceSnap.id,
        uri: deviceData.uri || '',
        isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
        cryingThreshold: deviceData.cryingThreshold,
        sideThreshold: deviceData.sideThreshold,
        proneThreshold: deviceData.proneThreshold,
        noBlanketThreshold: deviceData.noBlanketThreshold,
      };
    } catch (err) {
      console.error('Error fetching device:', err);
      throw err;
    }
  }

  /**
   * Create a new device or update if it already exists
   */
  static async createOrUpdateDevice(
    deviceId: string,
    deviceData?: Partial<Device>
  ): Promise<Device> {
    try {
      const firestore = getFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);
      if (!deviceSnap.exists) {
        // Create new device
        const newDevice: Device = {
          id: deviceId,
          uri: deviceData?.uri || '',
          isOnline: deviceData?.isOnline !== undefined ? deviceData.isOnline : true,
          cryingThreshold: DEFAULT_CRYING_THRESHOLD,
          sideThreshold: DEFAULT_POSITION_THRESHOLD,
          proneThreshold: DEFAULT_POSITION_THRESHOLD,
          noBlanketThreshold: DEFAULT_POSITION_THRESHOLD,
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
          cryingThreshold: existingData.cryingThreshold,
          sideThreshold: existingData.sideThreshold,
          proneThreshold: existingData.proneThreshold,
          noBlanketThreshold: existingData.noBlanketThreshold,
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
      const firestore = getFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);
      await updateDoc(deviceRef, {
        ...updates,
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
    const firestore = getFirestore();
    const devicesCol = collection(firestore, 'devices');
    const q = query(devicesCol, where('__name__', 'in', deviceIds));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot) {
          console.warn('DeviceService: received null snapshot in listenToDevices');
          return;
        }

        snapshot.docChanges().forEach((change) => {
          const deviceData = change.doc.data() as Device;
          if (change.type === 'added' || change.type === 'modified') {
            const device: Device = {
              id: change.doc.id,
              uri: deviceData.uri || '',
              isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
              cryingThreshold: deviceData.cryingThreshold,
              sideThreshold: deviceData.sideThreshold,
              proneThreshold: deviceData.proneThreshold,
              noBlanketThreshold: deviceData.noBlanketThreshold,
            };
            onUpdate(device);
          }
        });
      },
      (error) => {
        // Xử lý lỗi trong onSnapshot
        if ((error as any).code === 'firestore/permission-denied') {
          console.warn(
            'DeviceService: Permission denied in listenToDevices. User likely logged out.'
          );
          // Trả về silence - không thông báo lỗi này vì đây là lỗi thường gặp khi logout
          return;
        }
        console.error('DeviceService listener error:', error);
      }
    );
  }
}
