import { SlideModal } from './SlideModal';
import { ChangePasswordModal } from './profile/ChangePasswordModal';
import { DisplayNameModal } from './profile/DisplayNameModal';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { FirestoreService } from '@/lib/models/firestoreService';
import { useAuthStore } from '@/stores/authStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [displayNameModalVisible, setDisplayNameModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      <View className="flex flex-col gap-8">
        <View className="flex flex-row gap-4 items-center">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {t('settings.profile.email')}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">{user?.email}</Text>
        </View>
        <TouchableOpacity
          className="flex flex-row gap-4 items-center"
          onPress={() => setDisplayNameModalVisible(true)}>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {t('settings.profile.displayName')}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-end gap-1">
            <Text className="text-sm text-gray-500">{user?.displayName}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#ddd" />
          </View>
        </TouchableOpacity>
        {user?.providerData[0]?.providerId !== 'google.com' && (
          <TouchableOpacity
            className="flex flex-row gap-4 items-center"
            onPress={() => setChangePasswordModalVisible(true)}>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {t('settings.profile.changePassword')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#ddd" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex flex-row gap-4 items-center"
          onPress={handleSignOut}
          disabled={isLoading}>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {t('settings.profile.signOut')}
            </Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ddd" />
          ) : (
            <MaterialIcons name="chevron-right" size={20} color="#ddd" />
          )}
        </TouchableOpacity>
      </View>
      <DisplayNameModal
        visible={displayNameModalVisible}
        onClose={() => setDisplayNameModalVisible(false)}
      />
      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
      />
    </SlideModal>
  );
}
