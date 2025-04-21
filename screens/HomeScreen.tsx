import { DeviceCard, NoDevicesCard } from '@/components/dashboard';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

// Mock data for crying/position status - in a real app this would come from your backend
const mockDeviceStatus: {
  crying: { [key: string]: { isCrying: boolean; duration: number } };
  position: { [key: string]: { isBadPosition: boolean; duration: number } };
} = {
  crying: {
    'device-001': { isCrying: true, duration: 90 },
    'device-002': { isCrying: false, duration: 0 },
    'device-003': { isCrying: false, duration: 0 },
  },
  position: {
    'device-001': { isBadPosition: false, duration: 0 },
    'device-002': { isBadPosition: false, duration: 0 },
    'device-003': { isBadPosition: true, duration: 138 },
  },
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const {
    devices,
    connections,
    loading,
    error,
    connectDevice,
    getConnectionByDeviceId,
    selectConnection,
  } = useDeviceHook();

  // State for the UI
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((value) => ({ value }))
  );

  // User's name from auth store
  const lastName = useMemo(
    () => user?.displayName?.split(' ').slice(-1)[0] || 'User',
    [user?.displayName]
  );

  // Effect to update chart data periodically (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newValue = Math.floor(Math.random() * 10); // Random value between 0-9
        const newData = [...prevData.slice(1), { value: newValue }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would refresh data from your backend here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Navigation handler for device selection
  const handleSelectDevice = (deviceId: string) => {
    const connection = getConnectionByDeviceId(deviceId);
    if (connection) {
      selectConnection(connection.id);
      navigation.navigate('Streaming' as never);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 px-2 pt-6"
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
        <View className="px-2">
          {devices.length === 0 ? (
            <NoDevicesCard />
          ) : (
            <>
              {/* Device cards */}
              <View className="mb-4">
                <Text className="text-lg font-semibold text-primary-700 mb-2">
                  {t('home.devices')}
                </Text>

                {devices.map((device) => {
                  const connection = getConnectionByDeviceId(device.id);

                  if (!connection) return null;

                  return (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      connection={connection}
                      onPress={handleSelectDevice}
                    />
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
