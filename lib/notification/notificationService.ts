import { useAuthStore } from '@/stores/authStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useUserStore } from '@/stores/userStore';
import messaging from '@react-native-firebase/messaging';
import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';

// Định nghĩa mẫu rung mạnh hơn cho thông báo
export const STRONG_VIBRATION_PATTERN = [0, 300, 200, 300, 200, 300];

// Sound constants - Sử dụng tên file để tham chiếu trong Android notification channel
export const NOTIFICATION_SOUND = 'notification.mp3';

// Tên kênh thông báo mặc định
export const DEFAULT_CHANNEL_ID = 'babycare-alerts';

// Các loại cảnh báo theo notification guide
export enum AlertType {
  SIDE = 'side',
  PRONE = 'prone',
  CRYING = 'crying',
  BLANKET = 'blanket',
  NOBLANKET = 'noblanket',
  DEFAULT = 'info',
}

// Map AlertType to toast types
export function getToastTypeFromAlert(alertType?: string): string {
  if (!alertType) return 'info';

  const alertTypeLower = alertType.toLowerCase();

  switch (alertTypeLower) {
    case 'side':
    case 'prone':
    case 'crying':
    case 'noblanket':
    case 'blanket':
      return alertTypeLower;
    default:
      return 'info';
  }
}

// Shared function to generate notification content based on alertType, language, and connectionName
export function generateNotificationContent(
  alertType: string = AlertType.DEFAULT,
  language: string = 'en',
  connectionName: string = 'Baby',
  duration: number = 0
): { title: string; body: string } {
  let title, body;

  if (language === 'vi') {
    title = `[${connectionName}] Cảnh báo `;
    body = `Bé đang `;

    switch (alertType) {
      case AlertType.SIDE:
        title += 'nằm nghiêng';
        body += 'nằm nghiêng';
        break;
      case AlertType.PRONE:
        title += 'nằm sấp';
        body += 'nằm sấp';
        break;
      case AlertType.CRYING:
        title += 'khóc';
        body += 'khóc';
        break;
      case AlertType.NOBLANKET:
        title += 'không đắp chăn';
        body += 'không đắp chăn';
        break;
      case AlertType.BLANKET:
        title += 'đắp chăn';
        body += 'đắp chăn';
        break;
      default:
        title += 'mới';
        body += 'có hoạt động mới';
    }

    if (duration > 0) {
      body += `, đã liên tục trong ${duration} giây`;
    }
  } else {
    // Default to English
    title = `[${connectionName}] `;
    body = `Baby is `;

    switch (alertType) {
      case AlertType.SIDE:
        title += 'Side position alert';
        body += 'lying on side';
        break;
      case AlertType.PRONE:
        title += 'Prone position alert';
        body += 'lying face down';
        break;
      case AlertType.CRYING:
        title += 'Crying alert';
        body += 'crying';
        break;
      case AlertType.NOBLANKET:
        title += 'No blanket alert';
        body += 'without a blanket';
        break;
      case AlertType.BLANKET:
        title += 'Blanket alert';
        body += 'covered with a blanket';
        break;
      default:
        title += 'New alert';
        body += 'having new activity';
    }

    if (duration > 0) {
      body += `, continuously for ${duration} seconds`;
    }
  }

  return { title, body };
}

// Helper function to get connection name from deviceId
export function getConnectionNameFromDeviceId(deviceId?: string): string {
  if (!deviceId) return 'Baby';

  const connectionStore = useConnectionStore.getState();
  const connection = connectionStore.getConnectionByDeviceId(deviceId);
  return connection?.name || 'Baby';
}

// Tạo kênh thông báo chung cho Android
export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    try {
      // Cấu hình kênh thông báo chính với âm thanh và rung mạnh
      await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
        name: 'BabyCare Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: STRONG_VIBRATION_PATTERN,
        sound: NOTIFICATION_SOUND,
        enableVibrate: true,
        enableLights: true,
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
      });

      // Configure Firebase messaging for Android
      messaging().onMessage(async (remoteMessage) => {
        // Handling is done in notificationHandlers.ts
      });
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  }
}

// Cấu hình cho background message handler
export function setupBackgroundHandler() {
  // Đảm bảo kênh thông báo được tạo
  createNotificationChannel();

  // Đăng ký handler cho background messages
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const { data, notification } = remoteMessage;
    const alertType = (data?.type as string) || AlertType.DEFAULT;
    const deviceId = data?.deviceId as string;
    const duration = data?.duration ? Number(data.duration) : 0;

    if (alertType === AlertType.DEFAULT && !notification?.title) {
      return;
    }

    const userStore = useUserStore.getState();
    const language = userStore.preferences?.language || 'en';
    const connectionName = getConnectionNameFromDeviceId(deviceId);

    // Use shared notification content generator
    const { title, body } = generateNotificationContent(
      alertType,
      language,
      connectionName,
      duration
    );

    // Đảm bảo thông báo này có âm thanh và rung thông qua kênh thông báo
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification?.title || title,
        body: notification?.body || body,
        sound: true,
        vibrate: STRONG_VIBRATION_PATTERN,
        priority: 'max',
        badge: 1,
      },
      trigger: {
        channelId: DEFAULT_CHANNEL_ID,
      },
    });

    return Promise.resolve();
  });
}

// Store FCM token if user not logged in
let cachedFcmToken: string | null = null;

export async function registerDeviceForPushNotifications(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications');
    return;
  }

  // Đảm bảo kênh thông báo được tạo
  await createNotificationChannel();

  try {
    // Đăng ký FCM token
    const token = await messaging().getToken();

    // Cache the token
    cachedFcmToken = token;

    // Yêu cầu quyền thông báo từ iOS
    if (Platform.OS === 'ios') {
      await messaging().requestPermission();
      // Đặt badge icon về 0 khi đăng ký
      await Notifications.setBadgeCountAsync(0);
    }

    const currentUser = useAuthStore.getState().user;
    if (currentUser && token) {
      // Cập nhật trong userStore
      const userStore = useUserStore.getState();
      await userStore.addFcmToken(token);
    }

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

// Expose function to save cached token if it exists
export async function saveCachedFcmTokenIfExists(): Promise<void> {
  const currentUser = useAuthStore.getState().user;
  if (currentUser && cachedFcmToken) {
    const userStore = useUserStore.getState();
    await userStore.addFcmToken(cachedFcmToken);
  }
}

// Helper function to play a notification sound
export async function playNotificationSound(): Promise<void> {
  try {
    const soundObject = new Audio.Sound();

    await soundObject.loadAsync(require('../../assets/sounds/notification.mp3'));

    await soundObject.playAsync();

    // Kích hoạt rung mạnh cho thiết bị
    Vibration.vibrate(STRONG_VIBRATION_PATTERN);

    // Tự động giải phóng sound object sau khi phát
    setTimeout(() => {
      soundObject.unloadAsync().catch(console.error);
    }, 2000);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

// Helper function để tạo và hiển thị thông báo cục bộ với loại cảnh báo
export async function showLocalNotification(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        vibrate: STRONG_VIBRATION_PATTERN,
      },
      trigger: {
        channelId: DEFAULT_CHANNEL_ID,
      },
    });
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
}
