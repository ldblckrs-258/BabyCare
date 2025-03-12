import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/welcome/1.png'),
    title: ['Welcome to', 'BabyCare'],
    subtitle:
      "Caring for your little one has never been easier or more reassuring. BabyCare is your ultimate companion in monitoring and protecting your child comprehensively, even when you're not right beside them.",
    color: '#F3FAF7',
  },
  {
    id: '2',
    image: require('../assets/welcome/2.png'),
    title: ['Safe Sleep Position', 'Monitoring'],
    subtitle:
      "Worry no more about your baby's sleeping position. Our AI system continuously monitors and immediately alerts you to potentially dangerous sleeping postures and keep your child safe.",
    color: '#F9E7E8',
  },
  {
    id: '3',
    image: require('../assets/welcome/3.png'),
    title: ['Intelligent', 'Cry Detection'],
    subtitle:
      "Our advanced AI technology analyzes your baby's cries, helping you quickly understand their needs and condition. Receive instant notifications whenever your child requires attention, no matter where you are.",
    color: '#E6EDF8',
  },
];

export function WelcomeScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);

  const Footer = () => {
    return (
      <View className="absolute bottom-2 aspect-square w-full p-3">
        <View className="flex-1 flex-col items-center justify-center rounded-3xl bg-white px-5 py-6">
          {/* Indicator container */}
          <View className="flex-row justify-center gap-1">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2.5 rounded-full ${
                  currentSlideIndex === index ? 'bg-primary-500 w-6' : 'bg-primary-200 w-2.5'
                }`}
              />
            ))}
          </View>

          <View className="w-full flex-1 flex-col items-center justify-center">
            <Text className="text-4xl font-bold text-black">
              {slides[currentSlideIndex].title[0]}
            </Text>
            <Text className="text-primary-500 text-4xl font-bold">
              {slides[currentSlideIndex].title[1]}
            </Text>
            <Text className="pt-4 text-center text-xl text-gray-600">
              {slides[currentSlideIndex].subtitle}
            </Text>
          </View>

          {/* Button container */}
          <View className="mx-4">
            {currentSlideIndex === slides.length - 1 ? (
              <View className="flex flex-col items-center gap-4">
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  className="bg-tertiary-600 w-[180px] rounded-full py-3">
                  <Text className="w-[180px] text-center text-xl font-semibold text-white">
                    Sign up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="w-[180px] text-center text-xl font-medium text-gray-400">
                    Login now
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex flex-col items-center gap-4">
                <TouchableOpacity
                  onPress={goNextSlide}
                  className="bg-primary-500 w-[180px] rounded-full py-3">
                  <Text className="text-center text-xl font-semibold text-white">Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="w-[180px] text-center text-xl font-medium text-gray-400">
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const goNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      flatListRef.current?.scrollToIndex({
        index: nextSlideIndex,
        animated: true,
      });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const updateCurrentSlideIndex = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor={slides[currentSlideIndex].color} />
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1">
            <View className="flex-1 items-center justify-center px-4">
              <Image
                source={item.image}
                className="absolute h-screen w-screen"
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      />
      <Footer />
    </SafeAreaView>
  );
}
