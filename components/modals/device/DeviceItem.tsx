import { RenameModal } from './RenameModal';
import { ThresholdModal } from './ThresholdModal';
import { DeviceWithConnection, useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';

type DeviceItemProps = {
  data: DeviceWithConnection;
};

export function DeviceItem({ data }: DeviceItemProps) {
  const { t } = useTranslation();
  const { disconnectDevice } = useDeviceHook();
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectDevice(connectionId);
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  return (
    <View className="mb-2 rounded-lg border border-gray-200 bg-white p-4 pr-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-medium text-gray-800">{data.connection.name}</Text>
            <View className="size-1 rounded-full bg-gray-300" />
            {data.device?.isOnline ? (
              <Text className="inline text-green-700">{t('common.online')}</Text>
            ) : (
              <Text className="inline text-red-700">{t('common.offline')}</Text>
            )}
          </View>
          {data.device && (
            <>
              <View className="mt-1 flex-row items-center">
                <Text className="text-xs text-gray-500 flex-1">
                  {t('devices.shortThreshold.cry')}:{' '}
                  {data.device.cryingThreshold
                    ? data.device.cryingThreshold + 's'
                    : t('devices.thresholds.off')}
                </Text>
                <Text className="text-xs text-gray-500 flex-1">
                  {t('devices.shortThreshold.side')}:{' '}
                  {data.device.sideThreshold
                    ? data.device.sideThreshold + 's'
                    : t('devices.thresholds.off')}
                </Text>
              </View>
              <View className="mt-1 flex-row items-center">
                <Text className="text-xs text-gray-500 flex-1">
                  {t('devices.shortThreshold.prone')}:{' '}
                  {data.device.proneThreshold
                    ? data.device.proneThreshold + 's'
                    : t('devices.thresholds.off')}
                </Text>
                <Text className="text-xs text-gray-500 flex-1">
                  {t('devices.shortThreshold.noBlanket')}:{' '}
                  {data.device.noBlanketThreshold
                    ? data.device.noBlanketThreshold + 's'
                    : t('devices.thresholds.off')}{' '}
                </Text>
              </View>
            </>
          )}
        </View>
        <View
          style={{
            zIndex: 1000,
          }}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            style={{
              marginTop: 40,
              zIndex: 1000,
            }}
            anchor={
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                className="size-10 items-center justify-center rounded-full">
                <MaterialIcons name="more-vert" size={24} color="#666" />
              </TouchableOpacity>
            }>
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setRenameModalVisible(true);
              }}
              title={t('devices.options.rename')}
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setThresholdModalVisible(true);
              }}
              title={t('devices.options.threshold')}
              leadingIcon="tune"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleDisconnect(data.connection.id);
              }}
              title={t('devices.options.disconnect')}
              leadingIcon="link-off"
            />
          </Menu>
        </View>
      </View>

      {renameModalVisible && (
        <RenameModal
          connectionId={data.connection.id}
          currentName={data.connection.name}
          visible={renameModalVisible}
          onClose={() => setRenameModalVisible(false)}
        />
      )}

      {thresholdModalVisible && (
        <ThresholdModal
          deviceId={data.device?.id || ''}
          visible={thresholdModalVisible}
          onClose={() => setThresholdModalVisible(false)}
          cryingThreshold={data.device?.cryingThreshold || 0}
          sideThreshold={data.device?.sideThreshold || 0}
          proneThreshold={data.device?.proneThreshold || 0}
          noBlanketThreshold={data.device?.noBlanketThreshold || 0}
        />
      )}
    </View>
  );
}
