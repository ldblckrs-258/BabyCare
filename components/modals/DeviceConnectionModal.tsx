import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
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
  isConnected?: boolean;
  deviceId?: string;
  onDisconnect?: () => void;
};

export function DeviceConnectionModal({
  visible,
  onClose,
  onCodeScanned,
  isConnected = false,
  deviceId,
  onDisconnect,
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

        Alert.alert('Success', 'Device connected successfully');
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

  const handleDisconnect = () => {
    // ask for confirmation
    Alert.alert('Confirm', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disconnect', onPress: () => onDisconnect?.() },
    ]);
  };

  if (scanMode && hasPermission && device) {
    return (
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
        <View className="flex-1">
          <Camera device={device} isActive codeScanner={codeScanner} style={{ flex: 1 }} />

          {/* Black Overlay */}
          <View className="absolute inset-0 h-full w-full pb-10">
            {/* Transparent Center Window */}
            <View className="flex-1 items-center justify-center">
              <View className="h-64 w-64">
                {/* Transparent Center */}
                <View className="absolute inset-0 bg-transparent" />

                {/* Frame Border */}
                <View className="absolute h-full w-full rounded-lg border-2 border-white/20" />

                {/* Corner Markers */}
                <View className="absolute left-0 top-0 h-8 w-8 rounded-tl border-l-4 border-t-4 border-white" />
                <View className="absolute right-0 top-0 h-8 w-8 rounded-tr border-r-4 border-t-4 border-white" />
                <View className="absolute bottom-0 left-0 h-8 w-8 rounded-bl border-b-4 border-l-4 border-white" />
                <View className="absolute bottom-0 right-0 h-8 w-8 rounded-br border-b-4 border-r-4 border-white" />
              </View>
            </View>
          </View>

          {/* Close Button */}
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
        <View className="h-1/3 rounded-t-3xl bg-white p-6 shadow-lg">
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

          {isConnected ? (
            <View className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <MaterialIcons name="check-circle" size={24} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">
                    {t('settings.deviceConnection.connected')}
                  </Text>
                  <Text className="text-sm text-gray-600">Device ID: {deviceId}</Text>
                </View>
                <TouchableOpacity onPress={handleDisconnect}>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-500/20">
                    <MaterialIcons name="link-off" size={20} color="#d26165" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* QR Code Scanning Option */}
              <TouchableOpacity
                onPress={requestCameraPermission}
                className="mb-4 rounded-lg border border-gray-200 p-4 shadow-sm">
                <View className="flex-row items-center px-2">
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
                <Text className="text-sm text-blue-700">
                  {t('settings.deviceConnection.helpText')}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
