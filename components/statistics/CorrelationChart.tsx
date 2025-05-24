import { useTranslation } from '@/lib/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
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
    const max = Math.max(badPositionMax, cryingMax, 10); // Min 30 minutes for readable scale

    // Round up to nearest 30
    return Math.ceil(max / 30) * 30;
  }, [badPositionData, cryingData]);

  // Generate Y-axis labels dynamically based on max value
  const yAxisLabels = useMemo(() => {
    return [maxValue, (maxValue * 2) / 3, (maxValue * 1) / 3, 0].map((val) => Math.round(val));
  }, [maxValue]);

  return (
    <View className="mb-4 w-full rounded-xl bg-white p-3 shadow mt-4">
      <View className="flex-row items-center justify-between pb-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="equalizer" size={20} color="#3D8D7A" />
          <Text className="text-base font-semibold text-gray-800">{t('statistics.correlate')}</Text>
        </View>
      </View>

      <View className="flex-row">
        {/* Y-axis labels */}
        <View className="justify-between pr-2 h-52 py-2">
          {yAxisLabels.map((label, index) => (
            <Text key={index} className="text-xs text-gray-500 text-right">
              {label} {t('statistics.min')}
            </Text>
          ))}
        </View>

        {/* Line Chart Component */}
        <View className="flex-1 overflow-hidden">
          <View className="relative">
            {/* Grid lines */}
            <View className="absolute top-0 left-0 right-0 h-full w-full flex flex-col justify-between pt-4 pb-6">
              {yAxisLabels.map((_, index) => (
                <View key={index} className="border-b border-gray-100 h-px " />
              ))}
            </View>
            <View className="-ml-4">
              <LineChart
                areaChart
                data={badPositionData}
                data2={cryingData}
                height={160}
                spacing={44}
                maxValue={maxValue}
                color="#d26165"
                color2="#5d97d3"
                thickness={2}
                startOpacity={0}
                endOpacity={0}
                hideYAxisText
                hideDataPoints={badPositionData.length > 7}
                dataPointsColor="#d26165"
                dataPointsColor2="#5d97d3"
                dataPointsRadius={3}
                hideRules
                hideAxesAndRules
                adjustToWidth
                scrollToEnd={badPositionData.length > 10}
                disableScroll={badPositionData.length <= 10}
              />
            </View>
          </View>

          {/* X-axis labels */}
          <View className="flex-row justify-between bg-white py-2 -mt-5">
            {badPositionData.map((item, index) => (
              <Text key={index} className="text-xs text-gray-500">
                {item.label}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row justify-center w-full gap-4 mt-3">
        <View className="flex-row items-center">
          <View className="h-3 w-3 rounded-full bg-[#d26165] mr-2" />
          <Text className="text-xs text-gray-700">{t('statistics.badPosition')}</Text>
        </View>
        <View className="flex-row items-center">
          <View className="h-3 w-3 rounded-full bg-[#5d97d3] mr-2" />
          <Text className="text-xs text-gray-700">{t('statistics.crying')}</Text>
        </View>
      </View>
    </View>
  );
}
