import { DeviceItem } from './DeviceItem';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { FlatList, Text, View } from 'react-native';

export function DeviceList() {
  const { t } = useTranslation();
  const { connectedDevices } = useDeviceHook();

  if (connectedDevices.length === 0) {
    return (
      <View className="rounded-lg bg-gray-50 px-4 py-10">
        <Text className="text-center text-gray-500">{t('devices.noDevicesConnected')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={connectedDevices}
      keyExtractor={(item) => item.connection.id}
      scrollEnabled={false}
      renderItem={({ item }) => {
        return <DeviceItem data={item} />;
      }}
    />
  );
}
