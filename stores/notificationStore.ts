import { ConnectionService } from '@/lib/models/connectionService';
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
  deleteAll: () => void;
  getIsAllRead: () => boolean;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  error: null,
  isAllRead: false,
  getIsAllRead: () => {
    return get().notifications.every((n) => n.read);
  },
  markAsRead: async (id: string) => {
    try {
      const firestore = getFirestore();
      // Tìm notification theo id để lấy deviceId
      const notification = get().notifications.find((n) => n.id === id);
      if (!notification || !notification.deviceId)
        throw new Error('Notification or deviceId not found');
      const notificationRef = doc(firestore, 'devices', notification.deviceId, 'notifications', id);
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
          if (n.deviceId) {
            const ref = doc(firestore, 'devices', n.deviceId, 'notifications', n.id);
            batch.update(ref, { read: true });
          }
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

  deleteAll: async () => {
    try {
      const firestore = getFirestore();
      const batch = writeBatch(firestore);
      get().notifications.forEach((n) => {
        if (n.deviceId) {
          const ref = doc(firestore, 'devices', n.deviceId, 'notifications', n.id);
          batch.delete(ref);
        }
      });
      await batch.commit();
      set({ notifications: [] });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  },

  subscribeToNotifications: (userId: string) => {
    if (!userId) {
      console.warn('subscribeToNotifications called without userId');
      set({ isLoading: false }); // Ensure loading state is reset
      return () => {}; // Return a no-op unsubscribe function
    }
    set({ isLoading: true });
    const firestore = getFirestore();
    let unsubscribes: (() => void)[] = [];
    let isUnmounted = false;

    // Lấy danh sách deviceId đã kết nối
    ConnectionService.getUserConnections(userId).then((connections) => {
      if (isUnmounted) return;
      const deviceIds = connections.map((conn) => conn.deviceId);
      if (deviceIds.length === 0) {
        set({ notifications: [], unreadCount: 0, isLoading: false });
        return;
      }
      let allNotifications: Notification[] = [];
      deviceIds.forEach((deviceId) => {
        const notificationsCol = collection(firestore, 'devices', deviceId, 'notifications');
        const q = query(notificationsCol, orderBy('time', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            try {
              if (!snapshot || !snapshot.docs) return;
              // Cập nhật notifications cho device này, gán deviceName từ connection
              const deviceNotifications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                deviceId,
              })) as Notification[];
              allNotifications = allNotifications
                .filter((n) => n.deviceId !== deviceId)
                .concat(deviceNotifications);
              // Sắp xếp lại tất cả notifications theo timestamp
              allNotifications.sort((a, b) => (b.time > a.time ? 1 : -1));
              set({
                notifications: allNotifications,
                unreadCount: allNotifications.filter((n) => !n.read).length,
                isLoading: false,
                error: null,
              });
            } catch (err) {
              console.error('Error handling snapshot:', err);
              set({
                error: 'Failed to process notifications',
                isLoading: false,
              });
            }
          },
          (error: Error) => {
            console.error('Error fetching notifications:', error);
            set({
              error: 'Failed to load notifications',
              isLoading: false,
            });
          }
        );
        unsubscribes.push(unsubscribe);
      });
    });
    // Trả về hàm unsubscribe tổng hợp
    return () => {
      isUnmounted = true;
      unsubscribes.forEach((unsub) => unsub());
    };
  },
}));
