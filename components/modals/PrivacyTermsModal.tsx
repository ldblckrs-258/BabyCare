import { SlideModal } from './SlideModal';
import { useTranslation } from '@/lib/hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PrivacyTermsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function PrivacyTermsModal({ visible, onClose }: PrivacyTermsModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <SlideModal visible={visible} onClose={onClose} title={t('settings.privacyAndTerms.title')}>
      {/* Privacy & Terms Content */}
      <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        {/* Privacy Policy Section */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center">
            <View className="mr-2 w-8 items-center justify-center rounded-full">
              <MaterialIcons name="privacy-tip" size={20} color="#5d97d3" />
            </View>
            <Text className="text-xl font-bold text-gray-800">
              {t('settings.privacyAndTerms.privacyTitle')}
            </Text>
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
            <Text className="text-xl font-bold text-gray-800">
              {t('settings.privacyAndTerms.termsTitle')}
            </Text>
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
      </View>
    </SlideModal>
  );
}
