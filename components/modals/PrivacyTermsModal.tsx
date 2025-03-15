import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type PrivacyTermsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function PrivacyTermsModal({ visible, onClose }: PrivacyTermsModalProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="flex h-4/5 flex-col rounded-t-3xl bg-white p-6 pr-1 shadow-lg">
          {/* Header with close button */}
          <View className="mb-6 mr-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">Privacy & Terms</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Privacy & Terms Content */}
          <ScrollView className="flex-1 pr-4">
            {/* Privacy Policy Section */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 w-8 items-center justify-center rounded-full">
                  <MaterialIcons name="privacy-tip" size={20} color="#5d97d3" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Privacy Policy</Text>
              </View>

              <Text className="mb-2 text-base font-semibold text-gray-700">Data Collection</Text>
              <Text className="mb-4 text-gray-600">
                BabyCare collects data related to your baby's sleep patterns, crying episodes, and
                device usage. This data is used to provide you with insights and alerts about your
                baby's well-being.
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">Data Storage</Text>
              <Text className="mb-4 text-gray-600">
                All data is securely stored and encrypted. We use industry-standard security
                measures to protect your information. Your data is stored on secure servers and is
                only accessible to you through your authenticated account.
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">Data Sharing</Text>
              <Text className="mb-4 text-gray-600">
                We do not sell or share your personal data with third parties. Your baby's
                information remains private and is only used to provide the services you've
                requested.
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

              <Text className="mb-2 text-base font-semibold text-gray-700">License</Text>
              <Text className="mb-4 text-gray-600">
                BabyCare grants you a limited, non-exclusive, non-transferable license to use the
                application for personal, non-commercial purposes.
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">Restrictions</Text>
              <Text className="mb-4 text-gray-600">
                You may not modify, distribute, or create derivative works based on our application.
                The app and its content remain the property of BabyCare.
              </Text>

              <Text className="mb-2 text-base font-semibold text-gray-700">Disclaimer</Text>
              <Text className="mb-4 text-gray-600">
                BabyCare is designed as a supplementary tool for baby monitoring and should not
                replace proper adult supervision. We are not responsible for any incidents that may
                occur while using our application.
              </Text>
            </View>

            {/* Contact Information */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 w-8 items-center justify-center rounded-full">
                  <MaterialIcons name="contact-support" size={20} color="#5d97d3" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Contact Us</Text>
              </View>

              <Text className="text-gray-600">
                If you have any questions about our Privacy Policy or Terms of Service, please
                contact us at:
              </Text>
              <Text className="mt-2 text-blue-600">ldb258204@gmail.com</Text>
            </View>
          </ScrollView>

          {/* Accept Button */}
          <View className="mt-4 w-full pr-4">
            <TouchableOpacity onPress={onClose} className="w-full rounded-lg bg-primary-500 p-4">
              <Text className="text-center text-base font-semibold text-white">I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
