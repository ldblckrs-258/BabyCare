import { useTranslation } from '@/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';

const NoDevicesCard = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  return (
    <Card className="mb-4 overflow-hidden rounded-3xl bg-white" mode="elevated">
      <Card.Content className="p-6 items-center justify-center">
        <MaterialIcons name="devices-other" size={56} color="#ccc" />
        <Text className="text-lg font-bold text-gray-800 mt-4 text-center">
          {t('home.noDevices.title')}
        </Text>
        <Text className="text-gray-600 mt-1 text-center mb-4">
          {t('home.noDevices.description')}
        </Text>
        <TouchableOpacity
          className="bg-primary-500 rounded-full px-6 py-3 mt-2"
          onPress={handleNavigateToSettings}>
          <Text className="text-white font-medium">{t('home.noDevices.button')}</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

export default NoDevicesCard;
