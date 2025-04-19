import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';

type RenameModalProps = {
  visible: boolean;
  onClose: () => void;
  connectionId: string;
  currentName: string;
};

export function RenameModal({ visible, onClose, connectionId, currentName }: RenameModalProps) {
  const { t } = useTranslation();
  const { renameConnection } = useDeviceHook();
  const [newName, setNewName] = useState(currentName || '');

  const handleRename = async () => {
    if (newName.trim() !== '') {
      await renameConnection(connectionId, newName.trim());
      onClose();
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

          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={t('devices.rename.placeholder')}
            className="mb-4 rounded-md border border-gray-300 px-3 py-2"
            autoFocus
          />

          <View className="mt-4 flex-row justify-end gap-4">
            <Button mode="outlined" onPress={onClose} textColor="#666">
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              buttonColor="#3d8d7a"
              onPress={handleRename}
              disabled={newName.trim() === ''}>
              {t('common.save')}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
