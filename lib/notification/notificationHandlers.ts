import {
  AlertType,
  DEFAULT_CHANNEL_ID,
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

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Lấy thông tin từ message data
    const deviceId = data?.deviceId as string;
    const alertType = (data?.type as string) || AlertType.DEFAULT;
    const duration = data?.duration ? Number(data.duration) : 0;

    if (alertType === AlertType.DEFAULT && !notification?.title) {
      return;
    }

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

    // Hiển thị native notification với âm thanh và rung tùy chỉnh
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification?.title || title || 'BabyCare Alert',
        body: notification?.body || body || 'Please check the app',
        data,
        sound: true,
        vibrate: STRONG_VIBRATION_PATTERN,
        badge: 1, // Cập nhật badge count
      },
      trigger: {
        channelId: DEFAULT_CHANNEL_ID, // Sử dụng kênh tùy chỉnh với âm thanh và rung mạnh
      },
    });
  });

  const checkInitialNotification = async () => {
    try {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        // Kích hoạt phản hồi haptic và âm thanh
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // playNotificationSound();

        const { data } = initialNotification;

        if (data && typeof data === 'object' && 'id' in data && typeof data.id === 'string') {
          useNotificationStore.getState().markAsRead(data.id);
        }
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
