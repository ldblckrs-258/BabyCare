import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../types/navigation';

import { useTranslation } from '@/lib/hooks/useTranslation';

const { width } = Dimensions.get('window');

export function WelcomeScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();

  const slides = [
    {
      id: '1',
      image: require('../assets/welcome/1.png'),
      title: t('welcome.slides.first.title', { returnObjects: true }),
      subtitle: t('welcome.slides.first.subtitle'),
      color: '#F3FAF7',
    },
    {
      id: '2',
      image: require('../assets/welcome/2.png'),
      title: t('welcome.slides.second.title', { returnObjects: true }),
      subtitle: t('welcome.slides.second.subtitle'),
      color: '#F9E7E8',
    },
    {
      id: '3',
      image: require('../assets/welcome/3.png'),
      title: t('welcome.slides.third.title', { returnObjects: true }),
      subtitle: t('welcome.slides.third.subtitle'),
      color: '#E6EDF8',
    },
  ];

  const Footer = () => {
    return (
      <View className="absolute bottom-0 aspect-square w-full p-3">
        <View className="flex-1 flex-col items-center justify-center rounded-3xl bg-white px-5 py-6">
          {/* Indicator container */}
          <View className="flex-row justify-center gap-1">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2.5 rounded-full ${
                  currentSlideIndex === index ? 'w-6 bg-primary-500' : 'w-2.5 bg-primary-200'
                }`}
              />
            ))}
          </View>

          <View className="w-full flex-1 flex-col items-center justify-center">
            <Text className="text-4xl font-bold text-black">
              {slides[currentSlideIndex].title[0]}
            </Text>
            <Text className="text-4xl font-bold text-primary-500">
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
                  className="w-[180px] rounded-full bg-tertiary-600 py-3">
                  <Text className="w-[180px] text-center text-xl font-semibold text-white">
                    {t('common.signUp')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="w-[180px] text-center text-xl font-medium text-gray-400">
                    {t('common.loginNow')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex flex-col items-center gap-4">
                <TouchableOpacity
                  onPress={goNextSlide}
                  className="w-[180px] rounded-full bg-primary-500 py-3">
                  <Text className="text-center text-xl font-semibold text-white">
                    {t('common.continue')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="w-[180px] text-center text-xl font-medium text-gray-400">
                    {t('common.skip')}
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
          <View style={{ width }} className="w-full flex-1">
            <View className="w-full flex-1 items-center justify-center">
              <Image source={item.image} className="h-full w-full" resizeMode="cover" />
            </View>
          </View>
        )}
      />
      <Footer />
    </SafeAreaView>
  );
}
