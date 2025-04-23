import { firestore } from '@/lib/firebase';
import { Connection } from '@/stores/connectionStore';
import {
  collection,
  deleteDoc,
  doc,
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
  /**
   * Fetch all connections for a user
   */
  static async getUserConnections(userId: string): Promise<Connection[]> {
    try {
      const connectionsQuery = query(
        collection(firestore, 'connections'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(connectionsQuery);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id,
          userId: data.userId,
          deviceId: data.deviceId,
          name: data.name,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        } as Connection;
      });
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
      const connectionRef = doc(firestore, 'connections', connectionId);
      await updateDoc(connectionRef, {
        ...updates,
        updatedAt: new Date(),
      });
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
      const connectionRef = doc(firestore, 'connections', connectionId);
      await deleteDoc(connectionRef);
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
    const connectionsQuery = query(
      collection(firestore, 'connections'),
      where('userId', '==', userId)
    );

    return onSnapshot(connectionsQuery, (snapshot) => {
      // Handle initial load and updates
      snapshot.docChanges().forEach((change) => {
        const connectionData = change.doc.data() as Connection;

        if (change.type === 'added' || change.type === 'modified') {
          const connection: Connection = {
            id: connectionData.id,
            userId: connectionData.userId,
            deviceId: connectionData.deviceId,
            name: connectionData.name,
            createdAt: connectionData.createdAt ? new Date(connectionData.createdAt) : new Date(),
            updatedAt: connectionData.updatedAt ? new Date(connectionData.updatedAt) : undefined,
          };

          if (change.type === 'added') {
            onAdded(connection);
          } else {
            onModified(connection);
          }
        } else if (change.type === 'removed') {
          onRemoved(connectionData.id);
        }
      });
    });
  }
}
