import { FirestoreService } from './firestoreService';
import { DeviceEvent } from '@/stores/deviceStore';
import {
  Timestamp,
  collection,
  collectionGroup,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';

interface DeviceStatus {
  crying: {
    isDetected: boolean;
    timeStamp: string;
  };
  position: {
    status: 'supine' | 'prone' | 'side';
    timeStamp: string;
  };
  blanket: {
    isDetected: boolean;
    timeStamp: string;
  };
}

// Interface for the Today Overview statistics
export interface TodayOverviewData {
  badPositionData: {
    totalCount: number;
    totalMinutes: number;
    longestPeriod: string;
    longestDuration: number;
  };
  cryingData: {
    totalCount: number;
    totalMinutes: number;
    longestPeriod: string;
    longestDuration: number;
  };
}

// Interface for the Correlation Chart data point
export interface CorrelationDataPoint {
  value: number;
  label: string;
}

// Interface for statistical data
export interface StatisticsData {
  todayOverview: TodayOverviewData;
  badPositionHourlyData: number[];
  cryingHourlyData: number[];
  correlationData: {
    badPositionData: CorrelationDataPoint[];
    cryingData: CorrelationDataPoint[];
  };
}

/**
 * Service class for DeviceEvent-related Firebase operations
 */
export class DeviceEventService {
  private static firestoreService = FirestoreService.getInstance();

  /**
   * Fetch events for a specific device within the last week
   */
  static async getDeviceEventsForLastWeek(deviceId: string): Promise<DeviceEvent[]> {
    if (!deviceId) {
      console.warn('DeviceEventService.getDeviceEventsForLastWeek called without deviceId');
      return [];
    }

    // Create a date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
      const firestore = this.firestoreService.getFirestore();
      // Sử dụng subcollection events của device
      const eventsCol = collection(firestore, `devices/${deviceId}/events`);
      const q = query(
        eventsCol,
        where('time', '>=', Timestamp.fromDate(oneWeekAgo)),
        orderBy('time', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events: DeviceEvent[] = [];

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({
          id: doc.id,
          deviceId: deviceId, // Sử dụng deviceId từ tham số thay vì từ document
          type: eventData.type,
          time: eventData.time.toDate(),
        });
      });

      // Cache these events
      const cacheKey = FirestoreService.queryCacheKey(`devices/${deviceId}/events`, {
        from: oneWeekAgo.toISOString(),
      });
      this.firestoreService.setInCache(cacheKey, events);

      return events;
    } catch (err) {
      console.error('Error fetching device events:', err);
      return [];
    }
  }

  /**
   * Listen to device events in real-time
   * @returns Function to unsubscribe
   */
  static listenToDeviceEvents(
    deviceId: string,
    onUpdate: (status: DeviceStatus) => void
  ): () => void {
    if (!deviceId) {
      console.warn('DeviceEventService.listenToDeviceEvents called without deviceId');
      return () => {}; // No-op if no deviceId
    }

    // Create a date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const firestore = this.firestoreService.getFirestore();
    // Sử dụng subcollection events của device
    const eventsCol = collection(firestore, `devices/${deviceId}/events`);
    const q = query(
      eventsCol,
      where('time', '>=', Timestamp.fromDate(oneWeekAgo)),
      orderBy('time', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot) {
          console.warn('DeviceEventService: received null snapshot in listenToDeviceEvents');
          return;
        }

        const events: DeviceEvent[] = [];
        snapshot.docs.forEach((doc) => {
          const eventData = doc.data();
          events.push({
            id: doc.id,
            deviceId: deviceId, // Sử dụng deviceId từ tham số
            type: eventData.type,
            time: eventData.time.toDate(),
          });
        });

        // Calculate device status based on events
        const status = this.processDeviceEvents(events);
        onUpdate(status);

        // Cache events
        const cacheKey = FirestoreService.queryCacheKey(`devices/${deviceId}/events`, {
          from: oneWeekAgo.toISOString(),
        });
        this.firestoreService.setInCache(cacheKey, events);
      },
      (error) => {
        if ((error as any).code === 'firestore/permission-denied') {
          console.warn(
            'DeviceEventService: Permission denied in listenToDeviceEvents. User likely logged out.'
          );
          return;
        }
        console.error('DeviceEventService listener error:', error);
      }
    );
  }

  /**
   * Process device events to get the current status
   * This includes:
   * - Latest position event (Side/Prone/Supine)
   * - Latest crying event (Crying/NoCrying)
   * - Latest blanket event (Blanket/NoBlanket)
   */
  static processDeviceEvents(events: DeviceEvent[]): DeviceStatus {
    // Default status
    const status: DeviceStatus = {
      crying: {
        isDetected: false,
        timeStamp: new Date().toISOString(),
      },
      position: {
        status: 'supine',
        timeStamp: new Date().toISOString(),
      },
      blanket: {
        isDetected: true,
        timeStamp: new Date().toISOString(),
      },
    };

    if (!events || events.length === 0) {
      return status;
    }

    // Find latest position event
    const positionEvents = events.filter(
      (event) => event.type === 'Side' || event.type === 'Prone' || event.type === 'Supine'
    );

    if (positionEvents.length > 0) {
      // Sort by time (newest first)
      positionEvents.sort((a, b) => b.time.getTime() - a.time.getTime());
      const latestPositionEvent = positionEvents[0];

      status.position.timeStamp = latestPositionEvent.time.toISOString();

      if (latestPositionEvent.type === 'Side') {
        status.position.status = 'side';
      } else if (latestPositionEvent.type === 'Prone') {
        status.position.status = 'prone';
      } else {
        status.position.status = 'supine';
      }
    }

    // Find latest crying event
    const cryingEvents = events.filter(
      (event) => event.type === 'Crying' || event.type === 'NoCrying'
    );

    if (cryingEvents.length > 0) {
      // Sort by time (newest first)
      cryingEvents.sort((a, b) => b.time.getTime() - a.time.getTime());
      const latestCryingEvent = cryingEvents[0];

      status.crying.timeStamp = latestCryingEvent.time.toISOString();
      status.crying.isDetected = latestCryingEvent.type === 'Crying';
    }

    // Find latest blanket event
    const blanketEvents = events.filter(
      (event) => event.type === 'Blanket' || event.type === 'NoBlanket'
    );

    if (blanketEvents.length > 0) {
      // Sort by time (newest first)
      blanketEvents.sort((a, b) => b.time.getTime() - a.time.getTime());
      const latestBlanketEvent = blanketEvents[0];

      status.blanket.timeStamp = latestBlanketEvent.time.toISOString();
      status.blanket.isDetected = latestBlanketEvent.type === 'Blanket';
    }

    return status;
  }

  /**
   * Get the latest device status from events
   */
  static async getDeviceStatus(deviceId: string): Promise<DeviceStatus> {
    const events = await this.getDeviceEventsForLastWeek(deviceId);
    return this.processDeviceEvents(events);
  }

  /**
   * Get the latest event of a specific type
   */
  static async getLatestEventByType(
    deviceId: string,
    eventTypes: DeviceEvent['type'][]
  ): Promise<DeviceEvent | null> {
    if (!deviceId || !eventTypes || eventTypes.length === 0) {
      return null;
    }

    try {
      const firestore = this.firestoreService.getFirestore();
      // Sử dụng subcollection events của device
      const eventsCol = collection(firestore, `devices/${deviceId}/events`);
      const q = query(
        eventsCol,
        where('type', 'in', eventTypes),
        orderBy('time', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const eventData = doc.data();

      return {
        id: doc.id,
        deviceId: deviceId, // Sử dụng deviceId từ tham số
        type: eventData.type,
        time: eventData.time.toDate(),
      };
    } catch (err) {
      console.error('Error fetching latest event by type:', err);
      return null;
    }
  }

  /**
   * Process events to generate statistics for UI display
   * @param deviceId Device ID to get statistics for
   * @returns Statistics data for display in charts and overviews
   */
  static async getStatisticsData(deviceId: string): Promise<StatisticsData> {
    // Get all events from the past week
    const events = await this.getDeviceEventsForLastWeek(deviceId);

    // Get today's date at midnight for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Default return structure with empty data
    const statistics: StatisticsData = {
      todayOverview: {
        badPositionData: {
          totalCount: 0,
          totalMinutes: 0,
          longestPeriod: '-',
          longestDuration: 0,
        },
        cryingData: {
          totalCount: 0,
          totalMinutes: 0,
          longestPeriod: '-',
          longestDuration: 0,
        },
      },
      badPositionHourlyData: Array(8).fill(0), // 8 3-hour periods
      cryingHourlyData: Array(8).fill(0), // 8 3-hour periods
      correlationData: {
        badPositionData: [],
        cryingData: [],
      },
    };

    if (!events || events.length === 0) {
      return statistics;
    }

    // Separate events by type
    const badPositionEvents = events.filter(
      (event) => event.type === 'Side' || event.type === 'Prone'
    );
    const cryingEvents = events.filter((event) => event.type === 'Crying');

    // Generate today's statistics
    statistics.todayOverview = this.generateTodayOverview(
      badPositionEvents.filter((event) => event.time >= today),
      cryingEvents.filter((event) => event.time >= today)
    );

    // Generate hourly statistics for the past 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    statistics.badPositionHourlyData = this.generateHourlyData(
      badPositionEvents.filter((event) => event.time >= yesterday),
      8 // 8 3-hour periods
    );

    statistics.cryingHourlyData = this.generateHourlyData(
      cryingEvents.filter((event) => event.time >= yesterday),
      8 // 8 3-hour periods
    );

    // Generate weekly correlation data
    statistics.correlationData = this.generateCorrelationData(badPositionEvents, cryingEvents);

    return statistics;
  }

  /**
   * Generate today's overview statistics including counts, total time, and longest periods
   */
  private static generateTodayOverview(
    badPositionEvents: DeviceEvent[],
    cryingEvents: DeviceEvent[]
  ): TodayOverviewData {
    const overview: TodayOverviewData = {
      badPositionData: {
        totalCount: badPositionEvents.length,
        totalMinutes: 0,
        longestPeriod: '-',
        longestDuration: 0,
      },
      cryingData: {
        totalCount: cryingEvents.length,
        totalMinutes: 0,
        longestPeriod: '-',
        longestDuration: 0,
      },
    };

    // Process bad position events
    if (badPositionEvents.length > 0) {
      // Calculate total duration by assuming each event lasts until the next 'Supine' event or 5 minutes max
      let totalDurationMs = 0;
      let longestDurationMs = 0;
      let longestPeriodStart: Date | null = null;
      let longestPeriodEnd: Date | null = null;

      // Sort by time (ascending)
      const sortedEvents = [...badPositionEvents].sort(
        (a, b) => a.time.getTime() - b.time.getTime()
      );

      // Find segments of consecutive bad position events
      let segmentStart: Date | null = null;

      for (let i = 0; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];

        if (!segmentStart) {
          segmentStart = event.time;
        }

        // Calculate end of this segment
        const segmentEnd =
          i < sortedEvents.length - 1
            ? sortedEvents[i + 1].time
            : new Date(Math.min(event.time.getTime() + 5 * 60 * 1000, Date.now())); // 5 minutes max or now

        const segmentDuration = segmentEnd.getTime() - segmentStart.getTime();
        totalDurationMs += segmentDuration;

        if (segmentDuration > longestDurationMs) {
          longestDurationMs = segmentDuration;
          longestPeriodStart = segmentStart;
          longestPeriodEnd = segmentEnd;
        }

        // Check if this is the end of a segment
        if (
          i === sortedEvents.length - 1 ||
          sortedEvents[i + 1].time.getTime() - event.time.getTime() > 5 * 60 * 1000
        ) {
          segmentStart = null;
        }
      }

      // Update the overview data
      overview.badPositionData.totalMinutes = parseFloat(
        (totalDurationMs / (60 * 1000)).toFixed(1)
      );
      overview.badPositionData.longestDuration = Math.ceil(longestDurationMs / (60 * 1000));

      if (longestPeriodStart && longestPeriodEnd) {
        const formatTime = (date: Date) => {
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        overview.badPositionData.longestPeriod = `${formatTime(longestPeriodStart)} - ${formatTime(longestPeriodEnd)}`;
      }
    }

    // Process crying events - similar approach
    if (cryingEvents.length > 0) {
      let totalDurationMs = 0;
      let longestDurationMs = 0;
      let longestPeriodStart: Date | null = null;
      let longestPeriodEnd: Date | null = null;

      // Sort by time (ascending)
      const sortedEvents = [...cryingEvents].sort((a, b) => a.time.getTime() - b.time.getTime());

      // Find segments of consecutive crying events
      let segmentStart: Date | null = null;

      for (let i = 0; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];

        if (!segmentStart) {
          segmentStart = event.time;
        }

        // Calculate end of this segment
        const segmentEnd =
          i < sortedEvents.length - 1
            ? sortedEvents[i + 1].time
            : new Date(Math.min(event.time.getTime() + 5 * 60 * 1000, Date.now())); // 5 minutes max or now

        const segmentDuration = segmentEnd.getTime() - segmentStart.getTime();
        totalDurationMs += segmentDuration;

        if (segmentDuration > longestDurationMs) {
          longestDurationMs = segmentDuration;
          longestPeriodStart = segmentStart;
          longestPeriodEnd = segmentEnd;
        }

        // Check if this is the end of a segment
        if (
          i === sortedEvents.length - 1 ||
          sortedEvents[i + 1].time.getTime() - event.time.getTime() > 5 * 60 * 1000
        ) {
          segmentStart = null;
        }
      }

      // Update the overview data
      overview.cryingData.totalMinutes = parseFloat((totalDurationMs / (60 * 1000)).toFixed(1));
      overview.cryingData.longestDuration = Math.ceil(longestDurationMs / (60 * 1000));

      if (longestPeriodStart && longestPeriodEnd) {
        const formatTime = (date: Date) => {
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        overview.cryingData.longestPeriod = `${formatTime(longestPeriodStart)} - ${formatTime(longestPeriodEnd)}`;
      }
    }

    return overview;
  }

  /**
   * Generate hourly data for the past 24 hours
   * Divides the day into specified number of periods (default 8, each 3 hours)
   */
  private static generateHourlyData(events: DeviceEvent[], periods: number = 8): number[] {
    if (events.length === 0) {
      return Array(periods).fill(0);
    }

    const result = Array(periods).fill(0);
    const hoursPerPeriod = 24 / periods;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Group events by hour period
    events.forEach((event) => {
      if (event.time >= yesterday && event.time <= now) {
        // Calculate which period this event belongs to
        const hoursSinceMidnight = event.time.getHours() + event.time.getMinutes() / 60;
        const periodIndex = Math.floor(hoursSinceMidnight / hoursPerPeriod);

        // Ensure index is within bounds (should be 0-7 for 8 periods)
        if (periodIndex >= 0 && periodIndex < periods) {
          // Increment by an estimated duration (assuming each event represents ~3 minutes of activity)
          result[periodIndex] += 3;
        }
      }
    });

    return result;
  }

  /**
   * Generate correlation data for the past week
   * Creates data points for each day of the week showing bad position and crying totals
   */
  private static generateCorrelationData(
    badPositionEvents: DeviceEvent[],
    cryingEvents: DeviceEvent[]
  ): { badPositionData: CorrelationDataPoint[]; cryingData: CorrelationDataPoint[] } {
    const badPositionData: CorrelationDataPoint[] = [];
    const cryingData: CorrelationDataPoint[] = [];

    // Generate data for the past 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      // Format date as dd/MM
      const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      // Count events for this day
      const badPositionCount =
        badPositionEvents.filter((event) => event.time >= date && event.time < nextDay).length * 5; // Multiply by estimated minutes per event

      const cryingCount =
        cryingEvents.filter((event) => event.time >= date && event.time < nextDay).length * 5; // Multiply by estimated minutes per event

      badPositionData.push({ value: badPositionCount, label });
      cryingData.push({ value: cryingCount, label });
    }

    return { badPositionData, cryingData };
  }
}
