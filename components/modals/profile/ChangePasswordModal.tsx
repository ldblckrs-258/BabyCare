import { PasswordInput } from '../../inputs/PasswordInput';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { ActivityIndicator, Button, Modal, Portal } from 'react-native-paper';

type ChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const { user, changePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(t('settings.profile.errors.passwordMismatch'));
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('settings.profile.errors.passwordTooShort'));
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    setIsSubmitting(true);
    if (!validatePassword()) {
      setIsSubmitting(false);
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message === 'PASSWORD_INCORRECT') {
        Alert.alert(t('settings.profile.errors.passwordIncorrect'));
      } else {
        Alert.alert(t('settings.profile.errors.passwordChangeFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [visible]);

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
            {t('settings.profile.changePassword')}
          </Text>
          <PasswordInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t('settings.profile.currentPassword')}
            className="mb-4"
            autoFocus
          />

          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('settings.profile.newPassword')}
            className="mb-4"
          />

          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('settings.profile.confirmPassword')}
            className="mb-4"
          />

          <View className="mt-4 flex-row justify-end gap-4">
            <Button mode="outlined" onPress={onClose} textColor="#666" disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              className="w-[80px]"
              buttonColor="#3d8d7a"
              onPress={handleChangePassword}
              disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="white" size={20} /> : t('common.save')}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
