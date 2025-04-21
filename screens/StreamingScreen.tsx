import { StreamingModal } from '@/components/modals/StreamingModal';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Connection, useConnectionStore } from '@/stores/connectionStore';
import { Device, useDeviceStore } from '@/stores/deviceStore';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Card, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DeviceWithConnection = {
  device: Device;
  connection: Connection;
};

export default function StreamingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithConnection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { connections } = useConnectionStore();
  const { devices, getDeviceById } = useDeviceStore();

  // Combine device and connection data
  const connectedDevices = connections
    .map((connection) => {
      const device = getDeviceById(connection.deviceId);
      if (device) {
        return {
          device,
          connection,
        };
      }
      return null;
    })
    .filter((item) => item !== null) as DeviceWithConnection[];

  useEffect(() => {
    // Simulate loading connected devices
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const openStreamingModal = (deviceWithConnection: DeviceWithConnection) => {
    setSelectedDevice(deviceWithConnection);
    setModalVisible(true);
  };

  const closeStreamingModal = () => {
    setModalVisible(false);
  };

  const renderDeviceCard = ({ item }: { item: DeviceWithConnection }) => {
    return (
      <Card className="mb-4 overflow-hidden" onPress={() => openStreamingModal(item)}>
        <View className="relative">
          {/* Preview Image */}
          <View className="bg-black aspect-video items-center justify-center">
            {item.device.isOnline ? (
              <View className="w-full h-full items-center justify-center">
                {/* Placeholder stream preview */}
                <View className="absolute inset-0 bg-black opacity-70" />
                <FontAwesome6 name="video" size={32} color="#ffffff" />
                <Text className="text-white mt-2">{t('streaming.tapToView')}</Text>
                {/* Live indicator */}
                <View className="absolute bottom-3 left-3 flex-row items-center bg-black/50 rounded-full px-2 py-1">
                  <View className="size-2 bg-rose-500 rounded-full mr-1" />
                  <Text className="text-white text-xs">{t('streaming.live')}</Text>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center">
                <FontAwesome6 name="video-slash" size={32} color="#888888" />
                <Text className="text-gray-400 mt-2">{t('common.offline')}</Text>
              </View>
            )}
          </View>

          {/* Status indicator */}
          <View
            className={`absolute top-2 right-2 flex-row items-center rounded-full px-2 py-1 ${item.device.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}>
            <Text className="text-white text-xs font-medium">
              {item.device.isOnline ? t('common.online') : t('common.offline')}
            </Text>
          </View>
        </View>

        <Card.Content className="pt-3 pb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="videocam" size={18} color="#3d8d7a" />
              <Text className="ml-2 text-base font-medium">{item.connection.name}</Text>
            </View>
            <TouchableOpacity
              className="h-8 w-8 rounded-full items-center justify-center"
              onPress={() => openStreamingModal(item)}>
              <MaterialIcons name="chevron-right" size={24} color="#3d8d7a" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center py-16">
      <FontAwesome6 name="video-slash" size={50} color="#d1d5db" />
      <Text className="mt-4 text-lg font-semibold text-gray-600">
        {t('streaming.noDevicesConnected')}
      </Text>
      <Text className="mt-2 text-center text-gray-500 px-6">
        {t('streaming.connectDeviceMessage')}
      </Text>
      <TouchableOpacity
        className="mt-6 bg-primary-500 py-3 px-6 rounded-full"
        onPress={() => navigation.navigate('Settings' as never)}>
        <Text className="text-white font-medium">{t('streaming.goToSettings')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4 mt-1">
        <Text className="text-2xl font-bold text-primary-600">{t('streaming.title')}</Text>
      </View>

      {/* Device List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3d8d7a" />
          <Text className="mt-4 text-base text-gray-600">{t('streaming.loadingDevices')}</Text>
        </View>
      ) : (
        <FlatList
          data={connectedDevices}
          renderItem={renderDeviceCard}
          keyExtractor={(item) => item.connection.id}
          contentContainerStyle={{
            padding: 16,
            flexGrow: connectedDevices.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Device FAB */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#3d8d7a',
        }}
        color="#fff"
        onPress={() => navigation.navigate('Settings' as never)}
      />

      {/* Streaming Modal */}
      {selectedDevice && (
        <StreamingModal
          visible={modalVisible}
          onClose={closeStreamingModal}
          deviceId={selectedDevice.device.id}
          deviceName={selectedDevice.connection.name}
          isConnected={selectedDevice.device.isOnline}
        />
      )}
    </View>
  );
}
