import { FirestoreService } from './firestoreService';
import { Device } from '@/stores/deviceStore';
import {
  collection,
  doc,
  getDoc,
  getDocs,
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
  private static firestoreService = FirestoreService.getInstance();

  /**
   * Fetch a device by ID
   */
  static async getDevice(deviceId: string): Promise<Device | null> {
    if (!deviceId) {
      console.warn('DeviceService.getDevice called without deviceId');
      return null;
    }

    // Try to get device from cache first
    const cacheKey = FirestoreService.documentCacheKey('devices', deviceId);
    const cachedDevice = this.firestoreService.getFromCache<Device>(cacheKey);
    if (cachedDevice) {
      return cachedDevice;
    }

    try {
      const firestore = this.firestoreService.getFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);

      if (!deviceSnap.exists) {
        return null;
      }
      const deviceData = deviceSnap.data() as Device;
      const device = {
        id: deviceSnap.id,
        uri: deviceData.uri || '',
        isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
        cryingThreshold: deviceData.cryingThreshold,
        sideThreshold: deviceData.sideThreshold,
        proneThreshold: deviceData.proneThreshold,
        noBlanketThreshold: deviceData.noBlanketThreshold,
      };

      // Cache the device data
      this.firestoreService.setInCache(cacheKey, device);
      return device;
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
    // Check cache first
    const cacheKey = FirestoreService.documentCacheKey('devices', deviceId);

    try {
      const firestore = this.firestoreService.getFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);

      // Try to get from cache first
      const cachedDevice = this.firestoreService.getFromCache<Device>(cacheKey);
      if (cachedDevice) {
        // If device exists in cache and we're not updating, return the cached version
        if (!deviceData || Object.keys(deviceData).length === 0) {
          return cachedDevice;
        }
      }

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

        // Cache the new device
        this.firestoreService.setInCache(cacheKey, newDevice);
        return newDevice;
      } else {
        // Return existing device data
        const existingData = deviceSnap.data() as Device;
        const device = {
          id: deviceId,
          uri: existingData.uri || '',
          isOnline: existingData.isOnline !== undefined ? existingData.isOnline : true,
          cryingThreshold: existingData.cryingThreshold,
          sideThreshold: existingData.sideThreshold,
          proneThreshold: existingData.proneThreshold,
          noBlanketThreshold: existingData.noBlanketThreshold,
        };

        // Cache the device
        this.firestoreService.setInCache(cacheKey, device);
        return device;
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
      const firestore = this.firestoreService.getFirestore();
      const deviceRef = doc(firestore, 'devices', deviceId);
      await updateDoc(deviceRef, {
        ...updates,
      });

      // Update device in cache
      const cacheKey = FirestoreService.documentCacheKey('devices', deviceId);
      const cachedDevice = this.firestoreService.getFromCache<Device>(cacheKey);
      if (cachedDevice) {
        const updatedDevice = { ...cachedDevice, ...updates };
        this.firestoreService.setInCache(cacheKey, updatedDevice);
      }
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

    // Create cache key for this query
    const queryCacheKey = FirestoreService.queryCacheKey('devices', { ids: deviceIds });

    const firestore = this.firestoreService.getFirestore();
    const devicesCol = collection(firestore, 'devices');
    const q = query(devicesCol, where('__name__', 'in', deviceIds));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot) {
          console.warn('DeviceService: received null snapshot in listenToDevices');
          return;
        }

        // Keep track of all current devices for this query
        const currentDevices: Record<string, Device> = {};

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

            // Cache individual device
            const docCacheKey = FirestoreService.documentCacheKey('devices', device.id);
            this.firestoreService.setInCache(docCacheKey, device);

            // Update the current devices map
            currentDevices[device.id] = device;

            onUpdate(device);
          }
        });

        // Store the complete set of devices in the query cache
        if (Object.keys(currentDevices).length > 0) {
          this.firestoreService.setInCache(queryCacheKey, Object.values(currentDevices));
        }
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

  /**
   * Batch fetch multiple devices by IDs
   * Optimizes by reducing individual Firestore calls
   */
  static async batchGetDevices(deviceIds: string[]): Promise<Device[]> {
    if (!deviceIds || deviceIds.length === 0) {
      return [];
    }

    // First get cached devices
    const cachedDevices: Record<string, Device> = {};
    const uncachedDeviceIds: string[] = [];

    // Check which devices are in cache
    deviceIds.forEach((id) => {
      const cacheKey = FirestoreService.documentCacheKey('devices', id);
      const cachedDevice = this.firestoreService.getFromCache<Device>(cacheKey);

      if (cachedDevice) {
        cachedDevices[id] = cachedDevice;
      } else {
        uncachedDeviceIds.push(id);
      }
    });

    // If all devices are cached, return them
    if (uncachedDeviceIds.length === 0) {
      return Object.values(cachedDevices);
    }

    // Otherwise fetch missing devices
    try {
      const firestore = this.firestoreService.getFirestore();

      // Use Firestore "in" query if there are multiple devices to fetch
      if (uncachedDeviceIds.length > 1) {
        const devicesCol = collection(firestore, 'devices');
        const q = query(devicesCol, where('__name__', 'in', uncachedDeviceIds));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc: any) => {
          const deviceData = doc.data() as Device;
          const device = {
            id: doc.id,
            uri: deviceData.uri || '',
            isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
            cryingThreshold: deviceData.cryingThreshold,
            sideThreshold: deviceData.sideThreshold,
            proneThreshold: deviceData.proneThreshold,
            noBlanketThreshold: deviceData.noBlanketThreshold,
          };

          // Cache the device
          const cacheKey = FirestoreService.documentCacheKey('devices', device.id);
          this.firestoreService.setInCache(cacheKey, device);

          // Add to result
          cachedDevices[device.id] = device;
        });
      }
      // For single device, use direct get
      else if (uncachedDeviceIds.length === 1) {
        const deviceId = uncachedDeviceIds[0];
        const deviceRef = doc(firestore, 'devices', deviceId);
        const deviceSnap = await getDoc(deviceRef);

        if (deviceSnap.exists) {
          const deviceData = deviceSnap.data() as Device;
          const device = {
            id: deviceSnap.id,
            uri: deviceData.uri || '',
            isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
            cryingThreshold: deviceData.cryingThreshold,
            sideThreshold: deviceData.sideThreshold,
            proneThreshold: deviceData.proneThreshold,
            noBlanketThreshold: deviceData.noBlanketThreshold,
          };

          // Cache the device
          const cacheKey = FirestoreService.documentCacheKey('devices', device.id);
          this.firestoreService.setInCache(cacheKey, device);

          // Add to result
          cachedDevices[device.id] = device;
        }
      }

      // Return all devices (both cached and newly fetched)
      return Object.values(cachedDevices);
    } catch (err) {
      console.error('Error batch fetching devices:', err);
      // Return whatever we have from cache
      return Object.values(cachedDevices);
    }
  }
}
