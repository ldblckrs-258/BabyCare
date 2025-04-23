import { DeviceList } from './DeviceList';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Text, TouchableOpacity, View } from 'react-native';

type DeviceModalContentProps = {
  setScanMode: (mode: boolean) => void;
};

export function DeviceModalContent({ setScanMode }: DeviceModalContentProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <View className="rounded-lg bg-primary-50 p-4 mb-6">
        <Text className="text-base font-medium text-gray-700">{t('devices.addNewDevice')}</Text>
        <Text className="mt-1 text-gray-600">{t('devices.scanDescription')}</Text>

        <TouchableOpacity
          className="mt-3 rounded-lg bg-primary-500 px-4 py-3"
          onPress={() => setScanMode(true)}>
          <Text className="text-center font-medium text-white">{t('devices.scanQR')}</Text>
        </TouchableOpacity>
      </View>

      <DeviceList />
    </View>
  );
}
