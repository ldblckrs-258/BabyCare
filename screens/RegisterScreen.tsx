import Fa6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from '../types/navigation';

export function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { signUp, signInWithGoogle, loading, error: authError } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      setError('Please agree to Terms & Conditions');
      return;
    }

    try {
      await signUp(email, password);
      // TODO: Update user profile with full name
      navigation.navigate('Main');
    } catch (err) {
      setError(authError || 'An error occurred during registration');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      navigation.navigate('Main');
    } catch (err) {
      setError(authError || 'An error occurred during Google sign up');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex flex-1 px-6 py-4">
        {/* Header with back button */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Fa6 name="chevron-left" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Register Form */}
        <View className="flex flex-col gap-4">
          <Text className="mb-16 text-center text-3xl font-bold text-gray-900">Register</Text>

          {/* Google Sign Up */}
          <TouchableOpacity
            onPress={handleGoogleSignUp}
            className="flex-row items-center justify-center space-x-2 rounded-lg bg-white p-4">
            <Image
              source={require('../assets/google-icon.png')}
              className="h-6 w-6"
              resizeMode="contain"
            />
            <Text className="text-base font-semibold text-gray-700">Sign up with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center">
            <View className="flex-1 border-t border-gray-300" />
            <Text className="mx-4 text-gray-500">or sign up with</Text>
            <View className="flex-1 border-t border-gray-300" />
          </View>

          {/* Full Name Input */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Full Name</Text>
            <TextInput
              className="rounded-lg border border-gray-300 bg-white px-4 py-3"
              placeholder="John Doe"
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
            <Text className="mb-2 text-sm font-medium text-gray-700">Email Address</Text>
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
            <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
            <View className="relative">
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3.5"
                onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Fa6 name="eye" size={16} color="#bbb" />
                ) : (
                  <Fa6 name="eye-slash" size={16} color="#bbb" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Confirm Password</Text>
            <View className="relative">
              <TextInput
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3.5"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <Fa6 name="eye" size={16} color="#bbb" />
                ) : (
                  <Fa6 name="eye-slash" size={16} color="#bbb" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? <Text className="text-center text-sm text-red-500">{error}</Text> : null}

          {/* Terms & Conditions */}
          <View className="flex-row items-start">
            <Pressable
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              className={`mr-2 mt-1 h-5 w-5 items-center justify-center rounded border ${
                agreeToTerms ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
              }`}>
              {agreeToTerms && <Fa6 name="check" size={12} color="#fff" />}
            </Pressable>
            <Text className="flex-1 text-sm text-gray-600">
              I agree to the{' '}
              <Text className="font-semibold text-primary-600">Terms & Conditions</Text> and{' '}
              <Text className="font-semibold text-primary-600">Privacy Policy</Text>
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="rounded-lg bg-primary-500 px-4 py-3">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-lg font-semibold text-white">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="font-semibold text-primary-600">Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
