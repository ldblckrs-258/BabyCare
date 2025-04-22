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
  const generatePickerItems = (
    min: number,
    max: number,
    step: number = 1,
    includeZero: boolean = true,
    selectedValue: number = 0
  ) => {
    const items = [];

    // Add "Off" option (0 value) if includeZero is true
    if (includeZero) {
      items.push(<Picker.Item key={0} label={t('devices.thresholds.off')} value={0} />);
    }

    // Add regular number options with seconds suffix
    for (let i = min; i <= max; i += step) {
      items.push(<Picker.Item key={i} label={`${i}`} value={i} />);
    }
    return items;
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

          <View className="mb-5 flex-row">
            <View className="flex-1 flex-col justify-center">
              <Text className="mb-1 text-base font-medium px-4">
                {t('devices.thresholds.crying')}
              </Text>
              <Text className="px-4 text-xs text-gray-500">
                {t('devices.thresholds.cryingDescription')}
              </Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cryingThreshold}
                onValueChange={(value) => setCryingThreshold(value)}
                style={styles.picker}>
                {generatePickerItems(10, 240, 10)}
              </Picker>
            </View>
          </View>

          <View className="mb-5 flex-row">
            <View className="flex-1 flex-col justify-center">
              <Text className="mb-1 text-base font-medium px-4">
                {t('devices.thresholds.side')}
              </Text>
              <Text className="px-4 text-xs text-gray-500">
                {t('devices.thresholds.sideDescription')}
              </Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sideThreshold}
                onValueChange={(value) => setSideThreshold(value)}
                style={styles.picker}>
                {generatePickerItems(5, 180, 5)}
              </Picker>
            </View>
          </View>

          <View className="mb-5 flex-row">
            <View className="flex-1 flex-col justify-center">
              <Text className="mb-1 text-base font-medium px-4">
                {t('devices.thresholds.prone')}
              </Text>
              <Text className="px-4 text-xs text-gray-500">
                {t('devices.thresholds.proneDescription')}
              </Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={proneThreshold}
                onValueChange={(value) => setProneThreshold(value)}
                style={styles.picker}>
                {generatePickerItems(5, 180, 5)}
              </Picker>
            </View>
          </View>

          <View className="mb-5 flex-row">
            <View className="flex-1 flex-col justify-center">
              <Text className="mb-1 text-base font-medium px-4">
                {t('devices.thresholds.noBlanket')}
              </Text>
              <Text className="px-4 text-xs text-gray-500">
                {t('devices.thresholds.noBlanketDescription')}
              </Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={noBlanketThreshold}
                onValueChange={(value) => setNoBlanketThreshold(value)}
                style={styles.picker}>
                {generatePickerItems(10, 360, 10)}
              </Picker>
            </View>
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
    marginHorizontal: 0,
    paddingVertical: 0,
  },
  picker: {
    height: 36,
    width: 92,
    transform: [{ translateY: -8 }],
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
