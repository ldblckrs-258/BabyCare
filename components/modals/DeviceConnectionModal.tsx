import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

import { useTranslation } from '@/lib/hooks/useTranslation';

type DeviceConnectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
};

export function DeviceConnectionModal({
  visible,
  onClose,
  onCodeScanned,
}: DeviceConnectionModalProps) {
  const [scanMode, setScanMode] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { t } = useTranslation();
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        onCodeScanned(codes[0].value);
        setScanMode(false);
        onClose();
      }
    },
  });

  // Request camera permissions for QR scanning
  const requestCameraPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setScanMode(true);
    }
  };

  if (scanMode && hasPermission && device) {
    return (
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
        <View className="flex-1">
          <Camera device={device} isActive codeScanner={codeScanner} style={{ flex: 1 }} />
          <View className="absolute bottom-10 left-0 right-0 flex-row justify-center">
            <TouchableOpacity
              onPress={() => setScanMode(false)}
              className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
              <MaterialIcons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="h-4/5 rounded-t-3xl bg-white p-6 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">
              {t('settings.deviceConnection.title')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* QR Code Scanning Option */}
          <TouchableOpacity
            onPress={requestCameraPermission}
            className="mb-4 rounded-lg border border-gray-200 p-4 shadow-sm">
            <View className="flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <MaterialIcons name="qr-code-scanner" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">
                  {t('settings.deviceConnection.scanQRCode')}
                </Text>
                <Text className="text-sm text-gray-500">
                  {t('settings.deviceConnection.scanQRCodeDescription')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Help Text */}
          <View className="mt-4 rounded-lg bg-blue-50 p-4">
            <Text className="text-sm text-blue-700">{t('settings.deviceConnection.helpText')}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
