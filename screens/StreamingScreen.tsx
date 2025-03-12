import { Text, View } from 'react-native';

export default function StreamingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-100">
      <Text className="text-2xl font-bold text-gray-800">Streaming Screen</Text>
      <Text className="mt-2 text-gray-600">This is where streaming content will be displayed.</Text>
    </View>
  );
}
