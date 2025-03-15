import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Switch } from '@/components/ui/switch';
import SelectDropdown from 'react-native-select-dropdown';

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
  const [notificationSettings, setNotificationSettings] = useState({
    cryDetection: 5,
    sleepPosition: 5,
    deviceDisconnected: true,
    dailyReport: false,
  });

  const toggleSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  useEffect(() => {
    console.log('NotificationModal', notificationSettings);
  }, [notificationSettings]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="h-3/4 rounded-t-3xl bg-white p-6 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">Notification Settings</Text>
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
                      Cry Detection Threshold
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Alert when baby is crying continously
                    </Text>
                  </View>
                </View>
                <SelectDropdown
                  data={CryThresholds}
                  onSelect={(selectedItem, index) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      cryDetection: selectedItem.value,
                    });
                  }}
                  defaultValue={CryThresholds.find(
                    (item) => item.value === notificationSettings.cryDetection
                  )}
                  renderButton={(selectedItem, isOpened) => {
                    return (
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
                    );
                  }}
                  renderItem={(item, index, isSelected) => {
                    return (
                      <View
                        className={`flex-row items-center justify-between border-t border-gray-100 px-2 py-2 ${
                          isSelected ? 'bg-primary-200' : 'bg-transparent'
                        }`}>
                        <Text className=" text-sm text-gray-800">{item.label}</Text>
                      </View>
                    );
                  }}
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
                    <Text className="text-base font-semibold text-gray-800">Sleep Position</Text>
                    <Text className="text-sm text-gray-500">
                      Alert for unsafe sleeping positions
                    </Text>
                  </View>
                </View>
                <SelectDropdown
                  data={BadPositionThresholds}
                  onSelect={(selectedItem, index) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      sleepPosition: selectedItem.value,
                    });
                  }}
                  defaultValue={BadPositionThresholds.find(
                    (item) => item.value === notificationSettings.sleepPosition
                  )}
                  renderButton={(selectedItem, isOpened) => {
                    return (
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
                    );
                  }}
                  renderItem={(item, index, isSelected) => {
                    return (
                      <View
                        className={`flex-row items-center justify-between border-t border-gray-100 px-2 py-2 ${
                          isSelected ? 'bg-primary-200' : 'bg-transparent'
                        }`}>
                        <Text className=" text-sm text-gray-800">{item.label}</Text>
                      </View>
                    );
                  }}
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
                      Device Disconnected
                    </Text>
                    <Text className="text-sm text-gray-500">Alert when device disconnects</Text>
                  </View>
                </View>
                <Switch
                  onCheckedChange={() => toggleSetting('deviceDisconnected')}
                  checked={notificationSettings.deviceDisconnected}
                  nativeID="deviceDisconnected"
                />
              </View>
            </View>

            {/* Daily Report */}
            <View className="rounded-lg bg-gray-50 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View>
                    <Text className="text-base font-semibold text-gray-800">Daily Report</Text>
                    <Text className="text-sm text-gray-500">Receive daily summary reports</Text>
                  </View>
                </View>
                <Switch
                  onCheckedChange={() => toggleSetting('dailyReport')}
                  checked={notificationSettings.dailyReport}
                  nativeID="dailyReport"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={onClose} className="mt-4 rounded-lg bg-primary-500 p-4">
            <Text className="text-center text-base font-semibold text-white">Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
