import { UserService } from '@/lib/models/userService';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import messaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Alert Channel',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#FF231F7C',
    });
  }

  try {
    const token = await messaging().getToken();

    // Save the token to the user's preferences in Firestore
    const currentUser = useAuthStore.getState().user;
    if (currentUser && token) {
      // Store token in user document
      await UserService.updateFcmToken(currentUser.uid, token);

      // Update local state
      const userStore = useUserStore.getState();
      userStore.addFcmToken(token);
    }

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}
