import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Notification, NotificationType } from './notifications';

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
    case 'cry_alert':
      return {
        categoryId: 'cry_alert',
        icon: '🍼',
        vibration: [0, 250, 250, 250],
        importance: Notifications.AndroidImportance.HIGH,
      };
    case 'position_alert':
      return {
        categoryId: 'position_alert',
        icon: '🛌',
        vibration: [0, 250, 250, 250],
        importance: Notifications.AndroidImportance.HIGH,
      };
    case 'daily_report':
      return {
        categoryId: 'daily_report',
        icon: '📊',
        vibration: [0, 250],
        importance: Notifications.AndroidImportance.DEFAULT,
      };
    case 'system':
    default:
      return {
        categoryId: 'system',
        icon: '⚙️',
        vibration: [0, 250],
        importance: Notifications.AndroidImportance.DEFAULT,
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
    await Notifications.setNotificationChannelAsync('cry_alert', {
      name: 'Cry Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5d97d3',
      description: 'Alerts about your baby crying',
    });

    await Notifications.setNotificationChannelAsync('position_alert', {
      name: 'Position Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#d26165',
      description: 'Alerts about unsafe sleeping positions',
    });

    await Notifications.setNotificationChannelAsync('daily_report', {
      name: 'Daily Reports',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#a855f7',
      description: 'Daily summaries and reports',
    });

    await Notifications.setNotificationChannelAsync('system', {
      name: 'System Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
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
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your actual Expo project ID
    })).data;
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
        color: notification.type === 'cry_alert' 
          ? '#5d97d3' 
          : notification.type === 'position_alert' 
            ? '#d26165' 
            : notification.type === 'daily_report' 
              ? '#a855f7' 
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
export async function simulateNotification(type: NotificationType) {
  let title = '';
  let message = '';
  
  switch (type) {
    case 'cry_alert':
      title = 'Cry Alert';
      message = 'Baby is crying for more than 5 minutes.';
      break;
    case 'position_alert':
      title = 'Sleep Position Alert';
      message = 'Baby is sleeping in an unsafe position.';
      break;
    case 'daily_report':
      title = 'Daily Report';
      message = "Daily summary of your baby's activities and well-being.";
      break;
    case 'system':
      title = 'System Notification';
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
  };
  
  // Send the local notification but don't return the result directly
  // This prevents the duplicate addition since the notification will be added  through the notification listeners
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.message,
      data: { 
        notification,
        // Add a flag to identify this as a simulated notification that's already been processed
        manuallyAdded: true 
      },
      sound: true,
      badge: 1,
      categoryIdentifier: getNotificationCategoryDetails(notification.type).categoryId,
      ...(Platform.OS === 'android' && {
        icon: getNotificationCategoryDetails(notification.type).icon,
        color: notification.type === 'cry_alert' 
          ? '#5d97d3' 
          : notification.type === 'position_alert' 
            ? '#d26165' 
            : notification.type === 'daily_report' 
              ? '#a855f7' 
              : '#3d8d7a',
        vibrationPattern: getNotificationCategoryDetails(notification.type).vibration,
        priority: getNotificationCategoryDetails(notification.type).importance.toString(),
      }),
    },
    trigger: null,
  });
  
  // Return the notification for immediate UI updates
  return notification;
}

// Add notification listener setup
export function setupNotificationListeners(handleNotification: (notification: Notification) => void) {
  // This listener is fired whenever a notification is received while the app is foregrounded
  const foregroundSubscription = Notifications.addNotificationReceivedListener(response => {
    const notification = response.request.content.data.notification as Notification;
    if (notification) {
      handleNotification(notification);
    }
  });
  
  // This listener is fired whenever a user taps on or interacts with a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
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