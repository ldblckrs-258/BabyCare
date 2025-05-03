import { format } from 'date-fns';

// Notification types
export type NotificationType = 'Crying' | 'Prone' | 'Side' | 'NoBlanket' | 'System';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: number; // timestamp in milliseconds
  read: boolean;
  imageUrl?: string; // Optional URL to the image captured during the event
  duration?: number; // Duration of the event in minutes
  deviceId?: string; // ID of the device that triggered the notification
}

// Helper function to parse ISO string to Date object when needed
export const parseISODate = (isoString: string): Date => {
  const date = new Date(isoString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string detected, using current date as fallback');
    return new Date();
  }
  return date;
};

// Helper function to group notifications by date
export const groupNotificationsByDate = (notifications: Notification[]) => {
  const grouped: Record<string, Notification[]> = {};

  notifications.forEach((notification) => {
    // Parse the ISO string to get date components
    const dateObj = new Date(notification.time);
    const date = format(dateObj, 'yyyy-MM-dd');

    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(notification);
  });

  // Sort each group by time (newest first)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return dateB.getTime() - dateA.getTime();
    });
  });

  return grouped;
};

// Helper to format time as HH:MM AM/PM
export const formatTime = (isoString: string) => {
  // Parse the ISO string to a Date object
  const date = parseISODate(isoString);
  return format(date, 'h:mm a');
};
