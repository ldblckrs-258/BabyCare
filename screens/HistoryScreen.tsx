import { Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-100">
      <Text className="text-2xl font-bold text-gray-800">History Screen</Text>
      <Text className="mt-2 text-gray-600">This is where history content will be displayed.</Text>
    </View>
  );
}
