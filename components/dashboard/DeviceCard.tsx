import { useTranslation } from '@/lib/hooks/useTranslation';
import { Connection } from '@/stores/connectionStore';
import { Device } from '@/stores/deviceStore';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Card } from 'react-native-paper';

interface DeviceCardProps {
  device: Device;
  connection: Connection;
  onPress: (deviceId: string) => void;
}

type POSITION_STATUS = 'supine' | 'prone' | 'side';

// Function to generate randomized mockup status data
const generateRandomMockupStatus = () => {
  const now = new Date();

  // Generate random timestamps within the last 2 minutes
  const getRandomTimestamp = () => {
    const randomSeconds = Math.floor(Math.random() * 120); // 0 to 120 seconds ago
    const timestamp = new Date(now.getTime() - randomSeconds * 1000);
    return timestamp.toISOString();
  };

  // Random boolean with weighted probability (70% true, 30% false for crying)
  const randomCrying = Math.random() < 0.3;

  // Random position with weighted probabilities
  // supine: 60%, prone: 20%, side: 20%
  const positionRandom = Math.random();
  let positionStatus: POSITION_STATUS;
  if (positionRandom < 0.6) {
    positionStatus = 'supine';
  } else if (positionRandom < 0.8) {
    positionStatus = 'prone';
  } else {
    positionStatus = 'side';
  }

  // Random blanket detection (50% chance)
  const blanketDetected = Math.random() < 0.5;

  return {
    crying: {
      isDetected: randomCrying,
      timeStamp: getRandomTimestamp(),
    },
    position: {
      status: positionStatus,
      timeStamp: getRandomTimestamp(),
    },
    blanket: {
      isDetected: blanketDetected,
      timeStamp: getRandomTimestamp(),
    },
  };
};

const DeviceCard = ({ device, connection, onPress }: DeviceCardProps) => {
  const { t } = useTranslation();
  // Generate unique random status for each card instance
  const [mockupStatus] = useState(generateRandomMockupStatus());
  const [cryingSeconds, setCryingSeconds] = useState(0);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [blanketSeconds, setBlanketSeconds] = useState(0);

  // Format seconds to display as "5s" (1-59s) or "1m23s" (60s+)
  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m${remainingSeconds}s`;
    }
  };
  useEffect(() => {
    // Initialize timers and calculate initial elapsed seconds
    const calculateElapsedSeconds = (timestamp: string) => {
      const timestampDate = new Date(timestamp);
      const now = new Date();
      return Math.floor((now.getTime() - timestampDate.getTime()) / 1000);
    };

    setCryingSeconds(calculateElapsedSeconds(mockupStatus.crying.timeStamp));
    setPositionSeconds(calculateElapsedSeconds(mockupStatus.position.timeStamp));
    setBlanketSeconds(calculateElapsedSeconds(mockupStatus.blanket.timeStamp));

    // Set up interval to update seconds every second
    const timerInterval = setInterval(() => {
      setCryingSeconds((prev) => prev + 1);
      setPositionSeconds((prev) => prev + 1);
      setBlanketSeconds((prev) => prev + 1);
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(timerInterval);
  }, []);

  return (
    <Card
      className="mb-4 overflow-hidden rounded-3xl bg-white"
      style={device.isOnline ? {} : { shadowColor: 'transparent' }}
      onPress={() => onPress(device.id)}
      mode="elevated">
      <Card.Content className="p-4 bg-white">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                device.isOnline ? 'bg-primary-100' : 'bg-slate-100'
              }`}>
              <AntDesign
                name={device.isOnline ? 'checkcircle' : 'disconnect'}
                size={device.isOnline ? 24 : 20}
                color={device.isOnline ? '#3d8d7a' : '#f59e0b'}
              />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-gray-800">{connection.name}</Text>
              <Text
                className={`text-sm ${device.isOnline ? 'text-primary-500' : 'text-slate-500'}`}>
                {device.isOnline ? t('common.online') : t('common.offline')}
              </Text>
            </View>
          </View>
          <Entypo name="chevron-right" size={24} color="#ccc" />
        </View>
        {device.isOnline && (
          <View className="mt-2 flex-row items-center justify-between gap-2">
            <View
              className={`flex-1 py-2 px-3 h-full rounded flex-col items-center ${mockupStatus.crying.isDetected ? 'bg-tertiary-100' : ''}`}>
              <View className="flex-row items-center gap-1 justify-center">
                <Ionicons
                  name="water"
                  size={16}
                  color={mockupStatus.crying.isDetected ? '#5d97d3' : '#9ca3af'}
                />
                <Text className="text-sm text-gray-600 font-semibold">
                  {mockupStatus.crying.isDetected ? t('home.crying') : t('home.notCrying')}
                </Text>
              </View>
              <Text className="mt-1 text-xs text-gray-400 text-center">
                {t('home.continuouslyFor')} {formatSeconds(cryingSeconds)}
              </Text>
            </View>
            <View
              className={`flex-1 py-2 px-4 h-full rounded flex-col items-center ${mockupStatus.position.status === 'prone' ? 'bg-secondary-100' : ''} ${mockupStatus.position.status === 'side' ? 'bg-amber-100' : ''}`}>
              <View className="flex-row items-center gap-2 justify-center">
                <FontAwesome6
                  name="baby"
                  size={16}
                  color={
                    mockupStatus.position.status === 'prone'
                      ? '#d26165'
                      : mockupStatus.position.status === 'side'
                        ? '#d97706'
                        : '#9ca3af'
                  }
                />
                <Text className="text-sm text-gray-600 font-semibold">
                  {mockupStatus.position.status === 'prone'
                    ? t('home.prone')
                    : mockupStatus.position.status === 'side'
                      ? t('home.side')
                      : t('home.supine')}
                </Text>
              </View>
              <Text className="mt-1 text-xs text-gray-400 text-center">
                {t('home.continuouslyFor')} {formatSeconds(positionSeconds)}
              </Text>
            </View>
            <View
              className={`flex-1 py-2 px-3 h-full rounded flex-col items-center ${mockupStatus.blanket.isDetected ? '' : 'bg-purple-100'}`}>
              <View className="flex-row items-center gap-2 justify-center">
                <FontAwesome6
                  name="bed"
                  size={16}
                  color={mockupStatus.blanket.isDetected ? '#9ca3af' : '#a855f7'}
                />
                <Text className="text-sm text-gray-600 font-semibold">
                  {mockupStatus.blanket.isDetected ? t('home.blanket') : t('home.noBlanket')}
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
