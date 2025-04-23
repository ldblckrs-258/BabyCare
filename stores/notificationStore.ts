import { Notification } from '@/lib/notifications';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import { create } from 'zustand';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  subscribeToNotifications: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  error: null,

  markAsRead: async (id: string) => {
    try {
      const firestore = getFirestore();
      const notificationRef = doc(firestore, 'notifications', id);
      await updateDoc(notificationRef, { read: true });
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const firestore = getFirestore();
      const batch = writeBatch(firestore);
      get()
        .notifications.filter((n) => !n.read)
        .forEach((n) => {
          const ref = doc(firestore, 'notifications', n.id);
          batch.update(ref, { read: true });
        });
      await batch.commit();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  subscribeToNotifications: (userId: string) => {
    set({ isLoading: true });
    const firestore = getFirestore();
    const notificationsCol = collection(firestore, 'notifications');
    const q = query(notificationsCol, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
          isLoading: false,
          error: null,
        });
      },
      (error: Error) => {
        console.error('Error fetching notifications:', error);
        set({
          error: 'Failed to load notifications',
          isLoading: false,
        });
      }
    );
    return unsubscribe;
  },
}));
