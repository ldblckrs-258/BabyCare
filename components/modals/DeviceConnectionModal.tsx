import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, Pressable, Switch, Text, TouchableOpacity, View } from 'react-native';

type DeviceConnectionModalProps = {
  visible: boolean;
  onClose: () => void;
  isDeviceConnected: boolean;
  setIsDeviceConnected: (value: boolean) => void;
};

export function DeviceConnectionModal({
  visible,
  onClose,
  isDeviceConnected,
  setIsDeviceConnected,
}: DeviceConnectionModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);

  const handleScanDevices = () => {
    setIsScanning(true);
    // Simulate finding devices after 2 seconds
    setTimeout(() => {
      setAvailableDevices(['BabyCare Monitor #1', 'BabyCare Monitor #2']);
      setIsScanning(false);
    }, 2000);
  };

  const handleConnectDevice = (deviceName: string) => {
    setIsDeviceConnected(true);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="h-3/4 rounded-t-3xl bg-white p-6 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">Device Connection</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Connection Status */}
          <View className="mb-6 rounded-lg bg-gray-50 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-medium text-gray-700">Bluetooth</Text>
              <Switch
                trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
                thumbColor={isDeviceConnected ? '#3b82f6' : '#9ca3af'}
                onValueChange={setIsDeviceConnected}
                value={isDeviceConnected}
              />
            </View>
            <Text className="mt-2 text-sm text-gray-500">
              {isDeviceConnected
                ? 'Bluetooth is enabled. You can connect to BabyCare devices.'
                : 'Enable Bluetooth to connect to BabyCare devices.'}
            </Text>
          </View>

          {/* Available Devices Section */}
          {isDeviceConnected && (
            <View className="flex-1">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-800">Available Devices</Text>
                <TouchableOpacity
                  onPress={handleScanDevices}
                  disabled={isScanning}
                  className={`rounded-full ${isScanning ? 'bg-gray-200' : 'bg-blue-100'} px-4 py-2`}>
                  <Text
                    className={`text-sm font-medium ${
                      isScanning ? 'text-gray-500' : 'text-blue-600'
                    }`}>
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Device List */}
              <View className="flex-1">
                {availableDevices.length > 0 ? (
                  availableDevices.map((device, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleConnectDevice(device)}
                      className="mb-2 rounded-lg border border-gray-200 p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <MaterialIcons name="bluetooth" size={20} color="#3b82f6" />
                          </View>
                          <Text className="text-base font-medium text-gray-800">{device}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-center text-gray-500">
                      {isScanning
                        ? 'Searching for devices...'
                        : 'No devices found. Tap Scan to search for devices.'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Help Text */}
          <View className="mt-4 rounded-lg bg-blue-50 p-4">
            <Text className="text-sm text-blue-700">
              Make sure your BabyCare device is turned on and within range. If you're having trouble
              connecting, try restarting the device.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
