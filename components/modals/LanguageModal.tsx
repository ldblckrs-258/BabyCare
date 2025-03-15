import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type LanguageModalProps = {
  visible: boolean;
  onClose: () => void;
};

type Language = {
  code: string;
  name: string;
};

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const languages: Language[] = [
    { code: 'vi', name: 'Vietnamese' },
    { code: 'en', name: 'English' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('vi');

  const handleSelectLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="h-1/2 rounded-t-3xl bg-white p-6 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">Language</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Language List */}
          <View className="flex-1">
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleSelectLanguage(language.code)}
                className={`mb-2 rounded-lg border p-4 ${selectedLanguage === language.code ? 'border-tertiary-400 ' : 'border-gray-200 '}`}>
                <View className="flex flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full">
                      <MaterialIcons name="language" size={20} color="#5d97d3" />
                    </View>
                    <Text className="text-base font-medium text-gray-800">{language.name}</Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <View className="mt-1 flex size-5 items-center justify-center rounded-full border-2 border-tertiary-500">
                      <View className="size-2.5 rounded-full bg-tertiary-500" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={onClose} className="mt-4 rounded-lg bg-primary-500 p-4">
            <Text className="text-center text-base font-semibold text-white">Save Language</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
