import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useConnectionStore } from '@/stores/connectionStore';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ActivityIndicator, Button, Modal, Portal } from 'react-native-paper';

type RenameModalProps = {
  visible: boolean;
  onClose: () => void;
  connectionId: string;
  currentName: string;
};

export function RenameModal({ visible, onClose, connectionId, currentName }: RenameModalProps) {
  const { t } = useTranslation();
  const { renameConnection } = useDeviceHook();
  const updateConnection = useConnectionStore((state) => state.updateConnection);
  const [newName, setNewName] = useState(currentName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRename = async () => {
    if (newName.trim() !== '') {
      setIsSubmitting(true);
      try {
        // First update the local store directly to ensure UI updates immediately
        updateConnection(connectionId, { name: newName.trim() });

        // Then update in Firestore (this will happen asynchronously)
        await renameConnection(connectionId, newName.trim());
        onClose();
      } catch (error) {
        // Handle error if needed
        console.error('Error renaming device:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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
          <Text className="mb-4 text-center text-lg font-bold">{t('devices.rename.title')}</Text>
          <Text className="mb-2 text-left text-gray-500">{t('devices.rename.message')}</Text>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={t('devices.rename.placeholder')}
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
