import { ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const { isDeviceConnected } = useSettingsStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const badPositionData = {
    isBad: true,
    time: '2m18s',
  };

  const cryData = {
    isCrying: true,
    dataSets: [
      {
        data: [2, 4, 0, 2, 1, 6, 3, 5, 8, 4, 1],
      },
    ],
    time: '1m30s',
  };

  const lastName = user?.displayName?.split(' ').slice(-1)[0];
  const [chartParentWidth, setChartParentWidth] = useState(0);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setChartParentWidth(width);
  };

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
                <View
                  className="flex size-7 items-center justify-center rounded-full bg-amber-500"
                  style={{ borderRadius: 9999 }}>
                  <AntDesign name="disconnect" size={14} color="#fff" />
                </View>
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
            className={`mb-4 h-[252px] flex-col items-center justify-between rounded-[20px] pt-4 ${cryData.isCrying ? 'bg-tertiary-500' : 'bg-primary-400'}`}>
            <View className="flex w-full flex-row items-center justify-between pl-5 pr-4">
              <FontAwesome6
                name={cryData.isCrying ? 'sad-cry' : 'smile-beam'}
                size={20}
                color="white"
              />
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
            <View
              className="-mt-4 w-full overflow-hidden"
              onLayout={handleLayout}
              style={{ width: '100%' }}>
              <View
                style={{
                  transform: [{ translateX: -65 }],
                }}>
                <LineChart
                  data={{
                    datasets: cryData.dataSets,
                    labels: Array(cryData.dataSets[0].data.length).fill(''),
                  }}
                  width={chartParentWidth * 1.5}
                  height={100}
                  chartConfig={{
                    backgroundColor: '#5d97d300',
                    backgroundGradientFrom: '#5d97d300',
                    backgroundGradientTo: '#5d97d300',
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: () => `rgba(255, 255, 255, 0)`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '0',
                    },
                    propsForBackgroundLines: {
                      strokeWidth: 0,
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
                <View
                  className="mt-[-17px] h-14 w-[200%]"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
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
