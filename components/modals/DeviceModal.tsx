import { SlideModal } from './SlideModal';
import { DeviceModalContent } from './device/DeviceModalContent';
import { QRScannerView } from './device/QRScannerView';
import { useDeviceHook } from '@/lib/hooks';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useState } from 'react';
import { Modal } from 'react-native';

type DeviceModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function DeviceModal({ visible, onClose }: DeviceModalProps) {
  const { t } = useTranslation();
  const { connectDevice } = useDeviceHook();
  const [scanMode, setScanMode] = useState(false);

  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    // Assuming the QR code contains a device ID
    if (data) {
      try {
        // Create a connection with the device
        await connectDevice(data);
        setScanMode(false);
      } catch (error) {
        console.error('Error connecting to device:', error);
      }
    }
  };

  if (scanMode) {
    return (
      <Modal
        animationType="none"
        transparent
        visible={visible}
        onRequestClose={() => setScanMode(false)}>
        <QRScannerView onQRCodeScanned={handleQRCodeScanned} onClose={() => setScanMode(false)} />
      </Modal>
    );
  }

  return (
    <SlideModal visible={visible} onClose={onClose} title={t('devices.title')}>
      <DeviceModalContent onClose={onClose} scanMode={scanMode} setScanMode={setScanMode} />
    </SlideModal>
  );
}
