import type { RootStackParamList } from '../types/navigation';
import { EmptyCard } from '@/components/EmptyCard';
import { DeviceCard } from '@/components/dashboard';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { connectedDevices, loading, error, getConnectionByDeviceId, selectConnection } =
    useDeviceHook();

  // State for the UI
  const [refreshing, setRefreshing] = useState(false);

  // User's name from auth store
  const lastName = useMemo(
    () => user?.displayName?.split(' ').slice(-1)[0] || 'User',
    [user?.displayName]
  );

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getConnectionByDeviceId(user?.uid || '');
    } catch (error) {
      console.error('Error refreshing devices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navigation handler for device selection and streaming modal opening
  const handleSelectDevice = (deviceId: string) => {
    const connection = getConnectionByDeviceId(deviceId);
    if (connection) {
      // Select the connection first
      selectConnection(connection.id);

      // Navigate to streaming screen and pass the selected device params
      navigation.navigate('Streaming', {
        deviceId: deviceId,
        connectionId: connection.id,
        openModal: true, // Flag to automatically open the streaming modal
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 px-2 pt-6"
      contentContainerClassName="flex flex-col min-h-full"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View className="mb-6 mt-12 px-2">
        <Text className="text-3xl font-medium text-primary-600">
          {t('home.title.greeting')} {lastName},
        </Text>
        <Text className="text-3xl font-normal text-primary-600">{t('home.title.dashboard')}</Text>
      </View>

      {/* Loading state */}
      {loading && (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3d8d7a" />
        </View>
      )}

      {/* Error state */}
      {error && (
        <View className="bg-red-50 rounded-xl p-4 mb-4 mx-2">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      {/* Devices section */}
      {!loading && (
        <View
          className={`flex-1 px-2 ${connectedDevices.length === 0 ? 'flex items-center justify-center pb-32' : ''}`}>
          {connectedDevices.length === 0 ? (
            <EmptyCard />
          ) : (
            <>
              {/* Device cards */}
              <View className="mb-4">
                <Text className="text-lg font-semibold text-primary-700 mb-2">
                  {t('home.devices')}
                </Text>

                {connectedDevices
                  .sort((a, b) => (b.device.isOnline ? 1 : 0) - (a.device.isOnline ? 1 : 0))
                  .map((data) => {
                    const connection = getConnectionByDeviceId(data.device.id);

                    if (!connection) return null;

                    return (
                      <DeviceCard key={data.device.id} data={data} onPress={handleSelectDevice} />
                    );
                  })}
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}
