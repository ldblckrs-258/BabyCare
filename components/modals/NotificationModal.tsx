import { SlideModal } from './SlideModal';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { AppState, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { t } = useTranslation();
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  // Kiểm tra quyền thông báo hệ điều hành
  useEffect(() => {
    const checkPermission = async () => {
      setChecking(true);
      let granted = false;
      if (Platform.OS === 'android') {
        const settings = await Notifications.getPermissionsAsync();
        granted = settings.granted || settings.status === 'granted';
      } else if (Platform.OS === 'ios') {
        const settings = await Notifications.getPermissionsAsync();
        granted = settings.granted || settings.status === 'granted';
      }
      setPermissionGranted(granted);
      setChecking(false);
    };
    checkPermission();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermission();
    });
    return () => subscription.remove();
  }, []);

  // Hàm yêu cầu quyền thông báo
  const requestPermission = async () => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const settings = await Notifications.requestPermissionsAsync();
      setPermissionGranted(settings.granted || settings.status === 'granted');
    }
  };

  // Hàm mở cài đặt hệ thống
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SlideModal visible={visible} onClose={onClose} title={t('settings.notifications.title')}>
      <View className="flex flex-col gap-6">
        {/* Enable/Disable Notifications */}
        <View className="flex flex-row gap-4 items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {t('settings.notifications.enable')}
            </Text>
            <Text className="text-sm text-gray-500">
              {t('settings.notifications.enableDescription')}
            </Text>
          </View>
          <Switch
            checked={permissionGranted}
            disabled={checking}
            onCheckedChange={async (checked) => {
              if (checked && !permissionGranted) {
                await requestPermission();
              } else if (!checked && permissionGranted) {
                openAppSettings();
              }
            }}
          />
        </View>
        <TouchableOpacity onPress={openAppSettings}>
          <View className="flex flex-row gap-4 items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {t('settings.notifications.batteryOptimizationTitle') ||
                  'Tắt tiết kiệm pin cho ứng dụng'}
              </Text>
              <Text className="text-sm text-gray-500">
                {t('settings.notifications.batteryOptimizationDescription') ||
                  'Để nhận thông báo ổn định, hãy tắt chế độ tiết kiệm pin cho ứng dụng trong phần cài đặt hệ thống.'}
              </Text>
            </View>
            <Entypo name="chevron-right" size={28} color="#ccc" />
          </View>
        </TouchableOpacity>
      </View>
    </SlideModal>
  );
}
