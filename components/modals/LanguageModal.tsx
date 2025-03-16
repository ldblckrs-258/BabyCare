import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';

type LanguageModalProps = {
  visible: boolean;
  onClose: () => void;
};

type Language = {
  code: string;
  name: string;
};

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
];

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  const handleSelectLanguage = (languageCode: string) => {
    setLanguage(languageCode);
  };

  const handleSave = () => {
    // Language is already saved in the store
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="h-1/2 rounded-t-3xl bg-white p-6 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">{t('settings.language.title')}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Language List */}
          <View className="flex-1">
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                className={`mb-2 rounded-lg border p-4 ${language === lang.code ? 'border-tertiary-400 ' : 'border-gray-200 '}`}>
                <View className="flex flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full">
                      <MaterialIcons name="language" size={20} color="#5d97d3" />
                    </View>
                    <Text className="text-base font-medium text-gray-800">{lang.name}</Text>
                  </View>
                  {language === lang.code && (
                    <View className="mt-1 flex size-5 items-center justify-center rounded-full border-2 border-tertiary-500">
                      <View className="size-2.5 rounded-full bg-tertiary-500" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} className="mt-4 rounded-lg bg-primary-500 p-4">
            <Text className="text-center text-base font-semibold text-white">
              {t('settings.language.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
