import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
// import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '@/types/navigation';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, logout, updateProfile, changePassword } = useAuthStore();
  const { setDeviceConnection } = useSettingsStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || null);

  const pickImage = async () => {
    // try {
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: true,
    //     aspect: [1, 1],
    //     quality: 0.8,
    //   });
    //   if (!result.canceled) {
    //     setAvatar(result.assets[0].uri);
    //     // TODO: Implement avatar upload to storage
    //   }
    // } catch (error) {
    //   Alert.alert('Error', 'Failed to pick image');
    // }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({
        displayName: displayName.trim(),
        photoURL: avatar || undefined,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      let errorMessage = 'Failed to change password';
      if (error instanceof Error) {
        if (error.message.includes('wrong-password')) {
          errorMessage = 'Current password is incorrect';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'New password is too weak';
        }
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      // Disconnect any connected devices
      setDeviceConnection(false);
      // Logout from auth store
      await logout();
      // Close the modal
      onClose();
      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="rounded-t-3xl bg-white p-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">{t('settings.profile.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="mb-6 items-center">
            <TouchableOpacity onPress={pickImage} disabled={isLoading}>
              <View className="relative">
                <Image
                  source={avatar ? { uri: avatar } : require('../../assets/default-avatar.png')}
                  className="h-24 w-24 rounded-full"
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Profile Information */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-500">
              {t('settings.profile.email')}
            </Text>
            <Text className="text-base text-gray-800">{user?.email}</Text>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-500">
              {t('settings.profile.displayName')}
            </Text>
            {isEditing ? (
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t('settings.profile.displayNamePlaceholder')}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="ml-2 rounded-lg bg-primary-500 px-4 py-3.5"
                  onPress={handleUpdateProfile}
                  disabled={isLoading}>
                  {isLoading ? (
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: new Animated.Value(0).interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      }}>
                      <AntDesign name="loading1" size={20} color="white" />
                    </Animated.View>
                  ) : (
                    <Text className="text-white">{t('common.save')}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-2 rounded-lg bg-gray-200 px-4 py-3.5"
                  onPress={() => setIsEditing(false)}
                  disabled={isLoading}>
                  <Text className="text-gray-700">{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-800">{user?.displayName}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <MaterialIcons name="edit" size={20} color="#5d97d3" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Change Password Section - Only show if not using Google Sign In */}
          {!user?.providerData.some((provider) => provider.providerId === 'google.com') && (
            <View className="mb-6">
              <Text className="mb-4 text-lg font-semibold text-gray-800">
                {t('settings.profile.changePassword')}
              </Text>
              <TextInput
                className="mb-3 rounded-lg border border-gray-300 px-4 py-2"
                placeholder={t('settings.profile.currentPassword')}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                editable={!isLoading}
              />
              <TextInput
                className="mb-3 rounded-lg border border-gray-300 px-4 py-2"
                placeholder={t('settings.profile.newPassword')}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!isLoading}
              />
              <TextInput
                className="mb-3 rounded-lg border border-gray-300 px-4 py-2"
                placeholder={t('settings.profile.confirmPassword')}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="rounded-lg bg-blue-500 px-4 py-2"
                onPress={handleChangePassword}
                disabled={isLoading}>
                <Text className="text-center text-white">
                  {isLoading ? 'Changing...' : t('settings.profile.changePasswordButton')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sign Out Button */}
          <TouchableOpacity
            className="rounded-lg bg-secondary-500 px-4 py-4"
            onPress={handleSignOut}
            disabled={isLoading}>
            <Text className="text-center text-white">
              {isLoading ? 'Signing out...' : t('settings.profile.signOut')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
