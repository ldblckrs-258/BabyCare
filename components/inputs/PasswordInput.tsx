import Fa6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  testID?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

export function PasswordInput({
  value,
  onChangeText,
  placeholder = '••••••••',
  className = '',
  inputClassName = '',
  disabled = false,
  testID,
  autoFocus = false,
  onBlur,
  onFocus,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`relative ${className}`}>
      <TextInput
        className={`rounded-lg border border-gray-300 bg-white px-4 py-3 ${inputClassName}`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        editable={!disabled}
        testID={testID}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {value?.length > 0 && (
        <TouchableOpacity
          className="absolute right-3 top-5"
          onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <Fa6 name="eye" size={16} color="#bbb" />
          ) : (
            <Fa6 name="eye-slash" size={16} color="#bbb" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
