import './global.css';
import './lib/i18n';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { LoginScreen } from './screens/LoginScreen';
import MainTabs from './screens/MainTabs';
import { RegisterScreen } from './screens/RegisterScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { navigationRef } from '@/lib/navigation/NavigationService';
import { setupNotificationListeners } from '@/lib/notification/notificationHandlers';
import {
  DEFAULT_CHANNEL_ID,
  STRONG_VIBRATION_PATTERN,
  createNotificationChannel,
  registerDeviceForPushNotifications,
  setupBackgroundHandler,
} from '@/lib/notification/notificationService';
import { toastConfig } from '@/lib/notification/toastConfig';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useLayoutEffect } from 'react';
import { AppState, Image, Platform, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading } = useAuthStore();
  const userStore = useUserStore();

  useLayoutEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrationPattern: STRONG_VIBRATION_PATTERN,
        channelId: DEFAULT_CHANNEL_ID,
      }),
    });

    // Create the notification channel first
    createNotificationChannel().then(() => {
      // Then setup background handler
      setupBackgroundHandler();
    });

    // Always register for FCM token on startup, regardless of login state
    // It will be cached and saved to Firestore when the user logs in
    registerDeviceForPushNotifications();

    const removeListeners = setupNotificationListeners();

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Re-create notification channel when app comes to foreground
        createNotificationChannel();

        Notifications.getBadgeCountAsync().then((count) => {
          if (count > 0) {
            Notifications.setBadgeCountAsync(0);
          }
        });
      }
    });

    return () => {
      removeListeners();
      appStateSubscription.remove();
    };
  }, []);

  // Initialize user preferences when user is logged in
  useEffect(() => {
    if (user && !userStore.preferences) {
      userStore.initUserPreferences(user.uid);
    } else if (!user && userStore.preferences) {
      userStore.clearPreferences();
    }
  }, [user, userStore.preferences]);

  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          {user ? (
            // User is signed in
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            // No user is signed in
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}
