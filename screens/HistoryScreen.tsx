import { NotificationModal } from '@/components/modals/NotificationModal';
import { useTranslation } from '@/lib/hooks/useTranslation';
import {
  Notification,
  NotificationType,
  formatTime,
  generateMoreNotifications,
  groupNotificationsByDate,
  staticNotifications,
} from '@/lib/notifications';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format, isToday, isYesterday } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'cry_alert':
      return <FontAwesome6 name="baby" size={20} color="#5d97d3" />;
    case 'position_alert':
      return <FontAwesome6 name="bed" size={16} color="#d26165" />;
    case 'daily_report':
      return <MaterialIcons name="assessment" size={22} color="#a855f7" />;
    case 'system':
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
    default:
      return <MaterialIcons name="notifications" size={22} color="#3d8d7a" />;
  }
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Load initial notifications
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(staticNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    // Simulate API call
    setTimeout(() => {
      const moreNotifications = generateMoreNotifications(page);
      setNotifications((prev) => [...prev, ...moreNotifications]);
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 1000);
  }, [isLoadingMore, page]);

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications);
  const dateKeys = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

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
      className={` relative mb-3 rounded-xl ${item.read ? 'bg-white' : ' border border-primary-200 bg-primary-50'}`}>
      <View className="flex-row items-center p-4">
        <View
          className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${item.read ? 'bg-gray-100' : 'bg-white'}`}>
          {getNotificationIcon(item.type)}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-600">
            {item.message}{' '}
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

  // Render footer (load more indicator)
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color="#3d8d7a" />
        <Text className="mt-2 text-sm text-gray-500">{t('history.loadingMore')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      {showNotificationSettings && (
        <View
          className="absolute inset-0 z-10 bg-black/50"
          style={{ height: '100%', width: '100%' }}
        />
      )}
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-5 py-4">
        <Text className="text-2xl font-bold text-primary-600">{t('history.allEvents')}</Text>
        <TouchableOpacity
          onPress={() => setShowNotificationSettings(true)}
          className="h-10 w-10 items-center justify-center">
          <MaterialIcons name="settings" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Notification list */}
      <View className="flex-1 px-5">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3d8d7a" />
            <Text className="mt-4 text-gray-600">{t('history.loading')}</Text>
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
            onEndReached={loadMoreNotifications}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Notification Settings Modal */}
      <NotificationModal
        visible={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </SafeAreaView>
  );
}
