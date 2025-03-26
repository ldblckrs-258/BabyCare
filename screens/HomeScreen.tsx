import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function HomeScreen() {
  const { isDeviceConnected } = useSettingsStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const badPositionData = {
    isBad: true,
    time: '2m18s',
  };

  const [chartData, setChartData] = useState(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((value) => ({ value }))
  );

  const cryData = {
    isCrying: true,
    dataSets: chartData,
    time: '1m30s',
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newValue = Math.floor(Math.random() * 10); // Random value between 0-9
        const newData = [...prevData, { value: newValue }];
        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const lastName = user?.displayName?.split(' ').slice(-1)[0];

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );

  // Use useEffect to avoid memory leaks with setInterval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView className="flex-1 bg-neutral-100 px-2 pt-6">
      {/* Header */}
      <View className="mb-6 mt-12 px-2">
        <Text className="text-[32px] font-medium leading-10 text-primary-600">
          {t('home.title.greeting')} {lastName},
        </Text>
        <Text className="text-4xl font-normal text-primary-600">{t('home.title.dashboard')}</Text>
      </View>
      {/* Cards */}
      <View className="flex flex-row gap-4">
        <View className="flex-1">
          {/* Connect Status */}
          <View
            className="mb-4 h-[128px] flex-col items-center justify-between rounded-[20px] bg-white p-4"
            style={{
              boxShadow: '0px 6px 10px 4px hsl(var(--shadow))',
            }}>
            <View className="flex w-full flex-row items-center justify-between">
              {isDeviceConnected ? (
                <AntDesign name="checkcircle" size={24} color="#3d8d7a" />
              ) : (
                <AntDesign name="disconnect" size={18} color="#f59e0b" />
              )}
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={isDeviceConnected ? '#b1ded0' : '#cbd5e1'}
              />
            </View>
            <View className="flex w-full">
              <Text
                className={`mt-2 text-left text-2xl font-medium ${isDeviceConnected ? 'text-primary-500' : 'text-slate-700'}`}>
                {isDeviceConnected
                  ? t('home.device.connected.title')
                  : t('home.device.notConnected.title')}
              </Text>
              <Text
                className={`text-base ${isDeviceConnected ? 'text-primary-500' : 'text-slate-500'}`}>
                {isDeviceConnected
                  ? t('home.device.connected.description')
                  : t('home.device.notConnected.description')}
              </Text>
            </View>
          </View>

          {/* Bad Position */}
          <View
            className={`mb-4 h-[180px] flex-col items-center justify-between rounded-[20px] p-4 ${badPositionData.isBad ? 'bg-secondary-500' : 'bg-primary-400'}`}>
            <View className="flex w-full flex-row items-center justify-between pl-1">
              <FontAwesome6 name="bed" size={20} color="white" />
              <Entypo name="chevron-right" size={24} color="white" />
            </View>
            <View className="flex w-full">
              <Text className="mt-2 text-left text-2xl font-medium text-white">
                {badPositionData.isBad
                  ? t('home.badPosition.true.title')
                  : t('home.badPosition.false.title')}
              </Text>
              <Text className="text-base text-slate-100">
                {badPositionData.isBad
                  ? `${t('home.badPosition.true.description')} ${badPositionData.time}`
                  : t('home.badPosition.false.description')}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-1">
          {/* Crying */}
          <View
            className={`mb-4 h-[252px] flex-col items-center justify-between overflow-hidden rounded-[20px] pt-4 ${cryData.isCrying ? 'bg-tertiary-500' : 'bg-primary-400'}`}>
            <View className="flex w-full flex-row items-center justify-between pl-5 pr-4">
              <FontAwesome6 name="baby" size={20} color="white" />
              <Entypo name="chevron-right" size={24} color="white" />
            </View>
            <View className="flex w-full px-4">
              <Text className="mt-2 text-left text-2xl font-medium text-white">
                {cryData.isCrying ? t('home.cry.true.title') : t('home.cry.false.title')}
              </Text>
              <Text className="text-base text-slate-100">
                {cryData.isCrying
                  ? `${t('home.cry.true.description')} ${cryData.time}`
                  : t('home.cry.false.description')}
              </Text>
            </View>
            <View className="flex w-full">
              <View
                className="overflow-hidden"
                style={{
                  transform: [{ translateX: -40 }],
                  width: '135%',
                }}>
                <LineChart
                  areaChart
                  data={cryData.dataSets}
                  height={100}
                  hideDataPoints
                  hideDataPoints1={false}
                  hideAxesAndRules
                  color="white"
                  startFillColor="rgba(255, 255, 255, 0.6)"
                  endFillColor="rgba(255, 255, 255, 0.1)"
                  startOpacity={0.6}
                  endOpacity={0.1}
                  spacing={20}
                  thickness={2}
                  adjustToWidth
                  curved
                  curveType={1}
                  scrollToEnd
                  disableScroll
                />
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.13)', 'transparent']}
                  className="relative mt-[-25px] h-8 w-full"
                />
              </View>
            </View>
          </View>

          {/* Clock */}
          <View
            className="flex h-16 flex-row items-center justify-around rounded-full bg-white px-6"
            style={{
              boxShadow: '0px 6px 10px 4px hsl(var(--shadow))',
            }}>
            <FontAwesome6 name="clock" size={26} color="#3d8d7a" />
            <Text className="text-3xl font-bold text-primary-500">{currentTime}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
