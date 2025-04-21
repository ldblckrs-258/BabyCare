import { PasswordInput } from '../components/inputs/PasswordInput';
import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from '../types/navigation';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn, signInWithGoogle, loading, error: authError } = useAuthStore();
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    try {
      const success = await signIn(email, password);
      if (success) {
        navigation.replace('Main');
      } else {
        setError(authError || 'Invalid email or password');
      }
    } catch (err) {
      setError(authError || 'An error occurred while logging in');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigation.replace('Main');
      } else {
        setError(authError || 'Failed to sign in with Google');
      }
    } catch (err) {
      setError(authError || 'An error occurred while logging in with Google');
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
              <Text className="mb-14 text-center text-3xl font-bold text-gray-900">Login</Text>
              {/* Google Sign In */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                className="flex-row items-center justify-center space-x-2 rounded-lg bg-white p-4">
                <Image
                  source={require('../assets/google-icon.png')}
                  className="h-6 w-6"
                  resizeMode="contain"
                />
                <Text className="text-base font-semibold text-gray-700">Login with Google</Text>
              </TouchableOpacity>
              {/* Divider */}
              <View className="flex-row items-center">
                <View className="flex-1 border-t border-gray-300" />
                <Text className="mx-4 text-gray-500">or login with</Text>
                <View className="flex-1 border-t border-gray-300" />
              </View>
              {/* Email Input */}
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
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
                />
              </View>
              {/* Password Input */}
              <View>
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-sm font-medium text-gray-700">Password</Text>
                  <TouchableOpacity onPress={() => console.log('Forgot password')}>
                    <Text className="text-sm font-medium text-blue-600">Forgot password?</Text>
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
              {error ? <Text className="text-center text-sm text-red-500">{error}</Text> : null}
              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="rounded-lg bg-primary-500 px-4 py-3">
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">Login</Text>
                )}
              </TouchableOpacity>
              {/* Sign Up Link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="font-semibold text-primary-600">Sign up now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
