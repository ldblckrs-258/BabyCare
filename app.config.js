export default {
  expo: {
    name: 'BabyCare',
    slug: 'babycare',
    version: '1.0.0',
    web: {
      favicon: './assets/logo.png',
    },
    experiments: {
      tsconfigPaths: true,
    },
    plugins: [
      'expo-router',
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: '$(PRODUCT_NAME) needs access to your camera to scan QR codes',
          enableMicrophonePermission: false,
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      [
        '@react-native-firebase/messaging',
        {
          messagingAndroidHeadlessMode: false,
          messagingAndroidNotificationChannelId: 'babycare-alerts',
        },
      ],
      [
        'expo-notifications',
        {
          sounds: ['./assets/sounds/notification.mp3'],
          enableBackgroundRemoteNotifications: true,
          androidMode: 'default',
          androidCollapsedTitle: '{{title}}',
          androidImportance: 'max',
          androidChannelId: 'babycare-alerts',
          androidChannelName: 'BabyCare Alerts',
          androidShowWhen: true,
        },
      ],
    ],
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.babycare.pbl5app',
      infoPlist: {
        NSCameraUsageDescription: '$(PRODUCT_NAME) needs access to your camera to scan QR codes',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#ffffff',
      },
      newArchEnable: true,
      package: 'com.babycare.pbl5app',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.INTERNET',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
      ],
      useNextNotificationsApi: true,
      enableBackgroundNotification: true,
      priority: 'max',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
      notification: {
        icon: './assets/logo.png',
        color: '#FF231F7C',
        androidCollapsedTitle: '{{title}}',
        androidImportance: 'max',
        channels: [
          {
            name: 'BabyCare Alerts',
            id: 'babycare-alerts',
            sound: true,
            vibrate: true,
            importance: 'max',
          },
        ],
      },
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '283dabec-0362-46ae-9d1a-2d3c0b10fd22',
      },
    },
    owner: 'ldblckrs',
  },
};
