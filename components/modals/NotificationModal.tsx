import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
};

const CryThresholds = [
  { label: 'Low (10 min)', value: 10 },
  { label: 'Medium (5 min)', value: 5 },
  { label: 'High (2 min)', value: 2 },
];

const BadPositionThresholds = [
  { label: 'Low (10 min)', value: 10 },
  { label: 'Medium (5 min)', value: 5 },
  { label: 'High (2 min)', value: 2 },
];

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { notifications, updateNotificationSettings } = useSettingsStore();
  const { t } = useTranslation();

  const handleSave = () => {
    // Settings are already saved in the store
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="h-3/4 rounded-t-3xl bg-white p-6 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">
              {t('settings.notifications.title')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Notification Settings */}
          <View className="flex-1 space-y-4">
            {/* Cry Detection */}
            <View className="rounded-lg bg-gray-50 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-base font-semibold text-gray-800">
                      {t('settings.notifications.cryDetection.title')}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {t('settings.notifications.cryDetection.description')}
                    </Text>
                  </View>
                </View>
                <SelectDropdown
                  data={CryThresholds}
                  onSelect={(selectedItem) => {
                    updateNotificationSettings({ cryDetection: selectedItem.value });
                  }}
                  defaultValue={CryThresholds.find(
                    (item) => item.value === notifications.cryDetection
                  )}
                  renderButton={(selectedItem, isOpened) => (
                    <View className="flex w-[120px] flex-row items-center justify-between gap-2 rounded-md border border-gray-300 px-2 py-2 ">
                      <Text className="text-sm text-gray-800">
                        {selectedItem?.label || '-- Select --'}
                      </Text>
                      <FontAwesome6
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#ccc"
                      />
                    </View>
                  )}
                  renderItem={(item, index, isSelected) => (
                    <View
                      className={`flex-row items-center justify-between border-t border-gray-100 px-2 py-2 ${
                        isSelected ? 'bg-primary-200' : 'bg-transparent'
                      }`}>
                      <Text className=" text-sm text-gray-800">{item.label}</Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  dropdownStyle={{
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    borderWidth: 0,
                  }}
                />
              </View>
            </View>

            {/* Sleep Position */}
            <View className="rounded-lg bg-gray-50 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-base font-semibold text-gray-800">
                      {t('settings.notifications.sleepPosition.title')}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {t('settings.notifications.sleepPosition.description')}
                    </Text>
                  </View>
                </View>
                <SelectDropdown
                  data={BadPositionThresholds}
                  onSelect={(selectedItem) => {
                    updateNotificationSettings({ sleepPosition: selectedItem.value });
                  }}
                  defaultValue={BadPositionThresholds.find(
                    (item) => item.value === notifications.sleepPosition
                  )}
                  renderButton={(selectedItem, isOpened) => (
                    <View className="flex w-[120px] flex-row items-center justify-between gap-2 rounded-md border border-gray-300 px-2 py-2 ">
                      <Text className="text-sm text-gray-800">
                        {selectedItem?.label || '-- Select --'}
                      </Text>
                      <FontAwesome6
                        name={isOpened ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#ccc"
                      />
                    </View>
                  )}
                  renderItem={(item, index, isSelected) => (
                    <View
                      className={`flex-row items-center justify-between border-t border-gray-100 px-2 py-2 ${
                        isSelected ? 'bg-primary-200' : 'bg-transparent'
                      }`}>
                      <Text className=" text-sm text-gray-800">{item.label}</Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  dropdownStyle={{
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    borderWidth: 0,
                  }}
                />
              </View>
            </View>

            {/* Device Disconnected */}
            <View className="rounded-lg bg-gray-50 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-base font-semibold text-gray-800">
                      {t('settings.notifications.deviceDisconnected.title')}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {t('settings.notifications.deviceDisconnected.description')}
                    </Text>
                  </View>
                </View>
                <Switch
                  onCheckedChange={() =>
                    updateNotificationSettings({
                      deviceDisconnected: !notifications.deviceDisconnected,
                    })
                  }
                  checked={notifications.deviceDisconnected}
                  nativeID="deviceDisconnected"
                />
              </View>
            </View>

            {/* Daily Report */}
            <View className="rounded-lg bg-gray-50 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-base font-semibold text-gray-800">
                      {t('settings.notifications.dailyReport.title')}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {t('settings.notifications.dailyReport.description')}
                    </Text>
                  </View>
                </View>
                <Switch
                  onCheckedChange={() =>
                    updateNotificationSettings({
                      dailyReport: !notifications.dailyReport,
                    })
                  }
                  checked={notifications.dailyReport}
                  nativeID="dailyReport"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} className="mt-4 rounded-lg bg-primary-500 p-4">
            <Text className="text-center text-base font-semibold text-white">
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
