import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from '../types/navigation';
import { useTranslation } from '@/lib/hooks/useTranslation';
import Fa6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_ATTEMPTS = 3;
const COOLDOWN_TIME = 30; // 30 seconds

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { sendPasswordResetEmail, error: authError } = useAuthStore();

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleSendResetEmail = async () => {
    // Validate email
    if (!email) {
      setError(t('auth.forgotPasswordScreen.errors.emailRequired'));
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.forgotPasswordScreen.errors.invalidEmail'));
      return;
    }

    // Check if max attempts reached
    if (attempts >= MAX_ATTEMPTS) {
      setError(t('auth.forgotPasswordScreen.errors.limitReached'));
      return;
    }

    // Check cooldown
    if (countdown > 0) {
      setError(t('auth.forgotPasswordScreen.errors.waitBeforeResend', { seconds: countdown }));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await sendPasswordResetEmail(email);
      if (success) {
        setSuccess(t('auth.forgotPasswordScreen.success.emailSent'));
        setAttempts(attempts + 1);
        setCountdown(COOLDOWN_TIME);

        // Show success alert
        Alert.alert(
          t('auth.forgotPasswordScreen.success.alertTitle'),
          t('auth.forgotPasswordScreen.success.alertMessage'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setError(authError || t('auth.forgotPasswordScreen.errors.emailNotFound'));
      }
    } catch (err) {
      setError(t('auth.forgotPasswordScreen.errors.sendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || countdown > 0 || attempts >= MAX_ATTEMPTS;

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 40}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1">
          <View className="flex flex-1 px-6 py-4 pb-8">
            {/* Header with back button */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Fa6 name="chevron-left" size={16} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Form */}
            <View className="flex flex-col gap-6 flex-1 justify-center pb-24">
              <Text className="text-center text-3xl font-bold text-gray-900">
                {t('auth.forgotPasswordScreen.title')}
              </Text>

              <Text className="text-center text-gray-600 mb-6">
                {t('auth.forgotPasswordScreen.subtitle')}
              </Text>

              {/* Email Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">{t('auth.email')}</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                  placeholder={t('auth.forgotPasswordScreen.emailPlaceholder')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                    setSuccess('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="send"
                  onSubmitEditing={handleSendResetEmail}
                />
              </View>

              {/* Error Message */}
              {error ? <Text className="text-center text-sm text-red-500">{error}</Text> : null}

              {/* Success Message */}
              {success ? (
                <Text className="text-center text-sm text-green-600">{success}</Text>
              ) : null}

              {/* Send Reset Email Button */}
              <TouchableOpacity
                onPress={handleSendResetEmail}
                disabled={isButtonDisabled}
                className={`rounded-lg px-4 h-14 flex items-center justify-center ${
                  isButtonDisabled ? 'bg-gray-400' : 'bg-primary-500'
                }`}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">
                    {countdown > 0
                      ? t('auth.forgotPasswordScreen.resendButton', { seconds: countdown })
                      : attempts >= MAX_ATTEMPTS
                        ? t('auth.forgotPasswordScreen.limitReached')
                        : t('auth.forgotPasswordScreen.sendButton')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600">
                  {t('auth.forgotPasswordScreen.rememberPassword')}{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text className="font-semibold text-primary-600">
                    {t('auth.forgotPasswordScreen.backToLogin')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
