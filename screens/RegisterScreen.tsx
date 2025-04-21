import { PasswordInput } from '../components/inputs/PasswordInput';
import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from '../types/navigation';
import { useTranslation } from '@/lib/hooks/useTranslation';
import Fa6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RegisterScreen() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { signUp, signInWithGoogle, loading, error: authError } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError(t('register.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwordsMismatch'));
      return;
    }
    if (!agreeToTerms) {
      setError(t('register.agreeToTerms'));
      return;
    }

    try {
      const success = await signUp(email, password, fullName);
      if (success) {
        navigation.navigate('Main');
      } else {
        setError(authError || t('register.error'));
      }
    } catch (err) {
      setError(authError || t('register.error'));
    }
  };

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
          <View className="flex px-6 py-4 pb-8 flex-1">
            {/* Header with back button */}
            <View className="mb-4">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Fa6 name="chevron-left" size={16} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Register Form */}
            <View className="flex flex-col gap-4 flex-1 justify-center pb-14">
              <Text className="mb-12 text-center text-3xl font-bold text-gray-900">
                {t('register.title')}
              </Text>

              {/* Full Name Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  {t('register.fullName')}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                  placeholder={t('register.fullNamePlaceholder')}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError('');
                  }}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  {t('register.email')}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                  placeholder={t('register.emailPlaceholder')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  {t('register.password')}
                </Text>
                <PasswordInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  placeholder={t('register.passwordPlaceholder')}
                />
              </View>

              {/* Confirm Password Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  {t('register.confirmPassword')}
                </Text>
                <PasswordInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError('');
                  }}
                  placeholder={t('register.passwordPlaceholder')}
                />
              </View>

              {/* Error Message */}
              {error ? <Text className="text-center text-sm text-red-500">{error}</Text> : null}

              {/* Terms & Conditions */}
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  className={`mr-2 mt-1 h-5 w-5 items-center justify-center rounded border ${
                    agreeToTerms ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                  }`}>
                  {agreeToTerms && <Fa6 name="check" size={12} color="#fff" />}
                </Pressable>
                <Text className="flex-1 text-sm text-gray-600">
                  {t('auth.agreeToTerms')}{' '}
                  <Text className="font-semibold text-primary-600">
                    {t('auth.termsAndConditions')}
                  </Text>{' '}
                  {t('auth.and')}{' '}
                  <Text className="font-semibold text-primary-600">{t('auth.privacyPolicy')}</Text>
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading || !agreeToTerms}
                className="rounded-lg bg-primary-500 px-4 py-3 disabled:opacity-50">
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">
                    {t('register.createAccount')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600">{t('register.alreadyHaveAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="font-semibold text-primary-600">{t('register.loginHere')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
