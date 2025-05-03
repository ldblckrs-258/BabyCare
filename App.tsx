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
import { Image, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading } = useAuthStore();
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
    </PaperProvider>
  );
}
