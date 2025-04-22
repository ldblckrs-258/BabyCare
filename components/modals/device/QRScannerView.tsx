import { useTranslation } from '@/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

type QRScannerViewProps = {
  onClose: () => void;
  onQRCodeScanned: (result: { data: string }) => void;
};

export function QRScannerView({ onClose, onQRCodeScanned }: QRScannerViewProps) {
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const device = useCameraDevice('back');

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    })();
  }, []);

  // Set up code scanner
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && codes[0].value && !isLoading) {
        setIsLoading(true);
        // Process QR code and then close
        await onQRCodeScanned({ data: codes[0].value });
        onClose();
        setIsLoading(false);
      }
    },
  });

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-4">
        <Text className="text-center text-red-500">{t('devices.scanner.noPermission')}</Text>
        <TouchableOpacity className="mt-4 rounded-lg bg-blue-500 px-4 py-2" onPress={onClose}>
          <Text className="text-white">{t('common.close')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text>{t('devices.scanner.noDevice')}</Text>
        <TouchableOpacity className="mt-4 rounded-lg bg-blue-500 px-4 py-2" onPress={onClose}>
          <Text className="text-white">{t('common.close')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View className="flex-1">
      <Camera device={device} isActive={true} codeScanner={codeScanner} style={{ flex: 1 }} />

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 h-full w-full items-center justify-center bg-black/70">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-lg font-medium text-white">{t('common.connecting')}...</Text>
        </View>
      )}

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
          onPress={onClose}
          className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
          <MaterialIcons name="close" size={28} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
