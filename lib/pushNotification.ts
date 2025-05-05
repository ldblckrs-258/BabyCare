import { useNotificationStore } from '../stores/notificationStore';
import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Register device for push notifications
export async function registerForPushNotificationsAsync() {
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

  // Create Android channels
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Alert Channel',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#FF231F7C',
    });
  }

  // Get FCM token
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

// Setup notification listeners
export function setupNotificationHandlers() {
  // Foreground notifications
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Foreground notification received:', notification);
  });

  // Notification opened from tray
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      notificationId?: string;
    };

    if (data?.notificationId) {
      useNotificationStore.getState().markAsRead(data.notificationId);
    }
  });

  // Firebase foreground message handler
  const messagingUnsubscribe = messaging().onMessage(async (remoteMessage) => {
    const { notification, data } = remoteMessage;
    console.log('Foreground FCM message received:', remoteMessage);
    if (notification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title || '',
          body: notification.body || '',
          data: { notificationId: data?.notificationId },
        },
        trigger: null, // show immediately
      });
    }
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
    messagingUnsubscribe();
  };
}

// Update and log FCM token (can be sent to backend)
export async function updateFCMToken(userId: string) {
  try {
    const token = await messaging().getToken();
    console.log('FCM token for user', userId, ':', token);
    // TODO: send token to your backend if needed
  } catch (error) {
    console.error('Error updating FCM token:', error);
  }
}
