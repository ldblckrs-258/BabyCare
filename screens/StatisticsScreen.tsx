import { EmptyCard } from '@/components/EmptyCard';
import {
  BadPositionChart,
  CorrelationChart,
  CryingChart,
  DeviceSelector,
  TodayOverview,
} from '@/components/statistics';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { DeviceEventService, StatisticsData } from '@/lib/models/deviceEventService';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const { connections, devices } = useDeviceHook();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsData>({
    todayOverview: {
      badPositionData: {
        totalCount: 0,
        totalMinutes: 0,
        longestPeriod: '-',
        longestDuration: 0,
      },
      cryingData: {
        totalCount: 0,
        totalMinutes: 0,
        longestPeriod: '-',
        longestDuration: 0,
      },
    },
    badPositionHourlyData: Array(8).fill(0),
    cryingHourlyData: Array(8).fill(0),
    correlationData: {
      badPositionData: [],
      cryingData: [],
    },
  });

  // Set initial device when connections are loaded
  useEffect(() => {
    if (connections.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(connections[0]?.deviceId);
    }
  }, [connections, selectedDeviceId]);

  // Fetch statistics data when device is selected
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDeviceId) return;

      setIsLoading(true);
      try {
        const data = await DeviceEventService.getStatisticsData(selectedDeviceId);
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDeviceId]);

  // Handle device selection
  const handleSelectDevice = (device: { id: string; name: string; connectionId: string }) => {
    setSelectedDeviceId(device.id);
  };

  if (connections.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 pt-12">
        <View className="px-5 py-4 flex-row items-center justify-start">
          <Text className="text-2xl font-bold text-primary-600">{t('statistics.title')}</Text>
        </View>
        <EmptyCard />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 pt-12">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-primary-600">{t('statistics.title')}</Text>
        {/* Device Selector Dropdown */}
        {connections.length > 0 && devices.length > 0 && (
          <DeviceSelector selectedDeviceId={selectedDeviceId} onSelectDevice={handleSelectDevice} />
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3D8D7A" />
          <Text className="mt-4 text-gray-500">{t('common.loading')}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-2">
          {/* Today Overview Section */}
          <TodayOverview
            badPositionData={statistics.todayOverview.badPositionData}
            cryingData={statistics.todayOverview.cryingData}
          />

          {/* Charts Section */}
          <View className="flex-row flex-wrap justify-between">
            <View className="flex flex-row items-center gap-4 w-full">
              {/* Bad Position Chart */}
              <BadPositionChart data={statistics.badPositionHourlyData} />

              {/* Crying Chart */}
              <CryingChart data={statistics.cryingHourlyData} />
            </View>

            {/* Correlation Chart with LineChart component */}
            <CorrelationChart
              badPositionData={statistics.correlationData.badPositionData}
              cryingData={statistics.correlationData.cryingData}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
