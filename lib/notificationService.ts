// filepath: e:\Team Project\BabyCare\lib\notificationService.ts
import { useConnectionStore } from '../stores/connectionStore';
import { useDeviceStore } from '../stores/deviceStore';
import { Notification, NotificationType } from './notifications';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Get notification icon by type
const getNotificationCategoryDetails = (type: NotificationType) => {
  switch (type) {
    case 'crying':
      return {
        categoryId: 'crying',
        icon: '🍼',
        vibration: [0, 250, 250, 250],
        importance: Notifications.AndroidImportance.MAX,
      };
    case 'prone':
    case 'side':
      return {
        categoryId: 'position_alert',
        icon: '🛌',
        vibration: [0, 250, 250, 250],
        importance: Notifications.AndroidImportance.MAX,
      };
    case 'noBlanket':
      return {
        categoryId: 'blanket_alert',
        icon: '🧸',
        vibration: [0, 250, 250, 250],
        importance: Notifications.AndroidImportance.MAX,
      };
    case 'system':
    default:
      return {
        categoryId: 'system',
        icon: '⚙️',
        vibration: [0, 250],
        importance: Notifications.AndroidImportance.HIGH,
      };
  }
};

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // Set notification channel for Android
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5d97d3',
    });

    // Create category channels
    await Notifications.setNotificationChannelAsync('crying', {
      name: 'Cry Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5d97d3',
      description: 'Alerts about your baby crying',
    });

    await Notifications.setNotificationChannelAsync('position_alert', {
      name: 'Position Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#d26165',
      description: 'Alerts about unsafe sleeping positions',
    });

    await Notifications.setNotificationChannelAsync('blanket_alert', {
      name: 'Blanket Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
      description: 'Alerts about blanket issues',
    });

    await Notifications.setNotificationChannelAsync('system', {
      name: 'System Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250],
      lightColor: '#3d8d7a',
      description: 'System updates and alerts',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your actual Expo project ID
      })
    ).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Send a local notification
export async function sendLocalNotification(notification: Notification) {
  const categoryDetails = getNotificationCategoryDetails(notification.type);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.message,
      data: { notification },
      sound: true,
      badge: 1,
      categoryIdentifier: categoryDetails.categoryId,
      ...(Platform.OS === 'android' && {
        icon: categoryDetails.icon,
        color:
          notification.type === 'crying'
            ? '#5d97d3'
            : notification.type === 'prone' || notification.type === 'side'
              ? '#d26165'
              : notification.type === 'noBlanket'
                ? '#f59e0b'
                : '#3d8d7a',
        vibrationPattern: categoryDetails.vibration,
        priority: categoryDetails.importance.toString(),
      }),
    },
    trigger: null,
  });

  // Return a new notification with the added data
  return {
    ...notification,
    timestamp: new Date().toISOString(), // Store timestamp as ISO string
    read: false,
  };
}

// Simulate different notification types
export async function simulateNotification(
  type: NotificationType,
  deviceId?: string,
  deviceName?: string
) {
  // Get a random device if none is specified
  if (!deviceId || !deviceName) {
    const devices = useDeviceStore.getState().devices;

    // If no devices are available, use default values
    if (devices.length === 0) {
      deviceId = 'unknown-device';
      deviceName = 'Unknown Device';
    } else {
      // Select a random device from the available devices
      const randomIndex = Math.floor(Math.random() * devices.length);
      const randomDevice = devices[randomIndex];
      deviceId = randomDevice.id;

      // Try to get connection name for the device
      const connection = useConnectionStore.getState().getConnectionByDeviceId(deviceId);
      deviceName = connection?.name || `Device ${randomIndex + 1}`;
    }
  }

  let title = '';
  let message = '';
  let duration = 0;

  // Include device name in notification if provided
  const devicePrefix = deviceName ? `[${deviceName}] ` : '';

  switch (type) {
    case 'crying':
      title = `${devicePrefix}Cry Alert`;
      message = deviceName
        ? `${deviceName} is crying for more than 5 minutes.`
        : 'Baby is crying for more than 5 minutes.';
      duration = 5;
      break;
    case 'prone':
      title = `${devicePrefix}Sleep Position Alert`;
      message = deviceName
        ? `${deviceName} is sleeping in a prone position.`
        : 'Baby is sleeping in a prone position.';
      duration = 3;
      break;
    case 'side':
      title = `${devicePrefix}Sleep Position Alert`;
      message = deviceName
        ? `${deviceName} is sleeping on their side.`
        : 'Baby is sleeping on their side.';
      duration = 3;
      break;
    case 'noBlanket':
      title = `${devicePrefix}Blanket Alert`;
      message = deviceName
        ? `${deviceName} has no blanket coverage.`
        : 'Baby has no blanket coverage.';
      duration = 2;
      break;
    case 'system':
      title = `${devicePrefix}System Notification`;
      message = 'Device battery is low. Please charge your device.';
      break;
  }

  const notification: Notification = {
    id: `notification-${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(), // Store timestamp as ISO string
    read: false,
    duration: duration || undefined,
    imageUrl:
      type !== 'system' ? `https://example.com/images/${type}-${Date.now()}.jpg` : undefined,
    deviceId,
    deviceName,
  };

  console.log('Notification created:', notification.id);
  // Send the local notification but don't return the result directly
  // This prevents the duplicate addition since the notification will be added through the notification listeners
  const ntf = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.message,
      data: {
        notification,
        manuallyAdded: true,
      },
      sound: true,
      badge: 1,
      categoryIdentifier: getNotificationCategoryDetails(notification.type).categoryId,
      ...(Platform.OS === 'android' && {
        icon: getNotificationCategoryDetails(notification.type).icon,
        color:
          notification.type === 'crying'
            ? '#5d97d3'
            : notification.type === 'prone' || notification.type === 'side'
              ? '#d26165'
              : notification.type === 'noBlanket'
                ? '#f59e0b'
                : '#3d8d7a',
        vibrationPattern: getNotificationCategoryDetails(notification.type).vibration,
        priority: getNotificationCategoryDetails(notification.type).importance.toString(),
      }),
    },
    trigger: null,
  });

  console.log('Notification pushed:', ntf);

  // Return the notification for immediate UI updates
  return notification;
}

// Add notification listener setup
export function setupNotificationListeners(
  handleNotification: (notification: Notification) => void
) {
  // This listener is fired whenever a notification is received while the app is foregrounded
  const foregroundSubscription = Notifications.addNotificationReceivedListener((response) => {
    const notification = response.request.content.data.notification as Notification;
    if (notification) {
      handleNotification(notification);
    }
  });

  // This listener is fired whenever a user taps on or interacts with a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const notification = response.notification.request.content.data.notification as Notification;
    if (notification) {
      // Mark as read since user interacted with it
      handleNotification({
        ...notification,
        read: true,
      });
    }
  });

  return () => {
    // Clean up the event listeners
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}
