import { ConnectionService } from '@/lib/models/connectionService';
import { Notification } from '@/lib/notifications';
import {
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
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
  hasMore: boolean;
  isAllRead: boolean;
  getIsAllRead: () => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  subscribeToNotifications: (userId: string) => () => void;
  deleteAll: () => void;
  loadMore: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  error: null,
  hasMore: true,
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

  loadMore: () => {
    const state = get();
    if (!state.hasMore || state.isLoading) return;

    set({ isLoading: true });
    // Logic sẽ được xử lý trong subscribeToNotifications
  },

  subscribeToNotifications: (userId: string) => {
    if (!userId) {
      console.warn('subscribeToNotifications called without userId');
      set({ isLoading: false });
      return () => {};
    }
    set({ isLoading: true });
    const firestore = getFirestore();
    let unsubscribes: (() => void)[] = [];
    let isUnmounted = false;

    // Số lượng notification mỗi lần load
    const LIMIT = 12;
    let lastVisible: any = null;

    // Lấy danh sách deviceId đã kết nối
    ConnectionService.getUserConnections(userId).then((connections) => {
      if (isUnmounted) return;
      const deviceIds = connections.map((conn) => conn.deviceId);
      if (deviceIds.length === 0) {
        set({ notifications: [], unreadCount: 0, isLoading: false, hasMore: false });
        return;
      }
      let allNotifications: Notification[] = [];

      const setupSubscription = (isLoadMore = false) => {
        deviceIds.forEach((deviceId) => {
          const notificationsCol = collection(firestore, 'devices', deviceId, 'notifications');
          let q = query(notificationsCol, orderBy('time', 'desc'));

          // Nếu có lastVisible và đang load more, thêm startAfter
          if (lastVisible && isLoadMore) {
            q = query(q, startAfter(lastVisible), limit(LIMIT));
          } else if (!isLoadMore) {
            // Lần đầu load chỉ lấy LIMIT items
            q = query(q, limit(LIMIT));
          }

          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              try {
                if (!snapshot || !snapshot.docs) return;

                // Cập nhật lastVisible
                lastVisible = snapshot.docs[snapshot.docs.length - 1];

                // Kiểm tra còn data không
                const hasMore = snapshot.docs.length === LIMIT;

                const deviceNotifications = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  deviceId,
                })) as Notification[];

                if (isLoadMore) {
                  allNotifications = allNotifications.concat(deviceNotifications);
                } else {
                  allNotifications = deviceNotifications;
                }

                // Sắp xếp lại tất cả notifications theo timestamp
                allNotifications.sort((a, b) => (b.time > a.time ? 1 : -1));

                set({
                  notifications: allNotifications,
                  unreadCount: allNotifications.filter((n) => !n.read).length,
                  isLoading: false,
                  error: null,
                  hasMore,
                });
              } catch (err) {
                console.error('Error handling snapshot:', err);
                set({
                  error: 'Failed to process notifications',
                  isLoading: false,
                  hasMore: false,
                });
              }
            },
            (error: Error) => {
              console.error('Error fetching notifications:', error);
              set({
                error: 'Failed to load notifications',
                isLoading: false,
                hasMore: false,
              });
            }
          );
          unsubscribes.push(unsubscribe);
        });
      };

      // Set up initial subscription
      setupSubscription();

      // Add loadMore handler
      get().loadMore = () => {
        if (!get().hasMore || get().isLoading) return;
        set({ isLoading: true });
        setupSubscription(true);
      };
    });

    return () => {
      isUnmounted = true;
      unsubscribes.forEach((unsub) => unsub());
    };
  },
}));
