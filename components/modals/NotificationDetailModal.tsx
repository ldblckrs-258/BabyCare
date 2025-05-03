import { useDeviceHook } from '@/lib/hooks';
import { Notification, NotificationType, formatTime } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { t } from 'i18next';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types for props
type NotificationDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  notification: Notification | null;
};

// Get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'Crying':
      return <Ionicons name="water" size={26} color="#5d97d3" />;
    case 'Prone':
      return <FontAwesome6 name="baby" size={26} color="#d26165" />;
    case 'Side':
      return <FontAwesome6 name="baby" size={26} color="#d97706" />;
    case 'NoBlanket':
      return <FontAwesome6 name="bed" size={20} color="#a855f7" />;
    case 'System':
      return <MaterialIcons name="notifications" size={28} color="#3d8d7a" />;
    default:
      return <MaterialIcons name="notifications" size={28} color="#3d8d7a" />;
  }
};

// Get background color for notification type
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'Crying':
      return 'bg-blue-100';
    case 'Prone':
      return 'bg-red-100';
    case 'Side':
      return 'bg-amber-100';
    case 'NoBlanket':
      return 'bg-purple-100';
    case 'System':
      return 'bg-green-100';
    default:
      return 'bg-green-100';
  }
};

// Get text color for notification type
const getNotificationTextColor = (type: NotificationType) => {
  switch (type) {
    case 'Crying':
      return 'text-blue-700';
    case 'Prone':
      return 'text-red-700';
    case 'Side':
      return 'text-amber-700';
    case 'NoBlanket':
      return 'text-purple-700';
    case 'System':
      return 'text-green-700';
    default:
      return 'text-green-700';
  }
};

// Format timestamp to display date and time
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return format(date, 'EEEE, MMMM d, yyyy • h:mm a');
};

export function NotificationDetailModal({
  visible,
  onClose,
  notification,
}: NotificationDetailModalProps) {
  const insets = useSafeAreaInsets();

  const { connections } = useDeviceHook();

  const getDeviceName = (deviceId: string) => {
    const device = connections.find((device) => device.deviceId === deviceId);
    return device ? device.name : 'Unknown Device';
  };

  if (!notification) return null;

  const renderTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'Crying':
        return t('history.crying.title');
      case 'Prone':
        return t('history.prone.title');
      case 'Side':
        return t('history.side.title');
      case 'NoBlanket':
        return t('history.noBlanket.title');
      case 'System':
        return t('history.system.title');
      default:
        return t('history.unknown.title');
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end ">
        <View
          className="h-[70%] rounded-t-3xl bg-white shadow-lg"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          {/* Header with close button */}
          <View className="mb-2 flex-row items-center justify-between border-b border-gray-100 p-6 pb-4">
            <Text className="text-xl font-bold text-gray-800">Notification Detail</Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Notification Detail Content */}
          <ScrollView className="flex-1 px-6">
            {/* Title and Time */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800">{notification.title}</Text>
              {notification.deviceId && (
                <Text className="mt-1 text-primary-600 font-medium">
                  Device: {getDeviceName(notification.deviceId)}
                </Text>
              )}
              <Text className="mt-1 text-sm text-gray-500">
                {new Date(notification.time).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            {/* Icon and Message */}
            <View className={`mb-6 rounded-xl p-4 ${getNotificationColor(notification.type)}`}>
              <View className="flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white">
                  {getNotificationIcon(notification.type)}
                </View>
                <View className="flex-1 ">
                  <Text className={`text-base font-semibold`}>{renderTitle(notification)}</Text>

                  {notification.duration !== undefined && (
                    <Text className="mt-1 text-sm text-gray-600">
                      Duration: {Number(notification.duration).toFixed(0)} {t('home.seconds')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            {/* Image Preview */}
            {notification.imageUrl ? (
              <View className="mb-6">
                <Text className="mb-2 text-base font-semibold text-gray-700">Captured Image</Text>
                <View className="overflow-hidden rounded-xl">
                  <Image
                    source={{ uri: notification.imageUrl }}
                    className="h-56 w-full"
                    contentFit="cover"
                    transition={300}
                    placeholder="Loading image..."
                  />
                </View>
              </View>
            ) : (
              <View className="mt-2  bg-slate-100 w-full aspect-video flex items-center justify-center rounded">
                <Text className="text-center text-sm text-gray-500">
                  Image captured at the time of the event
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <View className="border-t border-gray-100 p-6 pt-4">
            <TouchableOpacity onPress={onClose} className="w-full rounded-lg bg-primary-500 p-4">
              <Text className="text-center text-base font-semibold text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
