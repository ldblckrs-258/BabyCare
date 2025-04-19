import { SlideModal } from './SlideModal';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { simulateNotification } from '@/lib/notificationService';
import { NotificationType } from '@/lib/notifications';
import { useSettingsStore } from '@/stores/settingsStore';
import { Text, View } from 'react-native';

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { notifications, updateNotificationSettings, addNotification } = useSettingsStore();
  const { t } = useTranslation();

  const handleTestNotification = async (type: NotificationType) => {
    // Simulate notification
    const notification = await simulateNotification(type);
    // Add to store (in case the notification service failed to add it)
    addNotification(notification);
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
            checked={notifications.enableNotifications}
            onCheckedChange={(checked) =>
              updateNotificationSettings({ enableNotifications: checked })
            }
          />
        </View>
        <View className="flex flex-row gap-4 items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {t('settings.notifications.enableDailyReport')}
            </Text>
            <Text className="text-sm text-gray-500">
              {t('settings.notifications.enableDailyReportDescription')}
            </Text>
          </View>
          <Switch
            checked={notifications.dailyReport}
            onCheckedChange={(checked) => updateNotificationSettings({ dailyReport: checked })}
          />
        </View>
      </View>
    </SlideModal>
  );
}
