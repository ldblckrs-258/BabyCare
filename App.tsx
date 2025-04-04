import './global.css';
import './lib/i18n';
// Import i18n configuration
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from './lib/notificationService';
import { LoginScreen } from './screens/LoginScreen';
import MainTabs from './screens/MainTabs';
import { RegisterScreen } from './screens/RegisterScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import type { RootStackParamList } from './types/navigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { addNotification } = useSettingsStore();

  // Initialize notification permissions and listeners
  useEffect(() => {
    // Register for notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        console.log('Expo push token:', token);
      }
    });

    // Set up notification listeners
    const cleanupListeners = setupNotificationListeners((notification) => {
      // Add notification to store
      addNotification(notification);
    });

    return () => {
      // Clean up listeners on unmount
      cleanupListeners();
    };
  }, [addNotification]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
