import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type CryingChartProps = {
  data: number[];
};

export default function CryingChart({ data }: CryingChartProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 rounded-xl bg-white p-3 shadow">
      <View className="flex-row items-center justify-between pb-2">
        <View className="flex-row items-center gap-3 px-1">
          <FontAwesome6 name="baby" size={20} color="#5d97d3" />
          <Text className="text-base font-semibold text-gray-800">{t('statistics.crying')}</Text>
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
            {data.map((value, index) => (
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
  );
}
