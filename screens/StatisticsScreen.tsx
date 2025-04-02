import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function StatisticsScreen() {
  const { t } = useTranslation();

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
    // 12, 2, 0, 0, 4, 7, 10, 3
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

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 pt-12">
      {/* Header */}
      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-primary-600">{t('statistics.title')}</Text>
      </View>

      <ScrollView className="flex-1 px-2">
        {/* Today Overview Section */}
        <View className="mb-4 rounded-xl bg-white p-3 shadow">
          <View className="flex-row items-center gap-2 pb-2">
            <MaterialIcons name="dashboard" size={20} color="#3D8D7A" />
            <Text className="text-base font-semibold text-gray-800">
              {t('statistics.todayOverview')}
            </Text>
          </View>
          <View className="flex flex-row justify-between pt-2 gap-6">
            {/* Bad Position Overview */}
            <View className="flex-1">
              <View className="flex-row items-center pb-2">
                <View className="pb-1 mb-1 w-full border-b border-gray-100 ">
                  <Text className="text-base font-medium text-secondary-800">
                    {t('statistics.badPosition')}
                  </Text>
                </View>
              </View>

              <View className="w-full flex-row flex-wrap gap-2">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">12</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.totalTime')}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">32.6</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.totalMinutes')}</Text>
                </View>
              </View>
              <View className="w-full flex-row flex-wrap gap-2 pt-4">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">13:42 - 13:56</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.longestPeriod')}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">14</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.longestDuration')}</Text>
                </View>
              </View>
            </View>

            {/* Crying Overview */}
            <View className="flex-1">
              <View className="flex-row items-center pb-1">
                <View className="pb-1 mb-2 w-full border-b border-gray-100 ">
                  <Text className="text-base font-medium text-tertiary-800">
                    {t('statistics.crying')}
                  </Text>
                </View>
              </View>

              <View className="w-full flex-row flex-wrap gap-2">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">21</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.totalTimes')}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">42.4</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.totalMinutes')}</Text>
                </View>
              </View>
              <View className="w-full flex-row flex-wrap gap-2 pt-3">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">13:42 - 13:56</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.longestPeriod')}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">14</Text>
                  <Text className="text-xs text-gray-500">{t('statistics.longestDuration')}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View className="flex-row flex-wrap justify-between">
          <View className="flex flex-row items-center gap-4 w-full">
            {/* Bad Position Chart */}
            <View className="flex-1 rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between pb-2">
                <View className="flex-row items-center gap-3 px-1">
                  <FontAwesome6 name="bed" size={16} color="#d26165" />
                  <Text className="text-base font-semibold text-gray-800">
                    {t('statistics.badPosition')}
                  </Text>
                </View>
                <Entypo name="chevron-right" size={20} color="#E0E0E0" />
              </View>

              <View className="mt-2 h-32 flex-row">
                {/* Y-axis labels */}
                <View className="justify-between pr-2 items-end pb-4 -mt-2">
                  <Text className="text-xs text-gray-400">30</Text>
                  <Text className="text-xs text-gray-400">20</Text>
                  <Text className="text-xs text-gray-400">10</Text>
                  <Text className="text-xs text-gray-400">0</Text>
                </View>

                {/* Chart Bars */}
                <View className="flex-1">
                  <View className="flex-1 flex-row items-end justify-between">
                    {[12, 2, 0, 0, 4, 7, 10, 3].map((value, index) => (
                      <View key={index} className="items-center w-4">
                        <View className="w-3 rounded-full overflow-hidden">
                          <View className="w-full bg-gray-100" style={{ height: 100 }} />
                          <View
                            className="absolute bottom-0 w-full bg-secondary-400"
                            style={{ height: value * (100 / 30) }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-400">00:00</Text>
                    <Text className="text-xs text-gray-400">12:00</Text>
                    <Text className="text-xs text-gray-400">21:00</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Crying Chart */}
            <View className="flex-1 rounded-xl bg-white p-3 shadow">
              <View className="flex-row items-center justify-between pb-2">
                <View className="flex-row items-center gap-3 px-1">
                  <FontAwesome6 name="baby" size={20} color="#5d97d3" />
                  <Text className="text-base font-semibold text-gray-800">
                    {t('statistics.crying')}
                  </Text>
                </View>
                <Entypo name="chevron-right" size={20} color="#E0E0E0" />
              </View>

              <View className="mt-2 h-32 flex-row">
                {/* Y-axis labels */}
                <View className="justify-between pr-2 items-end pb-4 -mt-2">
                  <Text className="text-xs text-gray-400">60</Text>
                  <Text className="text-xs text-gray-400">40</Text>
                  <Text className="text-xs text-gray-400">20</Text>
                  <Text className="text-xs text-gray-400">0</Text>
                </View>

                {/* Chart Bars */}
                <View className="flex-1">
                  <View className="flex-1 flex-row items-end justify-between">
                    {[45, 22, 38, 15, 50, 42, 20, 25].map((value, index) => (
                      <View key={index} className="items-center w-4">
                        <View className="w-3 rounded-full overflow-hidden">
                          <View className="w-full bg-gray-100" style={{ height: 100 }} />
                          <View
                            className="absolute bottom-0 w-full bg-tertiary-400"
                            style={{ height: value * (100 / 60) }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-400">00:00</Text>
                    <Text className="text-xs text-gray-400">12:00</Text>
                    <Text className="text-xs text-gray-400">21:00</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* Correlate Chart with LineChart component */}
          <View className="mb-4 w-full rounded-xl bg-white p-3 shadow mt-4">
            <View className="flex-row items-center justify-between pb-4">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="equalizer" size={20} color="#3D8D7A" />
                <Text className="text-base font-semibold text-gray-800">
                  {t('statistics.correlate')}
                </Text>
              </View>
              <Entypo name="chevron-right" size={20} color="#E0E0E0" />
            </View>

            {/* Y-axis labels */}
            <View className="flex-row">
              <View className="justify-between pr-2 h-52 py-2">
                <Text className="text-xs text-gray-400">90 {t('statistics.min')}</Text>
                <Text className="text-xs text-gray-400">60 {t('statistics.min')}</Text>
                <Text className="text-xs text-gray-400">30 {t('statistics.min')}</Text>
                <Text className="text-xs text-gray-400">0 {t('statistics.min')}</Text>
              </View>

              {/* Line Chart Component */}
              <View className="flex-1 overflow-hidden">
                <View className="-ml-4 relative">
                  <View className="pb-6 pt-4 px-3 absolute top-0 left-0 right-0 h-full w-full flex flex-col justify-between">
                    <View className="border-b border-gray-100 h-px" />
                    <View className="border-b border-gray-100 h-px" />
                    <View className="border-b border-gray-100 h-px" />
                    <View className="border-b border-gray-100 h-px" />
                  </View>
                  <LineChart
                    areaChart
                    data={correlationData.badPositionData}
                    data2={correlationData.cryingData}
                    height={160}
                    spacing={24}
                    maxValue={90}
                    color="#d26165"
                    color2="#5d97d3"
                    thickness={2}
                    startOpacity={0}
                    endOpacity={0}
                    curved
                    hideYAxisText
                    hideDataPoints
                    hideRules
                    hideAxesAndRules
                    adjustToWidth
                    scrollToEnd
                    disableScroll
                  />
                </View>
                <View className="flex-row justify-between pl-6 pr-4 bg-white py-2 -mt-6">
                  <Text className="text-xs text-gray-400">01/03</Text>
                  <Text className="text-xs text-gray-400">08/03</Text>
                  <Text className="text-xs text-gray-400">15/03</Text>
                  <Text className="text-xs text-gray-400">22/03</Text>
                  <Text className="text-xs text-gray-400">29/03</Text>
                </View>
              </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-around w-full space-x-4 mt-1 pl-10">
              <View className="flex-row items-center">
                <View className="h-3 w-3 rounded-full bg-secondary-600 mr-1" />
                <Text className="text-xs text-gray-700">{t('statistics.badPosition')}</Text>
              </View>
              <View className="flex-row items-center">
                <View className="h-3 w-3 rounded-full bg-tertiary-600 mr-1" />
                <Text className="text-xs text-gray-700">{t('statistics.crying')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
