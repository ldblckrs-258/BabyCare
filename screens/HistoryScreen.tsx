import { NotificationDetailModal } from '@/components/modals/NotificationDetailModal';
import { NotificationModal } from '@/components/modals/NotificationModal';
import { TestNotificationModal } from '@/components/modals/TestNotificationModal';
import { useTranslation } from '@/lib/hooks/useTranslation';
import {
  Notification,
  NotificationType,
  formatTime,
  groupNotificationsByDate,
  parseISODate,
} from '@/lib/notifications';
import { useSettingsStore } from '@/stores/settingsStore';
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
    case 'noBlanket':
      return <FontAwesome6 name="bed" size={20} color="#a855f7" />;
    case 'system':
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
    default:
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
  }
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);
  const [showTestNotificationModal, setShowTestNotificationModal] = useState(false);
  const {
    userNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useSettingsStore();

  // Load initial notifications
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  // Handle notification read and show detail modal
  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      // Mark as read if needed
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
      // Show notification detail
      setSelectedNotification(notification);
      setShowNotificationDetail(true);
    },
    [markNotificationAsRead]
  );

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(userNotifications);
  const dateKeys = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

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
          <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-600">
            {item.message}
            <Text className="mt-1 inline-block text-xs text-gray-400">
              {formatTime(item.timestamp)}
            </Text>
          </Text>
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

  // Determine if we have any unread notifications
  const hasUnreadNotifications = userNotifications.some((notification) => !notification.read);

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-2xl font-bold text-primary-600">{t('history.allEvents')}</Text>
        <View className="flex-row">
          {hasUnreadNotifications && (
            <TouchableOpacity
              onPress={() => markAllNotificationsAsRead()}
              className="mr-3 h-10 w-10 items-center justify-center">
              <MaterialIcons name="done-all" size={24} color="#888" />
            </TouchableOpacity>
          )}
          {userNotifications.length > 0 && (
            <TouchableOpacity
              onPress={() => clearNotifications()}
              className="mr-3 h-10 w-10 items-center justify-center">
              <MaterialIcons name="delete-sweep" size={24} color="#888" />
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
        ) : userNotifications.length === 0 ? (
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
        <TouchableOpacity
          onPress={() => setShowTestNotificationModal(true)}
          className="mb-10 rounded-lg bg-primary-500 px-5 py-3 mx-28 ">
          <Text className="text-base font-medium text-white text-center">Test Notifications</Text>
        </TouchableOpacity>
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

      {/* Test Notification Modal (DEV ONLY) */}
      <TestNotificationModal
        visible={showTestNotificationModal}
        onClose={() => setShowTestNotificationModal(false)}
      />
    </SafeAreaView>
  );
}
