import { DeviceItem } from './DeviceItem';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Connection } from '@/stores/connectionStore';
import { FlatList, Text, View } from 'react-native';

type DeviceListProps = {
  connections: Connection[];
};

export function DeviceList({ connections }: DeviceListProps) {
  const { t } = useTranslation();
  const { devices } = useDeviceHook();

  if (connections.length === 0) {
    return (
      <View className="rounded-lg bg-gray-50 px-4 py-10">
        <Text className="text-center text-gray-500">{t('devices.noDevicesConnected')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={connections}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item: connection }) => {
        // Find the associated device for this connection
        const device = devices.find((d) => d.id === connection.deviceId);
        return <DeviceItem connection={connection} device={device} />;
      }}
    />
  );
}
