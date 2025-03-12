import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from '../types/navigation';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View className="flex-1 bg-neutral-100">
      {/* Header */}
      <View className="bg-primary-500 px-4 py-6">
        <Text className="text-2xl font-bold text-white">BabyCare</Text>
      </View>

      {/* User Info */}
      <View className="p-4">
        <View className="rounded-lg bg-white p-4 shadow-md">
          <View className="items-center">
            <View className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
              <Image
                source={{
                  uri: user?.photoURL || 'https://ui-avatars.com/api/?name=' + user?.email,
                }}
                className="h-full w-full"
                contentFit="cover"
              />
            </View>
            <Text className="mt-4 text-xl font-semibold text-gray-800">
              {user?.displayName || 'Người dùng'}
            </Text>
            <Text className="mt-1 text-gray-600">{user?.email}</Text>
          </View>

          <View className="mt-6 space-y-4">
            <View className="flex-row items-center justify-between rounded-lg bg-gray-50 p-4">
              <Text className="text-gray-600">Email đã xác thực</Text>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  user?.emailVerified ? 'bg-green-500' : 'bg-red-500'
                }`}>
                <Text className="text-sm text-white">{user?.emailVerified ? '✓' : '✗'}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between rounded-lg bg-gray-50 p-4">
              <Text className="text-gray-600">Ngày tham gia</Text>
              <Text className="text-gray-800">
                {user?.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} className="mt-6 rounded-lg bg-red-500 p-4">
          <Text className="text-center font-semibold text-white">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
