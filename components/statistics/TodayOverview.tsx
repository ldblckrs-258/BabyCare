import { useTranslation } from '@/lib/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type OverviewProps = {
  badPositionData: {
    totalCount: number;
    totalMinutes: number;
    longestPeriod: string;
    longestDuration: number;
  };
  cryingData: {
    totalCount: number;
    totalMinutes: number;
    longestPeriod: string;
    longestDuration: number;
  };
};

export default function TodayOverview({ badPositionData, cryingData }: OverviewProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-4 rounded-xl bg-white p-3 py-6 shadow">
      <View className="flex-row items-center gap-2 pb-2">
        <MaterialIcons name="dashboard" size={20} color="#3D8D7A" />
        <Text className="text-base font-semibold text-gray-800">
          {t('statistics.todayOverview')}
        </Text>
      </View>
      <View className="flex flex-col justify-between pt-2 gap-6">
        {/* Bad Position Overview */}
        <View className="flex-1">
          <View className="flex-row items-center pb-2">
            <View className="pb-1 mb-1 w-full border-b border-gray-100 ">
              <Text className="text-base font-medium text-secondary-800">
                {t('statistics.badPosition')}
              </Text>
            </View>
          </View>

          <View className="w-full flex-row flex-wrap gap-2 pl-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {badPositionData.totalCount}
              </Text>
              <Text className="text-xs text-gray-500">{t('statistics.totalTimes')}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {badPositionData.totalMinutes}
              </Text>
              <Text className="text-xs text-gray-500">{t('statistics.totalMinutes')}</Text>
            </View>
          </View>
          <View className="w-full flex-row flex-wrap gap-2 pt-4 pl-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {badPositionData.longestPeriod}
              </Text>
              <Text className="text-xs text-gray-500">{t('statistics.longestPeriod')}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {badPositionData.longestDuration}
              </Text>
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

          <View className="w-full flex-row flex-wrap gap-2 pl-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">{cryingData.totalCount}</Text>
              <Text className="text-xs text-gray-500">{t('statistics.totalTimes')}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">{cryingData.totalMinutes}</Text>
              <Text className="text-xs text-gray-500">{t('statistics.totalMinutes')}</Text>
            </View>
          </View>
          <View className="w-full flex-row flex-wrap gap-2 pt-3 pl-4">
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {cryingData.longestPeriod}
              </Text>
              <Text className="text-xs text-gray-500">{t('statistics.longestPeriod')}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                {cryingData.longestDuration}
              </Text>
              <Text className="text-xs text-gray-500">{t('statistics.longestDuration')}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
