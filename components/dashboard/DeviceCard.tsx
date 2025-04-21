import { useTranslation } from '@/lib/hooks/useTranslation';
import { Connection } from '@/stores/connectionStore';
import { Device } from '@/stores/deviceStore';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';

interface DeviceCardProps {
  device: Device;
  connection: Connection;
  onPress: (deviceId: string) => void;
}

const DeviceCard = ({ device, connection, onPress }: DeviceCardProps) => {
  const { t } = useTranslation();
  const isConnected = device.status === 'online';

  return (
    <Card
      className="mb-4 overflow-hidden rounded-3xl bg-white"
      onPress={() => onPress(device.id)}
      mode="elevated">
      <Card.Content className="p-4 bg-white">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                isConnected ? 'bg-primary-100' : 'bg-slate-100'
              }`}>
              <AntDesign
                name={isConnected ? 'checkcircle' : 'disconnect'}
                size={isConnected ? 24 : 20}
                color={isConnected ? '#3d8d7a' : '#f59e0b'}
              />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-gray-800">{connection.name}</Text>
              <Text className={`text-sm ${isConnected ? 'text-primary-500' : 'text-slate-500'}`}>
                {isConnected ? t('common.connected') : t('common.notConnected')}
              </Text>
            </View>
          </View>
          <Entypo name="chevron-right" size={24} color="#ccc" />
        </View>

        <View className="mt-4 flex-row">
          <View className="flex-1 border-r border-gray-200 pr-4">
            <View className="flex-row items-center">
              <FontAwesome6 name="baby" size={16} color="#5d97d3" />
              <Text className="ml-2 text-sm text-gray-600">{t('home.cry.threshold')}</Text>
            </View>
            <Text className="mt-1 text-base font-medium">{device.cryingThreshold}s</Text>
          </View>

          <View className="flex-1 pl-4">
            <View className="flex-row items-center">
              <FontAwesome6 name="bed" size={14} color="#d26165" />
              <Text className="ml-2 text-sm text-gray-600">{t('home.position.threshold')}</Text>
            </View>
            <Text className="mt-1 text-base font-medium">{device.positionThreshold}s</Text>
          </View>
        </View>
      </Card.Content>

      {/* <View className="flex-row border-t border-gray-100">
        <View
          className={`flex-1 py-3 px-4 items-center ${
            isConnected ? 'bg-primary-50' : 'bg-slate-50'
          }`}>
          <Text className="text-xs text-gray-500">{t('home.lastUpdated')}</Text>
          <Text className="text-sm font-medium">
            {device.updatedAt
              ? new Date(device.updatedAt).toLocaleString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric',
                })
              : t('home.never')}
          </Text>
        </View>
      </View> */}
    </Card>
  );
};

export default DeviceCard;
