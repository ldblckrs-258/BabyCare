import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';

type ThresholdModalProps = {
  visible: boolean;
  onClose: () => void;
  deviceId: string;
  cryingThreshold: number;
  sideThreshold: number;
  proneThreshold: number;
  noBlanketThreshold: number;
};

export function ThresholdModal({
  visible,
  onClose,
  deviceId,
  cryingThreshold: initialCryingThreshold,
  sideThreshold: initialSideThreshold,
  proneThreshold: initialProneThreshold,
  noBlanketThreshold: initialNoBlanketThreshold,
}: ThresholdModalProps) {
  const { t } = useTranslation();
  const { updateDeviceThresholds } = useDeviceHook();

  const [cryingThreshold, setCryingThreshold] = useState(initialCryingThreshold || 60);
  const [sideThreshold, setSideThreshold] = useState(initialSideThreshold || 30);
  const [proneThreshold, setProneThreshold] = useState(initialProneThreshold || 30);
  const [noBlanketThreshold, setNoBlanketThreshold] = useState(initialNoBlanketThreshold || 30);

  // Update state when props change
  useEffect(() => {
    setCryingThreshold(initialCryingThreshold || 60);
    setSideThreshold(initialSideThreshold || 30);
    setProneThreshold(initialProneThreshold || 30);
    setNoBlanketThreshold(initialNoBlanketThreshold || 30);
  }, [
    initialCryingThreshold,
    initialSideThreshold,
    initialProneThreshold,
    initialNoBlanketThreshold,
  ]);

  const handleSave = async () => {
    await updateDeviceThresholds(deviceId, {
      cryingThreshold,
      sideThreshold,
      proneThreshold,
      noBlanketThreshold,
    });
    onClose();
  };

  // Generate picker items for different ranges
  const generatePickerItems = (min: number, max: number, step: number = 1) => {
    const items = [];
    for (let i = min; i <= max; i += step) {
      items.push(<Picker.Item key={i} label={i.toString()} value={i} />);
    }
    return items;
  };

  // Crying threshold range: 10-120 seconds
  const cryingPickerItems = generatePickerItems(10, 120);

  // Other thresholds range: 10-60 seconds
  const otherPickerItems = generatePickerItems(10, 60);

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
            <Text className="mb-2 text-base font-medium px-4 text-center">
              {t('devices.thresholds.crying')} ({cryingThreshold} {t('devices.thresholds.seconds')})
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cryingThreshold}
                onValueChange={(value) => setCryingThreshold(value)}
                style={styles.picker}>
                {cryingPickerItems}
              </Picker>
            </View>
            <Text className="mt-1 px-4 text-xs text-gray-500 text-center">
              {t('devices.thresholds.cryingDescription')}
            </Text>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-base font-medium px-4 text-center">
              {t('devices.thresholds.side')} ({sideThreshold} {t('devices.thresholds.seconds')})
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sideThreshold}
                onValueChange={(value) => setSideThreshold(value)}
                style={styles.picker}>
                {otherPickerItems}
              </Picker>
            </View>
            <Text className="mt-1 text-xs text-gray-500 px-4 text-center">
              {t('devices.thresholds.sideDescription')}
            </Text>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-base font-medium px-4 text-center">
              {t('devices.thresholds.prone')} ({proneThreshold} {t('devices.thresholds.seconds')})
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={proneThreshold}
                onValueChange={(value) => setProneThreshold(value)}
                style={styles.picker}>
                {otherPickerItems}
              </Picker>
            </View>
            <Text className="mt-1 text-xs text-gray-500 px-4 text-center">
              {t('devices.thresholds.proneDescription')}
            </Text>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-base font-medium px-4 text-center">
              {t('devices.thresholds.noBlanket')} ({noBlanketThreshold}{' '}
              {t('devices.thresholds.seconds')})
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={noBlanketThreshold}
                onValueChange={(value) => setNoBlanketThreshold(value)}
                style={styles.picker}>
                {otherPickerItems}
              </Picker>
            </View>
            <Text className="mt-1 text-xs text-gray-500 px-4 text-center">
              {t('devices.thresholds.noBlanketDescription')}
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

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  picker: {
    height: 150,
  },
});
