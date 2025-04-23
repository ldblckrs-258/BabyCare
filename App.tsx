import './global.css';
import './lib/i18n';
import { LoginScreen } from './screens/LoginScreen';
import MainTabs from './screens/MainTabs';
import { RegisterScreen } from './screens/RegisterScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { NotificationService } from '@/lib/models/notificationService';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user } = useAuthStore();
  const { subscribeToNotifications } = useNotificationStore();

  // Initialize notifications when user logs in
  useEffect(() => {
    if (user?.uid) {
      // Initialize notification service
      NotificationService.initialize(user.uid);
      NotificationService.listenForTokenRefresh(user.uid);
      // Subscribe to notifications in store
      const unsubscribe = subscribeToNotifications(user.uid);

      return () => {
        unsubscribe();
        NotificationService.cleanup();
      };
    }
  }, [user]);

  return (
    <PaperProvider>
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
    </PaperProvider>
  );
}
