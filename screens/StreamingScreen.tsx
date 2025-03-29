import { useTranslation } from '@/lib/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settingsStore';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StackActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { AVPlaybackStatus, ResizeMode, Video, VideoFullscreenUpdate } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StreamingScreen() {
  const { t } = useTranslation();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isDeviceConnected } = useSettingsStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [controlsVisible, setControlsVisible] = useState(true);

  // This would be your actual stream URL from your device
  const streamUrl =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'; // Placeholder stream URL

  // Hide header when screen is focused
  useEffect(() => {
    if (isFocused) {
      navigation.setOptions({
        headerShown: false,
      });
    }
    return () => {
      // Restore header when screen is unfocused
      navigation.setOptions({
        headerShown: true,
      });
    };
  }, [isFocused, navigation]);

  useEffect(() => {
    // Simulate connecting to the stream
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Handle back button press in fullscreen mode
  useEffect(() => {
    const backAction = () => {
      if (isFullscreen && video.current) {
        video.current.dismissFullscreenPlayer();
        return true; // Prevent default behavior (app exit)
      }
      return false; // Let the default behavior happen (go back)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFullscreen]);

  // Auto-hide controls after a few seconds in fullscreen mode
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isFullscreen && controlsVisible) {
      timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setControlsVisible(false);
        });
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isFullscreen, controlsVisible, fadeAnim]);

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    setError(t('streaming.errorMessage.connectionFailed'));
    setIsLoading(false);
  };

  const handlePlayPause = async () => {
    if (video.current) {
      if (status.isLoaded && status.isPlaying) {
        await video.current.pauseAsync();
      } else if (status.isLoaded) {
        await video.current.playAsync();
      }
    }
  };

  const toggleFullscreen = async () => {
    if (video.current) {
      if (isFullscreen) {
        video.current.dismissFullscreenPlayer();
      } else {
        video.current.presentFullscreenPlayer();
      }
    }
  };

  const handleFullscreenUpdate = async ({
    fullscreenUpdate,
  }: {
    fullscreenUpdate: VideoFullscreenUpdate;
  }) => {
    switch (fullscreenUpdate) {
      case VideoFullscreenUpdate.PLAYER_WILL_PRESENT:
        // The player is about to enter fullscreen
        setIsFullscreen(true);
        setControlsVisible(true);
        fadeAnim.setValue(1);

        // Hide tab bar when entering fullscreen
        navigation.setOptions({
          tabBarStyle: { display: 'none' },
        });
        break;
      case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
        // The player finished presenting in fullscreen
        // Lock to landscape orientation
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        break;
      case VideoFullscreenUpdate.PLAYER_WILL_DISMISS:
        // The player is about to dismiss fullscreen
        break;
      case VideoFullscreenUpdate.PLAYER_DID_DISMISS:
        // The player finished dismissing fullscreen
        setIsFullscreen(false);

        // Show tab bar when exiting fullscreen
        navigation.setOptions({
          tabBarStyle: { display: 'flex' },
        });

        // Return to portrait orientation
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        break;
    }
  };

  const showControls = () => {
    if (isFullscreen && !controlsVisible) {
      setControlsVisible(true);
      fadeAnim.setValue(1);
    }
  };

  const renderVideoContainer = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={showControls}
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          backgroundColor: 'black',
          position: 'relative',
        }}>
        {!isDeviceConnected ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
            <FontAwesome6 name="video-slash" size={40} color="#ffffff" />
            <Text className="text-white text-lg mt-2">
              {t('settings.deviceConnection.notConnected')}
            </Text>
            <Text className="text-white text-sm mt-1 px-8 text-center">
              {t('settings.deviceConnection.helpText')}
            </Text>
          </View>
        ) : isLoading ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
            <ActivityIndicator size="large" color="#3d8d7a" />
            <Text className="text-white text-base mt-2">{t('streaming.connectingToStream')}</Text>
          </View>
        ) : error ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
            <FontAwesome6 name="exclamation-circle" size={40} color="#d26165" />
            <Text className="text-white text-base mt-2">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-primary-500 py-2 px-4 rounded-full"
              onPress={() => {
                setIsLoading(true);
                setError(null);
                setTimeout(() => setIsLoading(false), 2000);
              }}>
              <Text className="text-white">{t('streaming.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Video
            ref={video}
            source={{ uri: streamUrl }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping={true}
            useNativeControls={false}
            style={{ width: '100%', height: '100%' }}
            onFullscreenUpdate={handleFullscreenUpdate}
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            onError={handleVideoError}
          />
        )}

        {/* Custom video controls overlay - only show when not in fullscreen mode */}
        {isDeviceConnected && !isLoading && !error && !isFullscreen && (
          <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center px-2 bg-black/40">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="w-12 h-12 rounded-full items-center justify-center"
                onPress={handlePlayPause}>
                <FontAwesome6
                  name={status.isLoaded && status.isPlaying ? 'pause' : 'play'}
                  size={16}
                  color="#ffffff"
                />
              </TouchableOpacity>
              <View className="size-2 bg-rose-500 rounded-full ml-2" />
              <Text className="text-white ml-2">{t('streaming.live')}</Text>
            </View>

            <TouchableOpacity
              className="w-12 h-12 rounded-full items-center justify-center"
              onPress={toggleFullscreen}>
              <FontAwesome6 name="expand" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: insets.top }}>
      <StatusBar style="light" backgroundColor="#000000" />
      {renderVideoContainer()}

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
        <View className="bg-white rounded-xl p-4 shadow">
          <Text className="text-lg font-medium text-primary-600 mb-2">
            {t('streaming.streamInfo')}
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">{t('streaming.status.title')}:</Text>
            <Text
              className={`font-medium ${isDeviceConnected ? 'text-primary-500' : 'text-secondary-500'}`}>
              {isDeviceConnected
                ? isLoading
                  ? t('streaming.status.connecting')
                  : error
                    ? t('streaming.status.error')
                    : t('streaming.status.active')
                : t('streaming.status.disconnected')}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">{t('streaming.quality.title')}:</Text>
            <Text className="font-medium text-gray-800">
              {isDeviceConnected && !isLoading && !error ? t('streaming.quality.hd') : '—'}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">{t('streaming.connection.title')}:</Text>
            <Text className="font-medium text-gray-800">
              {isDeviceConnected && !isLoading && !error ? t('streaming.connection.wifi') : '—'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
