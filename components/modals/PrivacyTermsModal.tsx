import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/lib/hooks/useTranslation';

type PrivacyTermsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function PrivacyTermsModal({ visible, onClose }: PrivacyTermsModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View
          className="relative flex h-3/4 flex-col rounded-t-3xl bg-white shadow-lg"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          {/* Header with close button */}
          <View className="mb-4 flex-row items-center justify-between px-6 pt-6">
            <Text className="text-2xl font-bold text-gray-800">
              {t('settings.privacyAndTerms.title')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Privacy & Terms Content */}
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator>
            {/* Privacy Policy Section */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 w-8 items-center justify-center rounded-full">
                  <MaterialIcons name="privacy-tip" size={20} color="#5d97d3" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Privacy Policy</Text>
              </View>

              <Text className="mb-2 text-base font-semibold text-gray-700">
                {t('settings.privacyAndTerms.dataCollection.title')}
              </Text>
              <Text className="mb-4 text-gray-600">
                {t('settings.privacyAndTerms.dataCollection.content')}
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">
                {t('settings.privacyAndTerms.dataStorage.title')}
              </Text>
              <Text className="mb-4 text-gray-600">
                {t('settings.privacyAndTerms.dataStorage.content')}
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">
                {t('settings.privacyAndTerms.dataSharing.title')}
              </Text>
              <Text className="mb-4 text-gray-600">
                {t('settings.privacyAndTerms.dataSharing.content')}
              </Text>
            </View>

            {/* Terms of Service Section */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 w-8 items-center justify-center rounded-full">
                  <MaterialIcons name="description" size={20} color="#5d97d3" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Terms of Service</Text>
              </View>

              <Text className="mb-2 text-base font-semibold text-gray-700">
                {t('settings.privacyAndTerms.license.title')}
              </Text>
              <Text className="mb-4 text-gray-600">
                {t('settings.privacyAndTerms.license.content')}
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">
                {t('settings.privacyAndTerms.restrictions.title')}
              </Text>
              <Text className="mb-4 text-gray-600">
                {t('settings.privacyAndTerms.restrictions.content')}
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">
                {t('settings.privacyAndTerms.disclaimer.title')}
              </Text>
              <Text className="mb-4 text-gray-600">
                {t('settings.privacyAndTerms.disclaimer.content')}
              </Text>
            </View>

            {/* Contact Information */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 w-8 items-center justify-center rounded-full">
                  <MaterialIcons name="contact-support" size={20} color="#5d97d3" />
                </View>
                <Text className="text-xl font-bold text-gray-800">
                  {t('settings.privacyAndTerms.contactUs.title')}
                </Text>
              </View>

              <Text className="text-gray-600">
                {t('settings.privacyAndTerms.contactUs.content')}
              </Text>
              <Text className="mt-2 text-blue-600">ldb258204@gmail.com</Text>
            </View>
          </ScrollView>
          <View className="bg-white px-6 pt-4">
            <TouchableOpacity onPress={onClose} className="w-full rounded-lg bg-primary-500 p-4">
              <Text className="text-center text-base font-semibold text-white">
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
