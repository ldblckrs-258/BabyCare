import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

type BadPositionChartProps = {
  data: number[];
};

export default function BadPositionChart({ data }: BadPositionChartProps) {
  const { t } = useTranslation();

  // Calculate max value for dynamic scale
  const maxValue = useMemo(() => {
    const max = Math.max(...data, 10); // Min 10 minutes for readable scale
    // Round up to nearest 10
    return Math.ceil(max / 10) * 10;
  }, [data]);

  // Generate Y-axis labels dynamically based on max value
  const yAxisLabels = useMemo(() => {
    const step = maxValue / 3;
    return [maxValue, Math.round(maxValue - step), Math.round(maxValue - 2 * step), 0];
  }, [maxValue]);

  // Time labels for 3-hour periods in a 24-hour day
  const timeLabels = ['00:00', '06:00', '12:00', '18:00', '23:59'];

  return (
    <View className="flex-1 rounded-xl bg-white p-3 shadow">
      <View className="flex-row items-center justify-between pb-2">
        <View className="flex-row items-center gap-3 px-1">
          <FontAwesome6 name="bed" size={16} color="#d26165" />
          <Text className="text-base font-semibold text-gray-800">
            {t('statistics.badPosition')}
          </Text>
        </View>
      </View>

      <View className="mt-2 h-32 flex-row">
        {/* Y-axis labels */}
        <View className="justify-between pr-2 items-end pb-4 -mt-2">
          {yAxisLabels.map((label, index) => (
            <Text key={index} className="text-xs text-gray-400">
              {label}
            </Text>
          ))}
        </View>

        {/* Chart Bars */}
        <View className="flex-1">
          <View className="flex-1 flex-row items-end justify-between">
            {data.map((value, index) => (
              <View key={index} className="items-center w-4">
                <View className="w-3 rounded-full overflow-hidden">
                  <View className="w-full bg-gray-100" style={{ height: 100 }} />
                  <View
                    className="absolute bottom-0 w-full bg-secondary-400"
                    style={{ height: (value / maxValue) * 100 }}
                  />
                </View>
              </View>
            ))}
          </View>
          <View className="flex-row justify-between mt-1">
            {/* Only show first, middle and last time labels to avoid crowding */}
            <Text className="text-xs text-gray-400">{timeLabels[0]}</Text>
            <Text className="text-xs text-gray-400">{timeLabels[2]}</Text>
            <Text className="text-xs text-gray-400">{timeLabels[4]}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
