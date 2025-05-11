import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type CorrelationChartProps = {
  badPositionData: { value: number; label: string }[];
  cryingData: { value: number; label: string }[];
};

export default function CorrelationChart({ badPositionData, cryingData }: CorrelationChartProps) {
  const { t } = useTranslation();

  // Calculate max value for dynamic scale
  const maxValue = useMemo(() => {
    const badPositionMax = Math.max(...badPositionData.map((item) => item.value), 0);
    const cryingMax = Math.max(...cryingData.map((item) => item.value), 0);
    const max = Math.max(badPositionMax, cryingMax, 30); // Min 30 minutes for readable scale

    // Round up to nearest 30
    return Math.ceil(max / 30) * 30;
  }, [badPositionData, cryingData]);

  // Generate Y-axis labels dynamically based on max value
  const yAxisLabels = useMemo(() => {
    return [maxValue, (maxValue * 2) / 3, (maxValue * 1) / 3, 0].map((val) => Math.round(val));
  }, [maxValue]);

  // Generate X-axis labels dynamically based on data
  const xAxisLabels = useMemo(() => {
    // Extract and format date labels from the data
    if (badPositionData.length === 0) return [''];

    // For weekly chart, show first, middle, and last dates
    const dates = badPositionData.map((item) => item.label);

    if (dates.length <= 3) return dates;

    return [dates[0], dates[Math.floor(dates.length / 2)], dates[dates.length - 1]];
  }, [badPositionData]);

  return (
    <View className="mb-4 w-full rounded-xl bg-white p-3 shadow mt-4">
      <View className="flex-row items-center justify-between pb-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="equalizer" size={20} color="#3D8D7A" />
          <Text className="text-base font-semibold text-gray-800">{t('statistics.correlate')}</Text>
        </View>
      </View>

      {/* Y-axis labels */}
      <View className="flex-row">
        <View className="justify-between pr-2 h-52 py-2">
          {yAxisLabels.map((label, index) => (
            <Text key={index} className="text-xs text-gray-400">
              {label} {t('statistics.min')}
            </Text>
          ))}
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
              data={badPositionData}
              data2={cryingData}
              height={160}
              spacing={24}
              maxValue={maxValue}
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
            {xAxisLabels.map((label, index) => (
              <Text key={index} className="text-xs text-gray-400">
                {label}
              </Text>
            ))}
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
  );
}
