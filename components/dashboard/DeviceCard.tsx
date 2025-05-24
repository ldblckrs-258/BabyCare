import { DeviceWithConnection } from '@/lib/hooks';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { DeviceEventService } from '@/lib/models/deviceEventService';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Card } from 'react-native-paper';

interface DeviceCardProps {
  data: DeviceWithConnection;
  onPress: (deviceId: string) => void;
}

type POSITION_STATUS = 'supine' | 'prone' | 'side';

interface DeviceStatus {
  crying: {
    isDetected: boolean;
    timeStamp: string;
  };
  position: {
    status: POSITION_STATUS;
    timeStamp: string;
  };
  blanket: {
    isDetected: boolean;
    timeStamp: string;
  };
}

const DeviceCard = ({ data, onPress }: DeviceCardProps) => {
  const { t } = useTranslation();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    crying: {
      isDetected: false,
      timeStamp: new Date().toISOString(),
    },
    position: {
      status: 'supine',
      timeStamp: new Date().toISOString(),
    },
    blanket: {
      isDetected: true,
      timeStamp: new Date().toISOString(),
    },
  });
  const [loading, setLoading] = useState(true);
  const [cryingSeconds, setCryingSeconds] = useState(0);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [blanketSeconds, setBlanketSeconds] = useState(0);

  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m${remainingSeconds}s`;
    } else if (seconds < 86400) {
      // Less than 24 hours
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h${remainingMinutes}m`;
    } else {
      // More than 24 hours
      const days = Math.floor(seconds / 86400);
      const remainingHours = Math.floor((seconds % 86400) / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${days}d${remainingHours}h${remainingMinutes}m`;
    }
  };

  // Fetch device events and set up real-time listener
  useEffect(() => {
    const deviceId = data.device.id;
    if (!deviceId) return;

    setLoading(true);

    // Initial fetch
    const fetchInitialStatus = async () => {
      try {
        const status = await DeviceEventService.getDeviceStatus(deviceId);
        setDeviceStatus(status);
      } catch (error) {
        console.error('Error fetching initial device status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStatus();

    // Set up real-time listener
    const unsubscribe = DeviceEventService.listenToDeviceEvents(deviceId, (newStatus) => {
      setDeviceStatus(newStatus);
    });

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, [data.device.id]);

  // Update timers based on device status
  useEffect(() => {
    // Initialize timers and calculate initial elapsed seconds
    const calculateElapsedSeconds = (timestamp: string) => {
      const timestampDate = new Date(timestamp);
      const now = new Date();
      return Math.floor((now.getTime() - timestampDate.getTime()) / 1000);
    };

    setCryingSeconds(calculateElapsedSeconds(deviceStatus.crying.timeStamp));
    setPositionSeconds(calculateElapsedSeconds(deviceStatus.position.timeStamp));
    setBlanketSeconds(calculateElapsedSeconds(deviceStatus.blanket.timeStamp));

    // Set up interval to update seconds every second
    const timerInterval = setInterval(() => {
      setCryingSeconds((prev) => prev + 1);
      setPositionSeconds((prev) => prev + 1);
      setBlanketSeconds((prev) => prev + 1);
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(timerInterval);
  }, [deviceStatus]);

  return (
    <Card
      className="mb-4 overflow-hidden rounded-3xl bg-white"
      style={data.device.isOnline ? {} : { shadowColor: 'transparent' }}
      onPress={() => onPress(data.device.id)}
      mode="elevated">
      <Card.Content className="p-4 bg-white">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                data.device.isOnline ? 'bg-primary-100' : 'bg-slate-100'
              }`}>
              <AntDesign
                name={data.device.isOnline ? 'checkcircle' : 'disconnect'}
                size={data.device.isOnline ? 24 : 20}
                color={data.device.isOnline ? '#3d8d7a' : '#f59e0b'}
              />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-gray-800">{data.connection.name}</Text>
              <Text
                className={`text-sm ${data.device.isOnline ? 'text-primary-500' : 'text-slate-500'}`}>
                {data.device.isOnline ? t('common.online') : t('common.offline')}
              </Text>
            </View>
          </View>
          <Entypo name="chevron-right" size={24} color="#ccc" />
        </View>
        {data.device.isOnline && (
          <View className="mt-2 flex-row items-center justify-between gap-2">
            <View
              className={`flex-1 py-2 px-3 h-full rounded flex-col items-center ${deviceStatus.crying.isDetected ? 'bg-tertiary-100' : ''}`}>
              <View className="flex-row items-center gap-1 justify-center">
                <Ionicons
                  name="water"
                  size={16}
                  color={deviceStatus.crying.isDetected ? '#5d97d3' : '#9ca3af'}
                />
                <Text className="text-sm text-gray-600 font-semibold">
                  {deviceStatus.crying.isDetected ? t('home.crying') : t('home.notCrying')}
                </Text>
              </View>
              <Text className="mt-1 text-xs text-gray-400 text-center">
                {t('home.continuouslyFor')} {formatSeconds(cryingSeconds)}
              </Text>
            </View>
            <View
              className={`flex-1 py-2 px-4 h-full rounded flex-col items-center ${deviceStatus.position.status === 'prone' ? 'bg-secondary-100' : ''} ${deviceStatus.position.status === 'side' ? 'bg-amber-100' : ''}`}>
              <View className="flex-row items-center gap-2 justify-center">
                <FontAwesome6
                  name="baby"
                  size={16}
                  color={
                    deviceStatus.position.status === 'prone'
                      ? '#d26165'
                      : deviceStatus.position.status === 'side'
                        ? '#d97706'
                        : '#9ca3af'
                  }
                />
                <Text className="text-sm text-gray-600 font-semibold">
                  {deviceStatus.position.status === 'prone'
                    ? t('home.prone')
                    : deviceStatus.position.status === 'side'
                      ? t('home.side')
                      : t('home.supine')}
                </Text>
              </View>
              <Text className="mt-1 text-xs text-gray-400 text-center">
                {t('home.continuouslyFor')} {formatSeconds(positionSeconds)}
              </Text>
            </View>
            <View
              className={`flex-1 py-2 px-3 h-full rounded flex-col items-center ${deviceStatus.blanket.isDetected ? '' : 'bg-purple-100'}`}>
              <View className="flex-row items-center gap-2 justify-center">
                <FontAwesome6
                  name="bed"
                  size={16}
                  color={deviceStatus.blanket.isDetected ? '#9ca3af' : '#a855f7'}
                />
                <Text className="text-sm text-gray-600 font-semibold">
                  {deviceStatus.blanket.isDetected ? t('home.blanket') : t('home.noBlanket')}
                </Text>
              </View>
              <Text className="mt-1 text-xs text-gray-400 text-center">
                {t('home.continuouslyFor')} {formatSeconds(blanketSeconds)}
              </Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default DeviceCard;
