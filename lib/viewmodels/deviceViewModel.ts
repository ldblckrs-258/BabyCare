import { ConnectionService } from '@/lib/models/connectionService';
import { DeviceService } from '@/lib/models/deviceService';
import { useAuthStore } from '@/stores/authStore';
import { Connection, useConnectionStore } from '@/stores/connectionStore';
import { Device, useDeviceStore } from '@/stores/deviceStore';

/**
 * ViewModel for device operations following MVVM pattern
 * Handles business logic for device and connection operations
 */
export class DeviceViewModel {
  private deviceStore = useDeviceStore.getState();
  private connectionStore = useConnectionStore.getState();
  private authStore = useAuthStore.getState();

  private setLoading: (loading: boolean) => void;
  private setError: (error: string | null) => void;

  constructor(setLoading: (loading: boolean) => void, setError: (error: string | null) => void) {
    this.setLoading = setLoading;
    this.setError = setError;

    // Subscribe to store changes
    useDeviceStore.subscribe((state) => (this.deviceStore = state));
    useConnectionStore.subscribe((state) => (this.connectionStore = state));
    useAuthStore.subscribe((state) => (this.authStore = state));
  }

  /**
   * Get all devices from the store
   */
  get devices(): Device[] {
    return this.deviceStore.devices;
  }

  /**
   * Get all connections from the store
   */
  get connections(): Connection[] {
    return this.connectionStore.connections;
  }

  /**
   * Get currently selected connection ID
   */
  get selectedConnectionId(): string | undefined {
    return this.connectionStore.selectedConnectionId;
  }

  /**
   * Check if user is connected to any device
   */
  get isConnected(): boolean {
    return this.connectionStore.isConnected;
  }

  /**
   * Get device details by ID
   */
  getDevice(deviceId: string): Device | undefined {
    return this.deviceStore.getDeviceById(deviceId);
  }

  /**
   * Get connection details by ID
   */
  getConnection(connectionId: string): Connection | undefined {
    return this.connectionStore.connections.find((connection) => connection.id === connectionId);
  }

  /**
   * Get connection by device ID
   */
  getConnectionByDeviceId(deviceId: string): Connection | undefined {
    return this.connectionStore.getConnectionByDeviceId(deviceId);
  }

  /**
   * Connect to a device (create a new connection)
   */
  async connectDevice(deviceId: string, name?: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      if (!this.authStore.user) {
        throw new Error('User not authenticated');
      }

      // Check if a connection to this device already exists for this user
      const existingConnection = this.connectionStore.getConnectionByDeviceId(deviceId);
      if (existingConnection) {
        this.setLoading(false);
        return;
      }

      // Create or update device in Firestore
      // const device = await DeviceService.createOrUpdateDevice(deviceId);

      // Create a new connection
      await ConnectionService.createConnection(
        this.authStore.user.uid,
        deviceId,
        name || `Device ${this.connectionStore.connections.length + 1}`
      );

      // Add to local connection store
      // this.connectionStore.addConnection(newConnection);
    } catch (err) {
      console.error('Error connecting device:', err);
      this.setError('Failed to connect device');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Disconnect a device (remove the connection)
   */
  async disconnectDevice(connectionId: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Remove from Firestore
      await ConnectionService.deleteConnection(connectionId);

      // Remove from local connection store
      this.connectionStore.removeConnection(connectionId);
    } catch (err) {
      console.error('Error disconnecting device:', err);
      this.setError('Failed to disconnect device');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Rename a connection
   */
  async renameConnection(connectionId: string, name: string): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Update in Firestore
      await ConnectionService.updateConnection(connectionId, {
        name,
        updatedAt: new Date(),
      });

      // Update in local connection store
      this.connectionStore.updateConnection(connectionId, { name });
    } catch (err) {
      console.error('Error renaming connection:', err);
      this.setError('Failed to rename connection');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update device thresholds
   */
  async updateDeviceThresholds(deviceId: string, updates: Partial<Device>): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Update in Firestore
      await DeviceService.updateDevice(deviceId, updates);

      // Update in local device store
      this.deviceStore.updateDevice(deviceId, updates);
    } catch (err) {
      console.error('Error updating device thresholds:', err);
      this.setError('Failed to update thresholds');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Select connection
   */
  selectConnection(connectionId: string): void {
    this.connectionStore.selectConnection(connectionId);
  }

  /**
   * Clear all data from stores
   */
  clearAll(): void {
    this.deviceStore.clearAllDevices();
    this.connectionStore.clearAllConnections();
  }
  /**
   * Setup data listeners for the current user
   */
  setupDataListeners(userId: string): () => void {
    let devicesUnsubscribe: (() => void) | undefined;
    let connectionsUnsubscribe: (() => void) | undefined;

    const setupListeners = async () => {
      try {
        // Get user connections first
        const userConnections = await ConnectionService.getUserConnections(userId);

        // Extract device IDs from user connections
        const userDeviceIds = userConnections.map((conn) => conn.deviceId);

        // Setup device listeners
        if (userDeviceIds.length > 0) {
          devicesUnsubscribe = DeviceService.listenToDevices(userDeviceIds, (device) => {
            // Check if the device already exists in the store
            const existingDevice = this.deviceStore.getDeviceById(device.id);

            if (!existingDevice) {
              // Add new device if it doesn't exist
              this.deviceStore.addDevice(device);
            } else {
              // Update existing device to prevent duplicate keys
              this.deviceStore.updateDevice(device.id, device);
            }
          });
        }
        // Setup connections listener
        connectionsUnsubscribe = ConnectionService.listenToUserConnections(
          userId,
          (connection) => {
            // Check if connection already exists before adding
            const existingConnection = this.connectionStore.connections.find(
              (conn) => conn.id === connection.id
            );
            if (!existingConnection) {
              this.connectionStore.addConnection(connection);
            }
          },
          (connection) => this.connectionStore.updateConnection(connection.id, connection),
          (connectionId) => this.connectionStore.removeConnection(connectionId)
        );

        // Select the first connection if none is selected
        if (!this.connectionStore.selectedConnectionId && userConnections.length > 0) {
          this.connectionStore.selectConnection(userConnections[0].id);
        }
      } catch (err) {
        console.error('Error setting up data listeners:', err);
        this.setError('Failed to load data');
      }
    };

    // Initialize listeners
    setupListeners();

    // Return cleanup function
    return () => {
      if (devicesUnsubscribe) devicesUnsubscribe();
      if (connectionsUnsubscribe) connectionsUnsubscribe();
    };
  }
}
