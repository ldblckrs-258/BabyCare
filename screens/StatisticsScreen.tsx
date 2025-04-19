import {
  BadPositionChart,
  CorrelationChart,
  CryingChart,
  DeviceSelector,
  TodayOverview,
} from '@/components/statistics';
import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const { connections, devices } = useDeviceHook();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);

  // Set initial device when connections are loaded
  useEffect(() => {
    if (connections.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(connections[0].deviceId);
    }
  }, [connections, selectedDeviceId]);

  // Create structured data for the correlation chart
  const correlationData = useMemo(() => {
    // Bad position data (red line)
    const badPositionData = [
      { value: 10, label: '01/03' },
      { value: 20, label: '02/03' },
      { value: 25, label: '03/03' },
      { value: 40, label: '04/03' },
      { value: 35, label: '05/03' },
      { value: 28, label: '06/03' },
      { value: 45, label: '07/03' },
      { value: 50, label: '08/03' },
      { value: 45, label: '09/03' },
      { value: 50, label: '10/03' },
      { value: 38, label: '11/03' },
      { value: 32, label: '12/03' },
      { value: 22, label: '13/03' },
    ];

    // Crying data (blue line)
    const cryingData = [
      { value: 50, label: '01/03' },
      { value: 35, label: '02/03' },
      { value: 45, label: '03/03' },
      { value: 32, label: '04/03' },
      { value: 55, label: '05/03' },
      { value: 60, label: '06/03' },
      { value: 42, label: '07/03' },
      { value: 35, label: '08/03' },
      { value: 28, label: '09/03' },
      { value: 68, label: '10/03' },
      { value: 72, label: '11/03' },
      { value: 55, label: '12/03' },
      { value: 40, label: '13/03' },
    ];

    return {
      badPositionData,
      cryingData,
    };
  }, []);

  // Mock data for today's overview - in a real app, this would be fetched based on selectedDeviceId
  const todayOverviewData = useMemo(
    () => ({
      badPositionData: {
        totalCount: 12,
        totalMinutes: 32.6,
        longestPeriod: '13:42 - 13:56',
        longestDuration: 14,
      },
      cryingData: {
        totalCount: 21,
        totalMinutes: 42.4,
        longestPeriod: '13:42 - 13:56',
        longestDuration: 14,
      },
    }),
    [selectedDeviceId]
  ); // In a real app, this would depend on selectedDeviceId

  // Mock data for daily charts - in a real app, this would be fetched based on selectedDeviceId
  const badPositionChartData = useMemo(() => [12, 2, 0, 0, 4, 7, 10, 3], [selectedDeviceId]);
  const cryingChartData = useMemo(() => [45, 22, 38, 15, 50, 42, 20, 25], [selectedDeviceId]);

  // Handle device selection
  const handleSelectDevice = (device: { id: string; name: string; connectionId: string }) => {
    setSelectedDeviceId(device.id);
    // In a real app, you would fetch data specific to the selected device here
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 pt-12">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-primary-600">{t('statistics.title')}</Text>

        {/* Device Selector Dropdown */}
        <DeviceSelector selectedDeviceId={selectedDeviceId} onSelectDevice={handleSelectDevice} />
      </View>

      <ScrollView className="flex-1 px-2">
        {/* Today Overview Section */}
        <TodayOverview
          badPositionData={todayOverviewData.badPositionData}
          cryingData={todayOverviewData.cryingData}
        />

        {/* Charts Section */}
        <View className="flex-row flex-wrap justify-between">
          <View className="flex flex-row items-center gap-4 w-full">
            {/* Bad Position Chart */}
            <BadPositionChart data={badPositionChartData} />

            {/* Crying Chart */}
            <CryingChart data={cryingChartData} />
          </View>

          {/* Correlation Chart with LineChart component */}
          <CorrelationChart
            badPositionData={correlationData.badPositionData}
            cryingData={correlationData.cryingData}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
