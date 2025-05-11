import './global.css';
import './lib/i18n';
import { LoginScreen } from './screens/LoginScreen';
import MainTabs from './screens/MainTabs';
import { RegisterScreen } from './screens/RegisterScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { setupNotificationListeners } from '@/lib/notification/notificationHandlers';
import {
  STRONG_VIBRATION_PATTERN,
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
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrationPattern: STRONG_VIBRATION_PATTERN,
      }),
    });

    setupBackgroundHandler();

    registerDeviceForPushNotifications().then((token) => {
      if (token) {
        console.log('Push token registered:', token);
      }
    });

    const removeListeners = setupNotificationListeners();

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
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

  if (loading) {
    // Show splash/loading screen while checking auth state
    return (
      <PaperProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
          <StatusBar style="auto" />
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 120, height: 120, marginBottom: 24 }}
          />
          <Text style={{ fontSize: 20, color: '#3d8d7a', fontWeight: 'bold' }}>BabyCare</Text>
          <Text style={{ marginTop: 16, color: '#888' }}>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
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
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}
