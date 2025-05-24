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

export function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn, signInWithGoogle, error: authError } = useAuthStore();
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const handleLogin = async () => {
    if (!email || !password) {
      setError('auth.errors.invalidEmailOrPassword');
      return;
    }
    setEmailLoginLoading(true);
    try {
      const success = await signIn(email, password);
      if (!success) {
        setError(authError || 'auth.errors.invalidEmailOrPassword');
      }
    } finally {
      setEmailLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoginLoading(true);
    try {
      const success = await signInWithGoogle();
      if (!success) {
        setError(authError || 'auth.errors.signInFailed');
      }
    } finally {
      setGoogleLoginLoading(false);
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
          <View className="flex flex-1 px-6 py-4 pb-8">
            {/* Header with back button */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Fa6 name="chevron-left" size={16} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Login Form */}
            <View className="flex flex-col gap-6 flex-1 justify-center pb-24">
              <Text className="mb-14 text-center text-3xl font-bold text-gray-900">
                {t('auth.login')}
              </Text>
              {/* Google Sign In */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={googleLoginLoading}
                className="flex-row items-center justify-center space-x-2 rounded-lg bg-white p-4 gap-2">
                {googleLoginLoading ? (
                  <ActivityIndicator color="#999" />
                ) : (
                  <>
                    <Image
                      source={require('../assets/google-icon.png')}
                      className="h-6 w-6"
                      resizeMode="contain"
                    />
                    <Text className="text-base font-semibold text-gray-700">
                      {t('auth.loginWithGoogle')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {/* Divider */}
              <View className="flex-row items-center">
                <View className="flex-1 border-t border-gray-300" />
                <Text className="mx-4 text-gray-500">{t('auth.orLoginWith')}</Text>
                <View className="flex-1 border-t border-gray-300" />
              </View>
              {/* Email Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">{t('auth.email')}</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
              {/* Password Input */}
              <View>
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-sm font-medium text-gray-700">{t('auth.password')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text className="text-sm font-medium text-blue-600">
                      {t('auth.forgotPassword')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <PasswordInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                />
              </View>
              {/* Error Message */}
              {error ? <Text className="text-center text-sm text-red-500">{t(error)}</Text> : null}
              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={emailLoginLoading || googleLoginLoading}
                className="rounded-lg bg-primary-500 px-4 h-14 flex items-center justify-center">
                {emailLoginLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">
                    {t('auth.login')}
                  </Text>
                )}
              </TouchableOpacity>
              {/* Sign Up Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600">{t('auth.dontHaveAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="font-semibold text-primary-600">{t('auth.signUpNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
