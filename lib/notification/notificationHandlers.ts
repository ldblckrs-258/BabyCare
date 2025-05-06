import { useNotificationStore } from '@/stores/notificationStore';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';

export function setupNotificationListeners() {
  // Foreground: nhận noti khi app đang mở
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Foreground notification:', notification);
  });

  // App được mở từ notification
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as { notificationId?: string };
    if (data?.notificationId) {
      useNotificationStore.getState().markAsRead(data.notificationId);
    }
  });

  // Firebase message ở foreground (App đang mở)
  const firebaseSub = messaging().onMessage(async (remoteMessage) => {
    const { notification, data } = remoteMessage;
    console.log('Firebase FCM foreground:', remoteMessage);

    // Hiển thị toast
    Toast.show({
      type: 'info',
      text1: notification?.title || 'New Notification',
      text2: notification?.body || JSON.stringify(data),
    });

    // Optionally hiển thị native notification nếu muốn
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification?.title ?? 'BabyCare Alert',
        body: notification?.body ?? 'Please check the app',
        data,
        sound: 'default',
      },
      trigger: null,
    });
  });

  return () => {
    foregroundSub.remove();
    responseSub.remove();
    firebaseSub();
  };
}
