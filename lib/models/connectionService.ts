import { FirestoreService } from './firestoreService';
import { Connection, useConnectionStore } from '@/stores/connectionStore';
import { useDeviceStore } from '@/stores/deviceStore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service class for Connection-related Firebase operations
 */
export class ConnectionService {
  private static firestoreService = FirestoreService.getInstance();

  /**
   * Fetch all connections for a user
   */
  static async getUserConnections(userId: string): Promise<Connection[]> {
    if (!userId) {
      console.warn('ConnectionService.getUserConnections called without userId');
      return Promise.resolve([]); // Return empty array if no userId
    }

    // Check cache first
    const cacheKey = FirestoreService.queryCacheKey('connections', { userId });
    const cachedConnections = this.firestoreService.getFromCache<Connection[]>(cacheKey);
    if (cachedConnections) {
      return cachedConnections;
    }

    try {
      const firestore = this.firestoreService.getFirestore();
      const connectionsQuery = query(
        collection(firestore, 'connections'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(connectionsQuery);

      const connections = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id,
          userId: data.userId,
          deviceId: data.deviceId,
          name: data.name,
        } as Connection;
      });

      // Cache the result
      this.firestoreService.setInCache(cacheKey, connections);
      return connections;
    } catch (err) {
      console.error('Error fetching user connections:', err);
      return [];
    }
  }

  /**
   * Create a new connection
   */
  static async createConnection(
    userId: string,
    deviceId: string,
    name?: string
  ): Promise<Connection> {
    const firestore = this.firestoreService.getFirestore();

    // Check device existence from cache first
    const deviceCacheKey = FirestoreService.documentCacheKey('devices', deviceId);
    const cachedDevice = this.firestoreService.getFromCache(deviceCacheKey);

    if (!cachedDevice) {
      // If not in cache, check Firestore
      const deviceRef = doc(firestore, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);
      if (!deviceSnap.exists) {
        throw new Error('Thiết bị không tồn tại trên hệ thống.');
      }
      // Cache the device data
      this.firestoreService.setInCache(deviceCacheKey, deviceSnap.data());
    }

    try {
      const connectionId = uuidv4();
      const newConnection: Connection = {
        id: connectionId,
        userId: userId,
        deviceId: deviceId,
        name: name || `Device ${Date.now()}`,
        createdAt: new Date(),
      };

      // Add connection to Firestore
      const connectionRef = doc(firestore, 'connections', connectionId);
      await setDoc(connectionRef, newConnection);

      // Update cache
      const userConnectionsCacheKey = FirestoreService.queryCacheKey('connections', { userId });
      const cachedConnections =
        this.firestoreService.getFromCache<Connection[]>(userConnectionsCacheKey) || [];
      this.firestoreService.setInCache(userConnectionsCacheKey, [
        ...cachedConnections,
        newConnection,
      ]);

      // Also cache this individual connection
      const connectionCacheKey = FirestoreService.documentCacheKey('connections', connectionId);
      this.firestoreService.setInCache(connectionCacheKey, newConnection);

      return newConnection;
    } catch (err) {
      console.error('Error creating connection:', err);
      throw err;
    }
  }

  /**
   * Update a connection
   */
  static async updateConnection(connectionId: string, updates: Partial<Connection>): Promise<void> {
    try {
      const firestore = this.firestoreService.getFirestore();
      const connectionRef = doc(firestore, 'connections', connectionId);
      await updateDoc(connectionRef, {
        ...updates,
      });

      // Update connection in cache
      const connectionCacheKey = FirestoreService.documentCacheKey('connections', connectionId);
      const cachedConnection = this.firestoreService.getFromCache<Connection>(connectionCacheKey);

      if (cachedConnection) {
        const updatedConnection = { ...cachedConnection, ...updates };
        this.firestoreService.setInCache(connectionCacheKey, updatedConnection);

        // Update in user connections cache if it exists
        if (cachedConnection.userId) {
          const userConnectionsCacheKey = FirestoreService.queryCacheKey('connections', {
            userId: cachedConnection.userId,
          });
          const userConnections =
            this.firestoreService.getFromCache<Connection[]>(userConnectionsCacheKey);

          if (userConnections) {
            const updatedConnections = userConnections.map((conn) =>
              conn.id === connectionId ? { ...conn, ...updates } : conn
            );
            this.firestoreService.setInCache(userConnectionsCacheKey, updatedConnections);
          }
        }
      }
    } catch (err) {
      console.error('Error updating connection:', err);
      throw err;
    }
  }

  /**
   * Delete a connection
   */
  static async deleteConnection(connectionId: string): Promise<void> {
    try {
      // Get connection data from cache first for later cache cleanup
      const connectionCacheKey = FirestoreService.documentCacheKey('connections', connectionId);
      const connection = this.firestoreService.getFromCache<Connection>(connectionCacheKey);

      const firestore = this.firestoreService.getFirestore();
      const connectionRef = doc(firestore, 'connections', connectionId);
      await deleteDoc(connectionRef);

      // Update local stores (keep this behavior)
      const connectionStore = useConnectionStore.getState();
      const connectionFromStore = connectionStore.connections.find((c) => c.id === connectionId);

      if (connectionFromStore) {
        const deviceStore = useDeviceStore.getState();
        deviceStore.removeDevice(connectionFromStore.deviceId);
      }

      // Clear cache entries
      if (connection) {
        // Remove from user connections cache
        const userConnectionsCacheKey = FirestoreService.queryCacheKey('connections', {
          userId: connection.userId,
        });
        const userConnections =
          this.firestoreService.getFromCache<Connection[]>(userConnectionsCacheKey);

        if (userConnections) {
          const updatedConnections = userConnections.filter((conn) => conn.id !== connectionId);
          this.firestoreService.setInCache(userConnectionsCacheKey, updatedConnections);
        }
      }

      // Remove the connection from cache
      this.firestoreService.removeFromCache(connectionCacheKey);
    } catch (err) {
      console.error('Error deleting connection:', err);
      throw err;
    }
  }

  /**
   * Setup a listener for user connections
   * @returns Function to unsubscribe
   */
  static listenToUserConnections(
    userId: string,
    onAdded: (connection: Connection) => void,
    onModified: (connection: Connection) => void,
    onRemoved: (connectionId: string) => void
  ): () => void {
    if (!userId) {
      console.warn('listenToUserConnections called without userId');
      return () => {}; // Return a no-op unsubscribe function if no userId
    }

    const firestore = this.firestoreService.getFirestore();
    const connectionsQuery = query(
      collection(firestore, 'connections'),
      where('userId', '==', userId)
    );

    // Cache key for this query
    const cacheKey = FirestoreService.queryCacheKey('connections', { userId });

    return onSnapshot(
      connectionsQuery,
      (snapshot) => {
        // Kiểm tra snapshot null trước khi sử dụng docChanges
        if (!snapshot) {
          console.warn('ConnectionService: received null snapshot in listenToUserConnections');
          return;
        }

        // Build up the current state for the cache
        let currentConnections: Connection[] = [];

        // Handle initial load and updates
        snapshot.docChanges().forEach((change) => {
          const connectionData = change.doc.data() as Connection;

          const connection: Connection = {
            id: connectionData.id,
            userId: connectionData.userId,
            deviceId: connectionData.deviceId,
            name: connectionData.name,
          };

          // Cache individual connection document
          const docCacheKey = FirestoreService.documentCacheKey('connections', connection.id);
          this.firestoreService.setInCache(docCacheKey, connection);

          // Handle different event types
          if (change.type === 'added') {
            onAdded(connection);
            currentConnections.push(connection);
          } else if (change.type === 'modified') {
            onModified(connection);
            // Update connection in the current list being built
            currentConnections = currentConnections.filter((c) => c.id !== connection.id);
            currentConnections.push(connection);
          } else if (change.type === 'removed') {
            onRemoved(connectionData.id);
            // Remove from cache
            this.firestoreService.removeFromCache(docCacheKey);
          }
        });

        // Update the query cache with all current connections
        if (currentConnections.length > 0) {
          this.firestoreService.setInCache(cacheKey, currentConnections);
        }
      },
      (error) => {
        // Xử lý lỗi trong onSnapshot
        if ((error as any).code === 'firestore/permission-denied') {
          console.warn(
            'ConnectionService: Permission denied in listenToUserConnections. User likely logged out.'
          );
          // Trả về silence - không thông báo lỗi này vì đây là lỗi thường gặp khi logout
          return;
        }
        console.error('ConnectionService listener error:', error);
      }
    );
  }
}
