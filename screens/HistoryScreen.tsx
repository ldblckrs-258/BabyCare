import { NotificationDetailModal } from '@/components/modals/NotificationDetailModal';
import { NotificationModal } from '@/components/modals/NotificationModal';
import { useDeviceHook } from '@/lib/hooks';
import { useTranslation } from '@/lib/hooks/useTranslation';
import {
  Notification,
  NotificationType,
  formatTime,
  groupNotificationsByDate,
  parseISODate,
} from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format, isToday, isYesterday } from 'date-fns';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'crying':
      return <Ionicons name="water" size={20} color="#5d97d3" />;
    case 'prone':
      return <FontAwesome6 name="baby" size={20} color="#d26165" />;
    case 'side':
      return <FontAwesome6 name="baby" size={20} color="#d97706" />;
    case 'noblanket':
      return <FontAwesome6 name="bed" size={16} color="#a855f7" />;
    case 'system':
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
    default:
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
  }
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);

  const { user } = useAuthStore();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    isLoading,
    error,
    subscribeToNotifications,
    deleteAll,
  } = useNotificationStore();
  const { connections } = useDeviceHook();

  // Subscribe to notifications when component mounts
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToNotifications(user.uid);
      return () => unsubscribe();
    }
  }, [user, subscribeToNotifications]);

  // Handle notification read and show detail modal
  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      // Mark as read if needed
      if (!notification.read) {
        markAsRead(notification.id);
      }
      // Show notification detail
      setSelectedNotification(notification);
      setShowNotificationDetail(true);
    },
    [markAsRead]
  );

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications);
  const dateKeys = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Determine if we have any unread notifications
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = parseISODate(dateString);

    if (isToday(date)) {
      return t('history.today');
    } else if (isYesterday(date)) {
      return t('history.yesterday');
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const renderTitle = (notification: Notification) => {
    let title = `[${
      connections.find((device) => device.deviceId === notification.deviceId)?.name || 'Unknown'
    }]`;
    switch (notification.type) {
      case 'crying':
        title += ` ${t('history.crying.title')}`;
        break;
      case 'prone':
        title += ` ${t('history.prone.title')}`;
        break;
      case 'side':
        title += ` ${t('history.side.title')}`;
        break;
      case 'noblanket':
        title += ` ${t('history.noBlanket.title')}`;
        break;
      case 'system':
        title += ` ${t('history.system.title')}`;
        break;
      default:
        title += ` ${t('history.unknown.title')}`;
        break;
    }
    return title;
  };

  const renderDescription = (notification: Notification) => {
    let description = '';
    switch (notification.type) {
      case 'crying':
        description = t('history.crying.description');
        break;
      case 'prone':
        description = t('history.prone.description');
        break;
      case 'side':
        description = t('history.side.description');
        break;
      case 'noblanket':
        description = t('history.noBlanket.description');
        break;
      case 'system':
        description = t('history.system.description');
        break;
      default:
        description = t('history.unknown.description');
        break;
    }
    description += ` ${Math.round(Number(notification.duration))} `;
    description += t('home.seconds');
    return description;
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      className={` relative mb-3 rounded-xl ${item.read ? 'bg-white' : ' border border-primary-200 bg-primary-50'}`}>
      <View className="flex-row items-center p-4">
        <View
          className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${item.read ? 'bg-gray-100' : 'bg-white'}`}>
          {getNotificationIcon(item.type)}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{renderTitle(item)}</Text>
          <Text className="text-sm text-gray-600">{renderDescription(item)}</Text>
          <Text className="inline-block text-xs text-gray-400">{formatTime(item.time)}</Text>
        </View>
        {!item.read && (
          <View className="absolute right-3 top-3 h-3 w-3 rounded-full bg-primary-500" />
        )}
      </View>
    </TouchableOpacity>
  );

  // Render section header (date)
  const renderSectionHeader = (date: string) => (
    <View className="mb-2 mt-6 flex-row items-center">
      <View className="mr-2 h-px w-4 bg-gray-200" />
      <Text className="text-sm font-medium text-gray-500">{formatDate(date)}</Text>
      <View className="ml-2 h-px flex-1 bg-gray-200" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-2xl font-bold text-primary-600">{t('history.allEvents')}</Text>
        <View className="flex-row">
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={() => deleteAll()}
              className="mr-3 h-10 w-10 items-center justify-center">
              <MaterialIcons name="delete" size={24} color="#888" />
            </TouchableOpacity>
          )}
          {hasUnreadNotifications && (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              className="mr-3 h-10 w-10 items-center justify-center">
              <MaterialIcons name="done-all" size={24} color="#888" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowNotificationSettings(true)}
            className="h-10 w-10 items-center justify-center">
            <MaterialIcons name="settings" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification list */}
      <View className="flex-1 px-5">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3d8d7a" />
            <Text className="mt-4 text-gray-600">{t('history.loading')}</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="error-outline" size={64} color="#ef4444" />
            <Text className="mt-4 text-lg font-medium text-gray-600">{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="notifications-none" size={64} color="#ccc" />
            <Text className="mt-4 text-lg font-medium text-gray-600">
              {t('history.noNotifications')}
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              {t('history.notificationsWillAppearHere')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={dateKeys}
            keyExtractor={(item) => item}
            renderItem={({ item: date }) => (
              <View>
                {renderSectionHeader(date)}
                {groupedNotifications[date].map((notification) => (
                  <View key={notification.id}>
                    {renderNotificationItem({ item: notification })}
                  </View>
                ))}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Notification Settings Modal */}
      <NotificationModal
        visible={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        visible={showNotificationDetail}
        onClose={() => setShowNotificationDetail(false)}
        notification={selectedNotification}
      />
    </SafeAreaView>
  );
}
