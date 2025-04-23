import { Notification, NotificationType, formatTime } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
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
    case 'crying':
      return <Ionicons name="water" size={26} color="#5d97d3" />;
    case 'prone':
      return <FontAwesome6 name="baby" size={26} color="#d26165" />;
    case 'side':
      return <FontAwesome6 name="baby" size={26} color="#d97706" />;
    case 'noBlanket':
      return <FontAwesome6 name="bed" size={20} color="#a855f7" />;
    case 'system':
      return <MaterialIcons name="notifications" size={28} color="#3d8d7a" />;
    default:
      return <MaterialIcons name="notifications" size={28} color="#3d8d7a" />;
  }
};

// Get background color for notification type
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'crying':
      return 'bg-blue-100';
    case 'prone':
      return 'bg-red-100';
    case 'side':
      return 'bg-amber-100';
    case 'noBlanket':
      return 'bg-purple-100';
    case 'system':
      return 'bg-green-100';
    default:
      return 'bg-green-100';
  }
};

// Get text color for notification type
const getNotificationTextColor = (type: NotificationType) => {
  switch (type) {
    case 'crying':
      return 'text-blue-700';
    case 'prone':
      return 'text-red-700';
    case 'side':
      return 'text-amber-700';
    case 'noBlanket':
      return 'text-purple-700';
    case 'system':
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

  if (!notification) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end ">
        <View
          className="h-4/5 rounded-t-3xl bg-white shadow-lg"
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
            <View className="mb-6 mt-2">
              <Text className="text-xl font-bold text-gray-800">{notification.title}</Text>
              {notification.deviceName && (
                <Text className="mt-1 text-sm text-primary-600 font-medium">
                  Device: {notification.deviceName}
                </Text>
              )}
              <Text className="mt-1 text-sm text-gray-500">
                {formatTimestamp(notification.timestamp)}
              </Text>
            </View>
            {/* Icon and Message */}
            <View className={`mb-6 rounded-xl p-4 ${getNotificationColor(notification.type)}`}>
              <View className="flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white">
                  {getNotificationIcon(notification.type)}
                </View>
                <View className="flex-1">
                  <Text className={`text-base ${getNotificationTextColor(notification.type)}`}>
                    {notification.message}
                  </Text>

                  {notification.duration !== undefined && (
                    <Text className="mt-1 text-sm text-gray-600">
                      Duration: {notification.duration}
                      {notification.duration === 1 ? 'minute' : 'minutes'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            {/* Image Preview */}
            {notification.imageUrl && (
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
                <View className="mt-2  bg-slate-200 w-full aspect-video flex items-center justify-center rounded">
                  <Text className="text-center text-sm text-gray-500">
                    Image captured at the time of the event
                  </Text>
                </View>
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
