import { Notification } from '@/lib/notifications';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
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
      await firestore().collection('notifications').doc(id).update({ read: true });
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
      const batch = firestore().batch();
      get()
        .notifications.filter((n) => !n.read)
        .forEach((n) => {
          const ref = firestore().collection('notifications').doc(n.id);
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

    // Create query for user's notifications, ordered by timestamp
    const unsubscribe = firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const notifications = snapshot.docs.map(
            (doc: FirebaseFirestoreTypes.DocumentSnapshot) => ({
              id: doc.id,
              ...doc.data(),
            })
          ) as Notification[];

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
