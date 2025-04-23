import { useDeviceHook } from '@/lib/hooks/useDeviceHook';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Define the type for devices to display
type DeviceDisplay = {
  id: string;
  name: string;
  connectionId: string;
};

type DeviceSelectorProps = {
  selectedDeviceId?: string;
  onSelectDevice: (device: DeviceDisplay) => void;
};

export default function DeviceSelector({ selectedDeviceId, onSelectDevice }: DeviceSelectorProps) {
  const { t } = useTranslation();
  const { connections, loading } = useDeviceHook();
  const [modalVisible, setModalVisible] = useState(false);

  // Convert connections to device display objects
  const devicesToDisplay = useMemo(() => {
    return connections.map((conn) => ({
      id: conn.deviceId,
      name: conn.name,
      connectionId: conn.id,
    }));
  }, [connections]);

  // Find the currently selected device
  const selectedDevice = useMemo(() => {
    if (!selectedDeviceId) {
      return devicesToDisplay.length > 0 ? devicesToDisplay[0] : null;
    }
    return (
      devicesToDisplay.find((device) => device.id === selectedDeviceId) ||
      (devicesToDisplay.length > 0 ? devicesToDisplay[0] : null)
    );
  }, [selectedDeviceId, devicesToDisplay]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelectDevice = (device: DeviceDisplay) => {
    onSelectDevice(device);
    toggleModal();
  };

  if (loading) {
    return (
      <View className="flex-row items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
        <ActivityIndicator size="small" color="#3D8D7A" />
        <Text className="text-base text-gray-600 ml-2">{t('common.loading')}</Text>
      </View>
    );
  }

  if (devicesToDisplay.length === 0) {
    return (
      <View className="flex-row items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
        <MaterialIcons name="devices" size={18} color="#3D8D7A" />
        <Text className="text-base text-gray-600 ml-2">{t('statistics.noDevices')}</Text>
      </View>
    );
  }

  return (
    <View>
      <Pressable
        onPress={toggleModal}
        className="flex-row items-center justify-between bg-white rounded-lg pl-4 pr-2 py-2 shadow-sm gap-2 border border-primary-300 max-w-[200px] overflow-x-hidden">
        <Text className="text-base text-gray-800 font-medium line-clamp-1">
          {selectedDevice ? selectedDevice.name : t('statistics.selectDevice')}
        </Text>
        <Entypo name="chevron-down" size={16} color="#3D8D7A" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}>
        <Pressable className="flex-1 bg-black/30 justify-center items-center" onPress={toggleModal}>
          <View className="w-4/5 bg-white rounded-xl overflow-hidden p-2">
            <View className="pb-2 border-b border-gray-100">
              <Text className="text-lg font-bold text-primary-600 px-2 py-2">
                {t('statistics.selectDevice')}
              </Text>
            </View>

            <FlatList
              data={devicesToDisplay}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    selectedDevice && selectedDevice.id === item.id ? 'bg-primary-50' : ''
                  }`}
                  onPress={() => handleSelectDevice(item)}>
                  <Text className="text-base text-gray-800">{item.name}</Text>
                  {selectedDevice && selectedDevice.id === item.id && (
                    <MaterialIcons name="check" size={18} color="#3D8D7A" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
