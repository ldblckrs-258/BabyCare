import { format } from 'date-fns';

// Notification types
export type NotificationType = 'crying' | 'prone' | 'side' | 'noblanket' | 'system';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: number | string | { toDate: () => Date }; // timestamp can be various formats
  read: boolean;
  imageUrl?: string; // Optional URL to the image captured during the event
  duration?: number; // Duration of the event in minutes
  deviceId?: string; // ID of the device that triggered the notification
}

// Helper function to safely convert any timestamp format to Date
export const safeTimestampToDate = (timestamp: any): Date => {
  try {
    // Handle Firebase Timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // Handle numeric timestamps (milliseconds since epoch)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }

    // Handle ISO string dates
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Fallback to current date if invalid
    console.warn('Invalid timestamp format:', timestamp);
    return new Date();
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return new Date();
  }
};

// Helper function to parse ISO string to Date object when needed
export const parseISODate = (isoString: string): Date => {
  const date = new Date(isoString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
};

// Helper function to group notifications by date
export const groupNotificationsByDate = (notifications: Notification[]) => {
  const grouped: Record<string, Notification[]> = {};

  notifications.forEach((notification) => {
    try {
      // Convert timestamp to Date safely
      const dateObj = safeTimestampToDate(notification.time);
      const date = format(dateObj, 'yyyy-MM-dd');

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notification);
    } catch (error) {
      console.error('Error grouping notification:', error, notification);
    }
  });

  // Sort each group by time (newest first)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      try {
        const dateA = safeTimestampToDate(a.time);
        const dateB = safeTimestampToDate(b.time);
        return dateB.getTime() - dateA.getTime();
      } catch (error) {
        console.error('Error sorting notifications:', error);
        return 0;
      }
    });
  });

  return grouped;
};

// Helper to format time as HH:MM AM/PM
export const formatTime = (timeValue: any) => {
  try {
    const date = safeTimestampToDate(timeValue);
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};
