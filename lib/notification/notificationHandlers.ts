import {
  AlertType,
  NOTIFICATION_SOUND,
  STRONG_VIBRATION_PATTERN,
  generateNotificationContent,
  getConnectionNameFromDeviceId,
  getToastTypeFromAlert,
  playNotificationSound,
} from '@/lib/notification/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUserStore } from '@/stores/userStore';
import messaging from '@react-native-firebase/messaging';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';

export function setupNotificationListeners() {
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Foreground notification:', notification);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  // App được mở từ notification
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      id?: string;
      type?: string;
    };

    if (data?.id) {
      useNotificationStore.getState().markAsRead(data.id);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  });

  // Firebase message ở foreground (App đang mở)
  const firebaseSub = messaging().onMessage(async (remoteMessage) => {
    const { notification, data } = remoteMessage;
    console.log('Firebase FCM foreground:', remoteMessage);

    playNotificationSound();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Lấy thông tin từ message data
    const deviceId = data?.deviceId as string;
    const alertType = (data?.type as string) || AlertType.DEFAULT;
    const duration = data?.duration ? Number(data.duration) : 0;

    // Lấy ngôn ngữ từ user store
    const userStore = useUserStore.getState();
    const language = userStore.preferences?.language || 'en';

    // Lấy tên kết nối
    const connectionName = getConnectionNameFromDeviceId(deviceId);

    // Sử dụng hàm shared để tạo nội dung thông báo
    const { title, body } = generateNotificationContent(
      alertType,
      language,
      connectionName,
      duration
    );

    // Xác định loại toast dựa trên loại cảnh báo
    const toastType = getToastTypeFromAlert(alertType);

    Toast.show({
      type: toastType,
      text1: notification?.title || title || 'New Notification',
      text2: notification?.body || body || JSON.stringify(data),
      onShow: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
    });

    // Hiển thị native notification với âm thanh và rung tùy chỉnh
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification?.title || title || 'BabyCare Alert',
        body: notification?.body || body || 'Please check the app',
        data,
        sound: NOTIFICATION_SOUND,
        badge: 1, // Cập nhật badge count
      },
      trigger: {
        channelId: 'default', // Sử dụng kênh mặc định với cấu hình rung mạnh
      },
    });
  });

  const checkInitialNotification = async () => {
    try {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('App opened from quit state by notification', initialNotification);

        // Kích hoạt phản hồi haptic và âm thanh
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playNotificationSound();

        const { data } = initialNotification;

        if (data && typeof data === 'object' && 'id' in data && typeof data.id === 'string') {
          useNotificationStore.getState().markAsRead(data.id);
        }

        // Lấy tiêu đề và nội dung thông báo an toàn
        const notificationTitle =
          initialNotification.notification?.title || 'App opened from notification';
        const notificationBody =
          typeof initialNotification.notification?.body === 'string'
            ? initialNotification.notification.body
            : 'You opened the app from a notification';

        // Xác định loại toast dựa trên loại cảnh báo từ data
        const toastType = getToastTypeFromAlert(data?.type as string);

        Toast.show({
          type: toastType,
          text1: notificationTitle,
          text2: notificationBody,
        });
      }
    } catch (error) {
      console.error('Error checking initial notification:', error);
    }
  };

  checkInitialNotification();

  return () => {
    foregroundSub.remove();
    responseSub.remove();
    firebaseSub();
  };
}
