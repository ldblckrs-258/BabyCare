import { format } from 'date-fns';

// Notification types
export type NotificationType = 'cry_alert' | 'position_alert' | 'daily_report' | 'system';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Static data for notifications
export const staticNotifications: Notification[] = [
  // Today
  {
    id: 'notification-1',
    type: 'cry_alert',
    title: 'Cry Alert',
    message: 'Baby is crying for more than 5 minutes.',
    timestamp: new Date(2025, 2, 26, 10, 15), // March 26, 2025 10:15 AM
    read: false,
  },
  {
    id: 'notification-2',
    type: 'system',
    title: 'System Notification',
    message: 'Device battery is low. Please charge your device.',
    timestamp: new Date(2025, 2, 26, 9, 30), // March 26, 2025 9:30 AM
    read: true,
  },

  // Yesterday
  {
    id: 'notification-3',
    type: 'position_alert',
    title: 'Sleep Position Alert',
    message: 'Baby is sleeping in an unsafe position.',
    timestamp: new Date(2025, 2, 25, 22, 45), // March 25, 2025 10:45 PM
    read: true,
  },
  {
    id: 'notification-4',
    type: 'cry_alert',
    title: 'Cry Alert',
    message: 'Baby is crying for more than 2 minutes.',
    timestamp: new Date(2025, 2, 25, 16, 20), // March 25, 2025 4:20 PM
    read: true,
  },

  // 2 days ago
  {
    id: 'notification-5',
    type: 'daily_report',
    title: 'Daily Report',
    message: "Daily summary of your baby's activities and well-being.",
    timestamp: new Date(2025, 2, 24, 20, 0), // March 24, 2025 8:00 PM
    read: true,
  },

  // 3 days ago
  {
    id: 'notification-6',
    type: 'position_alert',
    title: 'Sleep Position Alert',
    message: 'Baby is sleeping in an unsafe position for more than 2 minutes.',
    timestamp: new Date(2025, 2, 23, 14, 10), // March 23, 2025 2:10 PM
    read: false,
  },

  // 4 days ago
  {
    id: 'notification-7',
    type: 'system',
    title: 'System Notification',
    message: 'Device firmware update available.',
    timestamp: new Date(2025, 2, 22, 9, 5), // March 22, 2025 9:05 AM
    read: true,
  },

  // 5 days ago
  {
    id: 'notification-8',
    type: 'cry_alert',
    title: 'Cry Alert',
    message: 'Baby is crying for more than 10 minutes.',
    timestamp: new Date(2025, 2, 21, 3, 25), // March 21, 2025 3:25 AM
    read: true,
  },

  // 6 days ago
  {
    id: 'notification-9',
    type: 'daily_report',
    title: 'Daily Report',
    message: "Daily summary of your baby's activities and well-being.",
    timestamp: new Date(2025, 2, 20, 20, 0), // March 20, 2025 8:00 PM
    read: true,
  },

  // 1 week ago
  {
    id: 'notification-10',
    type: 'position_alert',
    title: 'Sleep Position Alert',
    message: 'Baby is sleeping in an unsafe position.',
    timestamp: new Date(2025, 2, 19, 13, 40), // March 19, 2025 1:40 PM
    read: true,
  },
];

// Generate more notifications for paginated loading
export const generateMoreNotifications = (
  page: number,
  itemsPerPage: number = 10
): Notification[] => {
  const result: Notification[] = [];
  const types: NotificationType[] = ['cry_alert', 'position_alert', 'daily_report', 'system'];
  const titles = {
    cry_alert: 'Cry Alert',
    position_alert: 'Sleep Position Alert',
    daily_report: 'Daily Report',
    system: 'System Notification',
  };
  const messages = {
    cry_alert: 'Baby is crying for more than 5 minutes.',
    position_alert: 'Baby is sleeping in an unsafe position.',
    daily_report: "Daily summary of your baby's activities and well-being.",
    system: 'Device battery is low. Please charge your device.',
  };

  const baseDate = new Date(2025, 2, 19); // March 19, 2025

  for (let i = 0; i < itemsPerPage; i++) {
    const offset = page * itemsPerPage + i;
    const type = types[offset % types.length];

    // Create a date that goes further back in time as we load more pages
    const daysBack = 7 + Math.floor(offset / 4); // Every 4 items, go back one more day
    const notificationDate = new Date(baseDate);
    notificationDate.setDate(baseDate.getDate() - daysBack);

    // Random time
    notificationDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    result.push({
      id: `notification-paginated-${page}-${i}`, // Ensure unique IDs
      type,
      title: titles[type],
      message: messages[type],
      timestamp: notificationDate,
      read: Math.random() > 0.2, // 80% chance to be read
    });
  }

  return result;
};

// Helper function to group notifications by date
export const groupNotificationsByDate = (notifications: Notification[]) => {
  const grouped: Record<string, Notification[]> = {};

  notifications.forEach((notification) => {
    const date = format(notification.timestamp, 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(notification);
  });

  // Sort each group by time (newest first)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });

  return grouped;
};

// Helper to format time as HH:MM AM/PM
export const formatTime = (date: Date) => {
  return format(date, 'h:mm a');
};
