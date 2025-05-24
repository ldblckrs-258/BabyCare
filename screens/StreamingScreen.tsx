import type { RootStackParamList } from '../types/navigation';
import { EmptyCard } from '@/components/EmptyCard';
import { StreamingModal } from '@/components/modals/StreamingModal';
import { DeviceWithConnection, useDeviceHook } from '@/lib/hooks';
import { useTranslation } from '@/lib/hooks/useTranslation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StreamingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, 'Streaming'>>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithConnection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { connectedDevices } = useDeviceHook();
  // Handle automatic modal opening from navigation params
  useEffect(() => {
    // We don't need connectedDevices as a dependency since we can access it in the callback
    const handleNavigationParams = async () => {
      // Check if we received navigation params with deviceId and openModal flag
      if (route.params?.deviceId && route.params?.openModal) {
        const deviceId = route.params.deviceId;

        // Find the device with the given ID from the connectedDevices array
        const foundDevice = connectedDevices.find((device) => device.device.id === deviceId);

        // If found, open the streaming modal with this device
        if (foundDevice) {
          openStreamingModal(foundDevice);
        }
      }
    };

    handleNavigationParams();
  }, [route.params]);

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
          {item.device.isOnline && (
            <>
              <View className="bg-black aspect-video items-center justify-center">
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
              </View>
              <View className="absolute flex-row items-center rounded-full px-2 py-1 right-2 top-2 bg-green-500">
                <Text className="text-white text-xs font-medium">{t('common.online')}</Text>
              </View>
            </>
          )}
        </View>
        <Card.Content className="pt-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {item.device.isOnline ? (
                <MaterialIcons name="videocam" size={18} color="#3d8d7a" />
              ) : (
                <MaterialIcons name="videocam-off" size={18} color="#999" />
              )}
              <Text className="ml-2 text-base font-medium">{item.connection.name}</Text>
            </View>
            <TouchableOpacity
              className="w-8 rounded-full items-center justify-center"
              onPress={() => openStreamingModal(item)}>
              <MaterialIcons name="chevron-right" size={24} color="#3d8d7a" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

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
          data={connectedDevices.sort(
            (a, b) => (b.device.isOnline ? 1 : 0) - (a.device.isOnline ? 1 : 0)
          )}
          renderItem={renderDeviceCard}
          keyExtractor={(item) => item.connection.id}
          contentContainerStyle={{
            padding: 16,
            flexGrow: connectedDevices.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={EmptyCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Streaming Modal */}
      {selectedDevice && (
        <StreamingModal
          visible={modalVisible}
          onClose={closeStreamingModal}
          deviceId={selectedDevice.device.id}
          deviceName={selectedDevice.connection.name}
          isConnected={selectedDevice.device.isOnline}
          uri={selectedDevice.device.uri || 'https://a756-1-53-82-81.ngrok-free.app/playlist.m3u8'}
        />
      )}
    </View>
  );
}
