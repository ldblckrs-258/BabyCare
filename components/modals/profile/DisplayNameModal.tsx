import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { ActivityIndicator, Button, Modal, Portal } from 'react-native-paper';

type DisplayNameModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function DisplayNameModal({ visible, onClose }: DisplayNameModalProps) {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuthStore();
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRename = async () => {
    setIsSubmitting(true);
    await updateProfile({
      displayName: newName.trim(),
      photoURL: user?.photoURL || undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      setNewName(user?.displayName || '');
    }
  }, [visible, user?.displayName]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          margin: 20,
          borderRadius: 8,
        }}>
        <View>
          <Text className="mb-4 text-center text-lg font-bold">
            {t('settings.profile.displayName')}
          </Text>
          <Text className="mb-2 text-left text-gray-500">
            {t('settings.profile.displayNameMessage')}
          </Text>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={t('settings.profile.displayNamePlaceholder')}
            className="mb-4 rounded-md border border-gray-300 px-3 py-2"
            autoFocus
            editable={!isSubmitting}
          />

          <View className="mt-4 flex-row justify-end gap-4">
            <Button mode="outlined" onPress={onClose} textColor="#666" disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              className="w-[80px]"
              buttonColor="#3d8d7a"
              onPress={handleRename}
              disabled={newName.trim() === '' || isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="white" size={20} /> : t('common.save')}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
