import { RenameModal } from './RenameModal';
import { ThresholdModal } from './ThresholdModal';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Connection } from '@/stores/connectionStore';
import { Device } from '@/stores/deviceStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';

type DeviceItemProps = {
  connection: Connection;
  device?: Device;
};

export function DeviceItem({ connection, device }: DeviceItemProps) {
  const { t } = useTranslation();
  const { disconnectDevice } = useDeviceHook();
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);

  const handleDisconnect = (connectionId: string) => {
    disconnectDevice(connectionId);
  };

  return (
    <View className="mb-2 rounded-lg border border-gray-200 bg-white p-4 pr-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-medium text-gray-800">{connection.name}</Text>
            <View className="size-1 rounded-full bg-gray-300" />
            {device?.isOnline ? (
              <Text className="inline text-green-700">{t('common.online')}</Text>
            ) : (
              <Text className="inline text-red-700">{t('common.offline')}</Text>
            )}
          </View>
          {device && (
            <View className="mt-1 flex-row">
              <Text className="text-xs text-gray-500">
                Cry: {device.cryingThreshold}s • Prone: {device.proneThreshold}s • No Blanket:
                {device.noBlanketThreshold}s • Side: {device.sideThreshold}s
              </Text>
            </View>
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
                handleDisconnect(connection.id);
              }}
              title={t('devices.options.disconnect')}
              leadingIcon="link-off"
            />
          </Menu>
        </View>
      </View>

      {renameModalVisible && (
        <RenameModal
          connectionId={connection.id}
          currentName={connection.name}
          visible={renameModalVisible}
          onClose={() => setRenameModalVisible(false)}
        />
      )}

      {thresholdModalVisible && device && (
        <ThresholdModal
          deviceId={connection.deviceId}
          cryingThreshold={device.cryingThreshold}
          sideThreshold={device.sideThreshold}
          proneThreshold={device.proneThreshold}
          noBlanketThreshold={device.noBlanketThreshold}
          visible={thresholdModalVisible}
          onClose={() => setThresholdModalVisible(false)}
        />
      )}
    </View>
  );
}
