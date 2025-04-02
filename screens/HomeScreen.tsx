import { useTranslation } from '@/lib/hooks/useTranslation';
import {
  Notification,
  NotificationType,
  formatTime,
  staticNotifications,
} from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// Get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'cry_alert':
      return <FontAwesome6 name="baby" size={20} color="#5d97d3" />;
    case 'position_alert':
      return <FontAwesome6 name="bed" size={16} color="#d26165" />;
    case 'daily_report':
      return <MaterialIcons name="assessment" size={22} color="#a855f7" />;
    case 'system':
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
    default:
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
  }
};

export default function HomeScreen() {
  const { isDeviceConnected } = useSettingsStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigation = useNavigation();

  // State hooks - keep all useState together in the same order
  const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
  const [chartData, setChartData] = useState(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((value) => ({ value }))
  );
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );

  // Memoized values - these won't cause hook order issues
  const badPositionData = useMemo(
    () => ({
      isBad: true,
      time: '2m18s',
    }),
    []
  );

  const cryData = useMemo(
    () => ({
      isCrying: true,
      dataSets: chartData,
      time: '1m30s',
    }),
    [chartData]
  );

  const lastName = useMemo(() => user?.displayName?.split(' ').slice(-1)[0], [user?.displayName]);

  // Effect hooks - keep all useEffect together in the same order
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

  // Load latest notifications
  useEffect(() => {
    // Simulate API call to get notifications
    setTimeout(() => {
      // Get the 3 most recent notifications
      const latest = [...staticNotifications]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 3);
      setLatestNotifications(latest);
    }, 500);
  }, []);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Navigation handler - defined as a constant to maintain hook order
  const handleViewAll = () => {
    navigation.navigate('History' as never);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-100 px-2 pt-6">
      {/* Header */}
      <View className="mb-6 mt-12 px-2">
        <Text className="text-3xl font-medium text-primary-600">
          {t('home.title.greeting')} {lastName},
        </Text>
        <Text className="text-3xl font-normal text-primary-600">{t('home.title.dashboard')}</Text>
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
            <View className="flex w-full flex-row items-center justify-between pr-2">
              {isDeviceConnected ? (
                <AntDesign name="checkcircle" size={24} color="#3d8d7a" />
              ) : (
                <AntDesign name="disconnect" size={18} color="#f59e0b" />
              )}
              <Entypo
                name="dots-three-horizontal"
                size={20}
                color={isDeviceConnected ? '#b1ded0' : '#cbd5e1'}
              />
            </View>
            <View className="flex w-full">
              <Text
                className={`mt-2 text-left text-xl font-medium ${isDeviceConnected ? 'text-primary-500' : 'text-slate-700'}`}>
                {isDeviceConnected
                  ? t('home.device.connected.title')
                  : t('home.device.notConnected.title')}
              </Text>
              <Text
                className={`text-sm ${isDeviceConnected ? 'text-primary-500' : 'text-slate-500'}`}>
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
              <Text className="mt-2 text-left text-xl font-medium text-white">
                {badPositionData.isBad
                  ? t('home.badPosition.true.title')
                  : t('home.badPosition.false.title')}
              </Text>
              <Text className="text-sm text-slate-100">
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
              <Text className="mt-2 text-left text-xl font-medium text-white">
                {cryData.isCrying ? t('home.cry.true.title') : t('home.cry.false.title')}
              </Text>
              <Text className="text-sm text-slate-100">
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
            className="flex h-16 flex-row items-center justify-center gap-4 rounded-full bg-white px-6"
            style={{
              boxShadow: '0px 6px 10px 4px hsl(var(--shadow))',
            }}>
            <FontAwesome6 name="clock" size={24} color="#3d8d7a" />
            <Text className="text-2xl font-bold text-primary-500">{currentTime}</Text>
          </View>
        </View>
      </View>

      {/* Latest Notifications Section */}
      <View className="flex-1 px-2 mt-8">
        <View className="flex-row items-center justify-between pb-2">
          <Text className="text-xl font-semibold text-primary-600">{t('home.latestEvents')}</Text>
          <TouchableOpacity onPress={handleViewAll} className="flex-row items-center">
            <Text className="mr-1 text-primary-500">{t('home.viewAll')}</Text>
            <AntDesign name="right" size={14} color="#3d8d7a" />
          </TouchableOpacity>
        </View>

        {latestNotifications.length > 0 ? (
          <View className="rounded-xl bg-white py-3 px-2 shadow flex flex-col gap-1">
            {latestNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className={`relative mb-2 rounded-xl p-2 pb-1`}>
                <View className="flex-row items-center">
                  <View
                    className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
                      notification.read ? 'bg-gray-100' : 'bg-white'
                    }`}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800">
                      {notification.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {notification.message}{' '}
                      <Text className="mt-1 inline-block text-xs text-gray-400">
                        {formatTime(notification.timestamp)}
                      </Text>
                    </Text>
                  </View>
                  {!notification.read && (
                    <View className="absolute right-3 top-3 h-3 w-3 rounded-full bg-primary-500" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center rounded-xl bg-white p-6 shadow-sm">
            <MaterialIcons name="notifications-none" size={40} color="#ccc" />
            <Text className="mt-2 text-gray-500">{t('home.noRecentEvents')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
