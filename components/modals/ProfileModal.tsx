import { PasswordInput } from '../inputs/PasswordInput';
import { SlideModal } from './SlideModal';
import { useTranslation } from '@/lib/hooks/useTranslation';
// import * as ImagePicker from 'expo-image-picker';
import { FirestoreService } from '@/lib/models/firestoreService';
import { useAuthStore } from '@/stores/authStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { RootStackParamList } from '@/types/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, logout, updateProfile, changePassword } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.photoURL || null);

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
      setIsChangingPwd(false);
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

      // Get all stores to clean up
      const connectionStore = useConnectionStore.getState();
      const deviceStore = useDeviceStore.getState();

      // Get FirestoreService instance
      const firestoreService = FirestoreService.getInstance();

      // Clear all cached data
      firestoreService.clearCache();

      // Clear all stores
      connectionStore.clearAllConnections();
      deviceStore.clearAllDevices();

      // Logout from auth store
      await logout();

      // Close the modal
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SlideModal visible={visible} onClose={onClose} title={t('settings.profile.title')}>
      <View className="">
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
            <View className="flex-row items-center relative">
              <Text className="text-base text-gray-800">{user?.displayName}</Text>
              <TouchableOpacity
                className="p-2 absolute right-0 bottom-2"
                onPress={() => setIsEditing(true)}>
                <MaterialIcons name="edit" size={20} color="#5d97d3" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Change Password Section - Only show if not using Google Sign In */}
        {isChangingPwd && (
          <View className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-gray-800">
              {t('settings.profile.changePassword')}
            </Text>
            <PasswordInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('settings.profile.currentPassword')}
              className="mb-3"
              disabled={isLoading}
            />
            <PasswordInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('settings.profile.newPassword')}
              className="mb-3"
              disabled={isLoading}
            />
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('settings.profile.confirmPassword')}
              className="mb-3"
              disabled={isLoading}
            />
          </View>
        )}

        <View className="w-full flex flex-row items-center gap-4">
          {isChangingPwd ? (
            <>
              <TouchableOpacity
                className="rounded-lg px-12 border border-gray-400 text-gray-800 h-[50px] flex items-center justify-center"
                onPress={() => setIsChangingPwd(false)}
                disabled={isLoading}>
                <Text className="text-center">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg flex-1 bg-primary-500 h-[50px] flex items-center justify-center"
                onPress={handleChangePassword}
                disabled={isLoading}>
                <Text className="text-center text-white">
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    t('settings.profile.saveButton')
                  )}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                className="rounded-lg flex-1 bg-secondary-500 h-[50px] flex items-center justify-center"
                onPress={handleSignOut}
                disabled={isLoading}>
                <Text className="text-center text-white">
                  {isLoading ? 'Signing out...' : t('settings.profile.signOut')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {!isChangingPwd && user?.providerData[0]?.providerId !== 'google.com' && (
          <TouchableOpacity
            className="rounded-lg w-full border border-gray-400 text-gray-800 h-[50px] flex items-center justify-center mt-4"
            onPress={() => setIsChangingPwd(true)}
            disabled={isLoading}>
            <Text className="text-center">{t('settings.profile.changePassword')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SlideModal>
  );
}
