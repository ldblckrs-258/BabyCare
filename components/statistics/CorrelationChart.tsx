import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type CorrelationChartProps = {
  badPositionData: { value: number; label: string }[];
  cryingData: { value: number; label: string }[];
};

export default function CorrelationChart({ badPositionData, cryingData }: CorrelationChartProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-4 w-full rounded-xl bg-white p-3 shadow mt-4">
      <View className="flex-row items-center justify-between pb-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="equalizer" size={20} color="#3D8D7A" />
          <Text className="text-base font-semibold text-gray-800">{t('statistics.correlate')}</Text>
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
              data={badPositionData}
              data2={cryingData}
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
  );
}
