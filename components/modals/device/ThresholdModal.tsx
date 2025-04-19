import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';

type ThresholdModalProps = {
  visible: boolean;
  onClose: () => void;
  deviceId: string;
  cryingThreshold: number;
  positionThreshold: number;
};

export function ThresholdModal({
  visible,
  onClose,
  deviceId,
  cryingThreshold: initialCryingThreshold,
  positionThreshold: initialPositionThreshold,
}: ThresholdModalProps) {
  const { t } = useTranslation();
  const { updateDeviceThresholds } = useDeviceHook();

  const [cryingThreshold, setCryingThreshold] = useState(initialCryingThreshold || 60);
  const [positionThreshold, setPositionThreshold] = useState(initialPositionThreshold || 30);

  // Update state when props change
  useEffect(() => {
    setCryingThreshold(initialCryingThreshold || 60);
    setPositionThreshold(initialPositionThreshold || 30);
  }, [initialCryingThreshold, initialPositionThreshold]);

  const handleSave = async () => {
    await updateDeviceThresholds(deviceId, {
      cryingThreshold,
      positionThreshold,
    });
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: 'white',
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 12,
          paddingRight: 12,
          margin: 20,
          borderRadius: 8,
        }}>
        <View>
          <Text className="mb-4 text-center text-lg font-bold">
            {t('devices.thresholds.title')}
          </Text>

          <View className="mb-5">
            <Text className="mb-2 text-base font-medium px-4">
              {t('devices.thresholds.crying')} ({cryingThreshold} {t('devices.thresholds.seconds')})
            </Text>
            <Slider
              value={cryingThreshold}
              onValueChange={(value) => setCryingThreshold(Math.round(value))}
              minimumValue={10}
              maximumValue={120}
              step={1}
            />
            <Text className="mt-1 px-4 text-xs text-gray-500">
              {t('devices.thresholds.cryingDescription')}
            </Text>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-base font-medium px-4">
              {t('devices.thresholds.position')} ({positionThreshold}{' '}
              {t('devices.thresholds.seconds')})
            </Text>
            <Slider
              value={positionThreshold}
              onValueChange={(value) => setPositionThreshold(Math.round(value))}
              minimumValue={10}
              maximumValue={60}
              step={1}
            />
            <Text className="mt-1 text-xs text-gray-500 px-4">
              {t('devices.thresholds.positionDescription')}
            </Text>
          </View>

          <View className="mt-4 flex-row justify-end gap-4">
            <Button mode="outlined" textColor="#666" onPress={onClose}>
              {t('common.cancel')}
            </Button>
            <Button mode="contained" buttonColor="#3d8d7a" onPress={handleSave}>
              {t('common.save')}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}
