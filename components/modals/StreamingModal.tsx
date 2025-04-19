import { useTranslation } from '@/lib/hooks/useTranslation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AVPlaybackStatus, ResizeMode, Video, VideoFullscreenUpdate } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StreamingModalProps = {
  visible: boolean;
  onClose: () => void;
  deviceId?: string;
  deviceName?: string;
  isConnected?: boolean;
};

export function StreamingModal({
  visible,
  onClose,
  deviceId,
  deviceName = 'Unknown Device',
  isConnected = false,
}: StreamingModalProps) {
  const { t } = useTranslation();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [controlsVisible, setControlsVisible] = useState(true);

  // This would be your actual stream URL from your device
  const streamUrl =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'; // Placeholder stream URL

  // Handle back button press in fullscreen mode
  useEffect(() => {
    const backAction = () => {
      if (isFullscreen && video.current) {
        video.current.dismissFullscreenPlayer();
        return true; // Prevent default behavior
      }
      return false; // Let the default behavior happen
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFullscreen]);

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setError(null);
      // Simulate connecting to the stream
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

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
        {!isConnected ? (
          <View
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
            <FontAwesome6 name="video-slash" size={20} color="#ffffff" />
            <Text className="text-white text-lg mt-2 font-semibold">
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
        {isConnected && !isLoading && !error && !isFullscreen && (
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View className="flex-1 bg-white">
        <View style={{ paddingTop: insets.top }} className="flex-1">
          <StatusBar style="light" backgroundColor="#000000" />

          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={onClose} className="mr-2">
                <MaterialIcons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-800">{deviceName}</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="more-vert" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Video Container */}
          {renderVideoContainer()}

          {/* Stats and info */}
          <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
            <View className="bg-white rounded-xl p-4 shadow mb-4">
              <Text className="text-lg font-medium text-primary-600 mb-2">
                {t('streaming.streamInfo')}
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">{t('streaming.status.title')}:</Text>
                <Text
                  className={`font-medium ${isConnected ? 'text-primary-500' : 'text-secondary-500'}`}>
                  {isConnected
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
                  {isConnected && !isLoading && !error ? t('streaming.quality.hd') : '—'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">{t('streaming.connection.title')}:</Text>
                <Text className="font-medium text-gray-800">
                  {isConnected && !isLoading && !error ? t('streaming.connection.wifi') : '—'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
