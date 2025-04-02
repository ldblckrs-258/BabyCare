import { DeviceConnectionModal } from '../components/modals/DeviceConnectionModal';
import { LanguageModal } from '../components/modals/LanguageModal';
import { NotificationModal } from '../components/modals/NotificationModal';
import { PrivacyTermsModal } from '../components/modals/PrivacyTermsModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { RootStackParamList } from '../types/navigation';
import { useTranslation } from '@/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Image } from 'expo-image';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { isDeviceConnected, deviceId, language, setDeviceConnection } = useSettingsStore();

  // Modal visibility states
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Combined state to check if any modal is visible
  const isAnyModalVisible =
    deviceModalVisible ||
    notificationModalVisible ||
    languageModalVisible ||
    privacyModalVisible ||
    profileModalVisible;

  const handleQRCodeScanned = (code: string) => {
    // Here you would typically validate the QR code format
    setDeviceConnection(true, code);
    console.log('Scanned QR code:', code);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      {/* Semi-transparent overlay when modals are open */}
      {isAnyModalVisible && (
        <View
          className="absolute inset-0 z-10 bg-black/50"
          style={{ height: '100%', width: '100%' }}
        />
      )}
      <View className="flex-1 px-4 py-4">
        {/* User Profile Section */}
        <TouchableOpacity
          className="mb-4 flex-row items-center rounded-lg bg-white p-4"
          onPress={() => setProfileModalVisible(true)}>
          <View className="mr-3 h-12 w-12 overflow-hidden rounded-full bg-gray-200">
            <Image
              source={
                user?.photoURL ? { uri: user.photoURL } : require('../assets/default-avatar.png')
              }
              className="size-12"
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {user?.displayName || 'John Doe'}
            </Text>
            <Text className="text-sm text-gray-500">{user?.email || 'johndoe2025@gmail.com'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Settings Options */}
        <View className="rounded-lg bg-white">
          {/* Device Connection */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setDeviceModalVisible(true)}>
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <MaterialIcons name="bluetooth" size={20} color="#3b82f6" />
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {t('settings.deviceConnection.title')}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-sm text-gray-400">
                {isDeviceConnected
                  ? t('settings.deviceConnection.connected')
                  : t('settings.deviceConnection.notConnected')}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </View>
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setNotificationModalVisible(true)}>
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MaterialIcons name="notifications" size={20} color="#10b981" />
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {t('settings.notifications.title')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setLanguageModalVisible(true)}>
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <MaterialIcons name="language" size={20} color="#8b5cf6" />
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {t('settings.language.title')}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-sm text-gray-400">
                {languages[language as keyof typeof languages]}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </View>
          </TouchableOpacity>

          {/* Privacy & Terms */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setPrivacyModalVisible(true)}>
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <MaterialIcons name="security" size={20} color="#f59e0b" />
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {t('settings.privacyAndTerms.title')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* Version */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <MaterialIcons name="info" size={20} color="#6b7280" />
              </View>
              <Text className="text-base font-semibold text-gray-800">{t('settings.version')}</Text>
            </View>
            <Text className="text-sm text-gray-400">0.0.5</Text>
          </View>
        </View>
      </View>

      {/* Modals */}
      <DeviceConnectionModal
        visible={deviceModalVisible}
        onClose={() => setDeviceModalVisible(false)}
        onCodeScanned={handleQRCodeScanned}
        isConnected={isDeviceConnected}
        deviceId={deviceId}
        onDisconnect={() => setDeviceConnection(false)}
      />

      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

      <PrivacyTermsModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      <ProfileModal visible={profileModalVisible} onClose={() => setProfileModalVisible(false)} />
    </SafeAreaView>
  );
}
