import { useTranslation } from '@/lib/hooks/useTranslation';
import { RootStackParamList } from '@/types/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, View } from 'react-native';

export const EmptyCard = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const gotoDeviceSettings = () => {
    navigation.navigate('Settings', {
      modal: 'devices',
    });
  };

  return (
    <View className="flex-1 items-center justify-center py-16">
      <MaterialIcons name="devices" size={50} color="#bbb" />
      <Text className="mt-4 text-lg font-semibold text-gray-600">{t('common.noDevices')}</Text>
      <Text className="mt-2 text-center text-gray-500 px-6">{t('common.connectFirst')}</Text>
      <TouchableOpacity
        className="mt-6 bg-primary-500 py-3 px-6 rounded-full"
        onPress={gotoDeviceSettings}>
        <Text className="text-white font-medium">{t('common.deviceSettings')}</Text>
      </TouchableOpacity>
    </View>
  );
};
