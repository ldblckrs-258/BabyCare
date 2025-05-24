import { DeviceModal } from '../components/modals/DeviceModal';
import { NotificationModal } from '../components/modals/NotificationModal';
import { PrivacyTermsModal } from '../components/modals/PrivacyTermsModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useDeviceHook } from '@/lib/hooks';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { RootStackParamList } from '@/types/navigation';
import EntypoIcons from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const VERSION = '1.0.0';
const languages = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();

  // Modal visibility states
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const { connectedDevices } = useDeviceHook();

  // Language dropdown state
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const route = useRoute<RouteProp<RootStackParamList, 'Settings'>>();

  const handleLanguageSelect = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setLanguageDropdownOpen(false);
  };

  useEffect(() => {
    // Check if the route params contain a modal to open
    if (route.params?.modal) {
      switch (route.params.modal) {
        case 'devices':
          setDeviceModalVisible(true);
          break;
        case 'notifications':
          setNotificationModalVisible(true);
          break;
        case 'privacy':
          setPrivacyModalVisible(true);
          break;
        case 'profile':
          setProfileModalVisible(true);
          break;
        default:
          break;
      }
    }
  }, [route.params]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
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
          {/* Devices */}
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={() => setDeviceModalVisible(true)}>
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <MaterialIcons name="devices" size={20} color="#3b82f6" />
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {t('settings.devices.title')}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-sm text-gray-400">
                {connectedDevices.length > 0
                  ? t('settings.devices.connected')
                  : t('settings.devices.notConnected')}
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
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <MaterialIcons name="language" size={20} color="#8b5cf6" />
              </View>
              <Text className="text-base font-semibold text-gray-800">
                {t('settings.language.title')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="flex-row items-center justify-between gap-2 py-2 rounded-md">
              <Text className="mr-2 text-sm text-gray-400">
                {languages[language as keyof typeof languages]}
              </Text>
              <EntypoIcons
                name={languageDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>

            {/* Dropdown menu */}
            {languageDropdownOpen && (
              <View className="absolute top-16 right-4 bg-slate-50 z-10 rounded-md shadow-lg py-1 w-40">
                <TouchableOpacity
                  className={`px-4 py-3 ${language === 'en' ? 'bg-primary-100' : ''}`}
                  onPress={() => handleLanguageSelect('en')}>
                  <Text
                    className={`${language === 'en' ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}>
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-3 ${language === 'vi' ? 'bg-primary-100' : ''}`}
                  onPress={() => handleLanguageSelect('vi')}>
                  <Text
                    className={`${language === 'vi' ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}>
                    Tiếng Việt
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
            <Text className="text-sm text-gray-400">{VERSION}</Text>
          </View>
        </View>
      </View>
      {/* Modals */}
      <DeviceModal visible={deviceModalVisible} onClose={() => setDeviceModalVisible(false)} />
      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
      <PrivacyTermsModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />
      <ProfileModal visible={profileModalVisible} onClose={() => setProfileModalVisible(false)} />
    </SafeAreaView>
  );
}
