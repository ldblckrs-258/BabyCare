import { navigate } from '@/lib/navigation/NavigationService';
import {
  AlertType,
  DEFAULT_CHANNEL_ID,
  STRONG_VIBRATION_PATTERN,
  generateNotificationContent,
  getConnectionNameFromDeviceId,
} from '@/lib/notification/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUserStore } from '@/stores/userStore';
import messaging from '@react-native-firebase/messaging';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

export function setupNotificationListeners() {
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('noti shown', notification);
    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      id?: string;
      type?: string;
    };

    if (data?.id) {
      useNotificationStore.getState().markAsRead(data.id);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigate('History');
  });

  const firebaseSub = messaging().onMessage(async (remoteMessage) => {
    const { notification, data } = remoteMessage;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const deviceId = data?.deviceId as string;
    const alertType = (data?.type as string) || AlertType.DEFAULT;
    const duration = data?.duration ? Number(data.duration) : 0;

    if (alertType === AlertType.DEFAULT && !notification?.title) {
      return;
    }

    const userStore = useUserStore.getState();
    const language = userStore.preferences?.language || 'en';

    const connectionName = getConnectionNameFromDeviceId(deviceId);

    const { title, body } = generateNotificationContent(
      alertType,
      language,
      connectionName,
      duration
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification?.title || title || 'BabyCare Alert',
        body: notification?.body || body || 'Please check the app',
        data,
        sound: true,
        vibrate: STRONG_VIBRATION_PATTERN,
        badge: 1,
      },
      trigger: {
        channelId: DEFAULT_CHANNEL_ID,
      },
    });
  });

  const checkInitialNotification = async () => {
    try {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
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
