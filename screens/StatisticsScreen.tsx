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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Reference to unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null);
  // Reference to interval for auto refresh
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial device when connections are loaded
  useEffect(() => {
    if (connections.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(connections[0]?.deviceId);
    }
  }, [connections, selectedDeviceId]);

  // Fetch statistics data and setup listener
  const fetchAndSubscribe = useCallback(async (deviceId: string, forceFresh: boolean = false) => {
    if (!deviceId) return;

    setIsLoading(true);
    try {
      // Initial fetch with force refresh option
      const data = await DeviceEventService.getStatisticsData(deviceId, forceFresh);
      setStatistics(data);

      // Setup real-time listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Use the listenToDeviceEvents method to get real-time updates
      unsubscribeRef.current = DeviceEventService.listenToDeviceEvents(deviceId, async () => {
        // When events change, refetch the statistics
        const updatedData = await DeviceEventService.getStatisticsData(deviceId, true);
        setStatistics(updatedData);
      });
    } catch (error) {
      console.error('Error setting up statistics listener:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup auto refresh interval
  const setupRefreshInterval = useCallback((deviceId: string) => {
    // Clear any existing interval first
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Create new interval to refresh data every 30 seconds
    refreshIntervalRef.current = setInterval(async () => {
      if (!deviceId) return;

      try {
        // Silently refresh without showing loading state
        const updatedData = await DeviceEventService.getStatisticsData(deviceId, true);
        setStatistics(updatedData);
      } catch (error) {
        console.error('Error auto-refreshing statistics:', error);
      }
    }, 30 * 1000); // 30 seconds
  }, []);

  // When selected device changes
  useEffect(() => {
    if (selectedDeviceId) {
      fetchAndSubscribe(selectedDeviceId);
      setupRefreshInterval(selectedDeviceId);
    }

    // Cleanup listener and interval when component unmounts or device changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [selectedDeviceId, fetchAndSubscribe, setupRefreshInterval]);

  // Reload statistics when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedDeviceId) {
        // Force refresh data when the screen comes into focus
        fetchAndSubscribe(selectedDeviceId, true);
        // Re-establish auto refresh
        setupRefreshInterval(selectedDeviceId);
      }

      // Return cleanup function for when screen goes out of focus
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }, [selectedDeviceId, fetchAndSubscribe, setupRefreshInterval])
  );

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
    <SafeAreaView className="flex-1 bg-neutral-100 pt-10">
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
        <ScrollView className="flex-1 px-4">
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
