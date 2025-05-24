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
   * @param deviceId The device ID to fetch events for
   * @param forceFresh Whether to bypass cache and fetch fresh data
   */
  static async getDeviceEventsForLastWeek(
    deviceId: string,
    forceFresh: boolean = false
  ): Promise<DeviceEvent[]> {
    if (!deviceId) {
      console.warn('DeviceEventService.getDeviceEventsForLastWeek called without deviceId');
      return [];
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 7);

    // Check cache first
    const cacheKey = FirestoreService.queryCacheKey(`devices/${deviceId}/events`, {
      from: threeDaysAgo.toISOString(),
    });

    const cachedData = this.firestoreService.getFromCache<{
      events: DeviceEvent[];
      timestamp: number;
      expiration: number;
    }>(cacheKey);

    // If we have cached data and it hasn't expired (within 1 minute), use it
    // Reduced from 15 minutes to 1 minute for more frequent updates
    if (!forceFresh && cachedData && cachedData.expiration > Date.now()) {
      return cachedData.events;
    }

    try {
      const firestore = this.firestoreService.getFirestore();
      const eventsCol = collection(firestore, `devices/${deviceId}/events`);
      const q = query(
        eventsCol,
        where('time', '>=', Timestamp.fromDate(threeDaysAgo)),
        orderBy('time', 'desc'),
        limit(100) // Limit to 100 most recent events to reduce data transfer
      );

      const querySnapshot = await getDocs(q);
      const events: DeviceEvent[] = [];

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({
          id: doc.id,
          deviceId: deviceId,
          type: eventData.type,
          time: eventData.time.toDate(),
        });
      });

      // Cache these events with 1 minute expiration (reduced from 15 minutes)
      const cacheExpiration = Date.now() + 1 * 60 * 1000;
      this.firestoreService.setInCache(cacheKey, {
        events,
        timestamp: Date.now(),
        expiration: cacheExpiration,
      });

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

    // Create a date for one day ago (changed from one week to reduce data volume)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Cache key for this query
    const cacheKey = FirestoreService.queryCacheKey(`devices/${deviceId}/events`, {
      from: oneDayAgo.toISOString(),
    });

    // Check if we have recent cached data first
    const cachedEvents = this.firestoreService.getFromCache<{
      events: DeviceEvent[];
      timestamp: number;
      expiration: number;
    }>(cacheKey);

    // If we have cached data and it hasn't expired (within 5 minutes), use it first
    if (cachedEvents && cachedEvents.expiration > Date.now()) {
      const status = this.processDeviceEvents(cachedEvents.events);
      // Use cached data immediately
      setTimeout(() => onUpdate(status), 0);
    }

    const firestore = this.firestoreService.getFirestore();
    // Use subcollection events of device with limited query
    const eventsCol = collection(firestore, `devices/${deviceId}/events`);
    const q = query(
      eventsCol,
      where('time', '>=', Timestamp.fromDate(oneDayAgo)),
      orderBy('time', 'desc'),
      limit(50) // Limit the number of events returned
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
            deviceId: deviceId,
            type: eventData.type,
            time: eventData.time.toDate(),
          });
        });

        const status = this.processDeviceEvents(events);
        onUpdate(status);

        // Cache events with expiration time (5 minutes)
        const cacheExpiration = Date.now() + 5 * 60 * 1000;
        this.firestoreService.setInCache(cacheKey, {
          events,
          timestamp: Date.now(),
          expiration: cacheExpiration,
        });
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
      (event) =>
        event.type.toLowerCase() === 'side' ||
        event.type.toLowerCase() === 'prone' ||
        event.type.toLowerCase() === 'supine'
    );

    if (positionEvents.length > 0) {
      // Sort by time (newest first)
      positionEvents.sort((a, b) => b.time.getTime() - a.time.getTime());

      const latestPositionEvent = positionEvents[0];

      status.position.timeStamp = latestPositionEvent.time.toISOString();

      if (latestPositionEvent.type === 'side') {
        status.position.status = 'side';
      } else if (latestPositionEvent.type === 'prone') {
        status.position.status = 'prone';
      } else {
        status.position.status = 'supine';
      }
    }

    // Find latest crying event
    const cryingEvents = events.filter(
      (event) => event.type === 'crying' || event.type === 'nocrying'
    );

    if (cryingEvents.length > 0) {
      // Sort by time (newest first)
      cryingEvents.sort((a, b) => b.time.getTime() - a.time.getTime());

      const latestCryingEvent = cryingEvents[0];

      status.crying.timeStamp = latestCryingEvent.time.toISOString();
      status.crying.isDetected = latestCryingEvent.type === 'crying';
    }

    // Find latest blanket event
    const blanketEvents = events.filter(
      (event) => event.type === 'blanket' || event.type === 'noblanket'
    );

    if (blanketEvents.length > 0) {
      // Sort by time (newest first)
      blanketEvents.sort((a, b) => b.time.getTime() - a.time.getTime());

      const latestBlanketEvent = blanketEvents[0];

      status.blanket.timeStamp = latestBlanketEvent.time.toISOString();
      status.blanket.isDetected = latestBlanketEvent.type === 'blanket';
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
   * @param forceFresh Whether to bypass cache and fetch fresh data
   * @returns Statistics data for display in charts and overviews
   */
  static async getStatisticsData(
    deviceId: string,
    forceFresh: boolean = false
  ): Promise<StatisticsData> {
    // Check cache first for statistics data
    const statsCacheKey = FirestoreService.queryCacheKey(`devices/${deviceId}/statistics`, {
      date: new Date().toISOString().split('T')[0], // Cache by day
    });

    const cachedStats = this.firestoreService.getFromCache<{
      data: StatisticsData;
      timestamp: number;
      expiration: number;
    }>(statsCacheKey);

    // Reduced cache expiration to 2 minutes instead of 30 minutes
    // This ensures we get fresher data more frequently
    const cacheExpiration = 2 * 60 * 1000; // 2 minutes

    // If we have cached stats and they're not expired (2 minutes), use them
    if (!forceFresh && cachedStats && cachedStats.expiration > Date.now()) {
      return cachedStats.data;
    }

    // Get all events - force from Firestore by skipping cache
    const events = await this.getDeviceEventsForLastWeek(deviceId, forceFresh);

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

    const allPositionEvents = events.filter(
      (event) => event.type === 'prone' || event.type === 'supine'
    );

    // Get all crying events including 'nocrying' for all calculations
    const allCryingEvents = events.filter(
      (event) => event.type === 'crying' || event.type === 'nocrying'
    );

    // Generate today's statistics using all events for accurate durations
    statistics.todayOverview = this.generateTodayOverview(
      allPositionEvents.filter((event) => event.time >= today),
      allCryingEvents.filter((event) => event.time >= today)
    );

    // Generate hourly statistics for the past 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Pass only the relevant events but include the full set for accurate duration calculation
    statistics.badPositionHourlyData = this.generateHourlyData(
      allPositionEvents.filter((event) => event.time >= yesterday),
      8 // 8 3-hour periods
    );

    statistics.cryingHourlyData = this.generateHourlyData(
      allCryingEvents.filter((event) => event.time >= yesterday),
      8 // 8 3-hour periods
    );

    // Generate weekly correlation data using all event types
    statistics.correlationData = this.generateCorrelationData(allPositionEvents, allCryingEvents);

    // Cache the statistics with shorter expiration (2 minutes instead of 30)
    const newCacheExpiration = Date.now() + cacheExpiration;
    this.firestoreService.setInCache(statsCacheKey, {
      data: statistics,
      timestamp: Date.now(),
      expiration: newCacheExpiration,
    });

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
        totalCount: badPositionEvents.filter((event) => event.type === 'prone').length,
        totalMinutes: 0,
        longestPeriod: '-',
        longestDuration: 0,
      },
      cryingData: {
        totalCount: cryingEvents.filter((event) => event.type === 'crying').length,
        totalMinutes: 0,
        longestPeriod: '-',
        longestDuration: 0,
      },
    };

    // Get today's date for end cap
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Process bad position events
    this.processBadPositionEvents(badPositionEvents, overview, now);

    // Process crying events
    this.processCryingEvents(cryingEvents, overview, now);

    return overview;
  }

  /**
   * Process bad position events to calculate durations and longest periods
   */
  private static processBadPositionEvents(
    badPositionEvents: DeviceEvent[],
    overview: TodayOverviewData,
    now: Date
  ): void {
    if (badPositionEvents.length === 0) return;

    // Group by device ID as each device has its own segments
    const deviceIds = badPositionEvents
      .map((event) => event.deviceId)
      .filter((deviceId, index, array) => array.indexOf(deviceId) === index);

    let totalDurationMs = 0;
    let longestDurationMs = 0;
    let longestPeriodStart: Date | null = null;
    let longestPeriodEnd: Date | null = null;

    for (const deviceId of deviceIds) {
      // Get all position events for this device, sorted by time
      const devicePositionEvents = [...badPositionEvents]
        .filter((event) => event.deviceId === deviceId)
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      // Track bad position segments
      let badPositionStart: Date | null = null;

      for (let i = 0; i < devicePositionEvents.length; i++) {
        const event = devicePositionEvents[i];

        // Start a new segment when we encounter a bad position event
        if (event.type === 'prone' && !badPositionStart) {
          badPositionStart = event.time;
        }
        // End the segment when we encounter a 'supine' event
        else if (event.type === 'supine' && badPositionStart) {
          const durationMs = event.time.getTime() - badPositionStart.getTime();
          totalDurationMs += durationMs;

          // Check if this is the longest segment
          if (durationMs > longestDurationMs) {
            longestDurationMs = durationMs;
            longestPeriodStart = badPositionStart;
            longestPeriodEnd = event.time;
          }

          badPositionStart = null;
        }
      }

      // If there's an open bad position segment at the end, end it at the current time or 5 minutes max
      if (badPositionStart) {
        const endTime = new Date(
          Math.min(
            badPositionStart.getTime() + 5 * 60 * 1000, // 5 minutes max
            now.getTime() // Current time
          )
        );

        const durationMs = endTime.getTime() - badPositionStart.getTime();
        totalDurationMs += durationMs;

        // Check if this is the longest segment
        if (durationMs > longestDurationMs) {
          longestDurationMs = durationMs;
          longestPeriodStart = badPositionStart;
          longestPeriodEnd = endTime;
        }
      }
    }

    // Update the overview data
    overview.badPositionData.totalMinutes = parseFloat((totalDurationMs / (60 * 1000)).toFixed(1));
    overview.badPositionData.longestDuration = Math.ceil(longestDurationMs / (60 * 1000));

    if (longestPeriodStart && longestPeriodEnd) {
      const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      };
      overview.badPositionData.longestPeriod = `${formatTime(longestPeriodStart)} - ${formatTime(longestPeriodEnd)}`;
    }
  }

  /**
   * Process crying events to calculate durations and longest periods
   */
  private static processCryingEvents(
    cryingEvents: DeviceEvent[],
    overview: TodayOverviewData,
    now: Date
  ): void {
    if (cryingEvents.length === 0) return;

    // Group by device ID as each device has its own segments
    const deviceIds = cryingEvents
      .map((event) => event.deviceId)
      .filter((deviceId, index, array) => array.indexOf(deviceId) === index);

    let totalDurationMs = 0;
    let longestDurationMs = 0;
    let longestPeriodStart: Date | null = null;
    let longestPeriodEnd: Date | null = null;

    for (const deviceId of deviceIds) {
      // Get all crying events for this device, sorted by time
      const deviceCryingEvents = [...cryingEvents]
        .filter((event) => event.deviceId === deviceId)
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      // Track crying segments
      let cryingStart: Date | null = null;

      for (let i = 0; i < deviceCryingEvents.length; i++) {
        const event = deviceCryingEvents[i];

        // Start a new segment when we encounter a crying event
        if (event.type === 'crying' && !cryingStart) {
          cryingStart = event.time;
        }
        // End the segment when we encounter a 'nocrying' event
        else if (event.type === 'nocrying' && cryingStart) {
          const durationMs = event.time.getTime() - cryingStart.getTime();
          totalDurationMs += durationMs;

          // Check if this is the longest segment
          if (durationMs > longestDurationMs) {
            longestDurationMs = durationMs;
            longestPeriodStart = cryingStart;
            longestPeriodEnd = event.time;
          }

          cryingStart = null;
        }
      }

      // If there's an open crying segment at the end, end it at current time or 5 minutes max
      if (cryingStart) {
        const endTime = new Date(
          Math.min(
            cryingStart.getTime() + 5 * 60 * 1000, // 5 minutes max
            now.getTime() // Current time
          )
        );

        const durationMs = endTime.getTime() - cryingStart.getTime();
        totalDurationMs += durationMs;

        // Check if this is the longest segment
        if (durationMs > longestDurationMs) {
          longestDurationMs = durationMs;
          longestPeriodStart = cryingStart;
          longestPeriodEnd = endTime;
        }
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

    // Group events by device
    const deviceIds = events
      .filter((event) => event.time >= yesterday && event.time <= now)
      .map((event) => event.deviceId)
      .filter((deviceId, index, array) => array.indexOf(deviceId) === index);

    for (const deviceId of deviceIds) {
      // Get events for this device
      const deviceEvents = events
        .filter(
          (event) => event.deviceId === deviceId && event.time >= yesterday && event.time <= now
        )
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      // Determine event type (bad position or crying) based on first event
      const isBadPositionData = deviceEvents.some(
        (event) => event.type === 'prone' || event.type === 'side' || event.type === 'supine'
      );
      const isCryingData = deviceEvents.some(
        (event) => event.type === 'crying' || event.type === 'nocrying'
      );

      // Track event segments
      let segmentStart: Date | null = null;

      for (let i = 0; i < deviceEvents.length; i++) {
        const event = deviceEvents[i];

        // For bad position events (prone/side/supine)
        if (isBadPositionData) {
          if (event.type === 'prone' && !segmentStart) {
            // Start a new segment when we encounter a bad position event
            segmentStart = event.time;
          } else if (event.type === 'supine' && segmentStart) {
            // End the segment when we encounter a 'supine' event
            this.distributeTimeAcrossPeriods(
              segmentStart,
              event.time,
              result,
              periods,
              hoursPerPeriod
            );
            segmentStart = null;
          }
        }
        // For crying events (crying/nocrying)
        else if (isCryingData) {
          if (event.type === 'crying' && !segmentStart) {
            // Start a new segment when we encounter a crying event
            segmentStart = event.time;
          } else if (event.type === 'nocrying' && segmentStart) {
            // End the segment when we encounter a 'nocrying' event
            this.distributeTimeAcrossPeriods(
              segmentStart,
              event.time,
              result,
              periods,
              hoursPerPeriod
            );
            segmentStart = null;
          }
        }
      }

      // If there's an open segment at the end, end it at current time or 5 minutes max
      if (segmentStart) {
        const endTime = new Date(
          Math.min(
            segmentStart.getTime() + 5 * 60 * 1000, // 5 minutes max
            now.getTime() // Current time
          )
        );

        this.distributeTimeAcrossPeriods(segmentStart, endTime, result, periods, hoursPerPeriod);
      }
    }

    // Round the results
    return result.map((value) => Math.round(value));
  }

  /**
   * Helper method to distribute time across hourly periods
   */
  private static distributeTimeAcrossPeriods(
    startTime: Date,
    endTime: Date,
    result: number[],
    periods: number,
    hoursPerPeriod: number
  ): void {
    // Calculate duration in minutes
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / (60 * 1000);

    // Determine which period(s) this segment belongs to
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;

    // If segment spans multiple periods, divide duration proportionally
    const startPeriodIndex = Math.floor(startHour / hoursPerPeriod);
    const endPeriodIndex = Math.floor(endHour / hoursPerPeriod);

    if (startPeriodIndex === endPeriodIndex) {
      // Segment falls entirely within one period
      if (startPeriodIndex >= 0 && startPeriodIndex < periods) {
        result[startPeriodIndex] += durationMinutes;
      }
    } else {
      // Segment spans multiple periods, distribute proportionally
      const startPeriodEndHour = (startPeriodIndex + 1) * hoursPerPeriod;
      const startPeriodDuration =
        ((startPeriodEndHour - startHour) / (endHour - startHour)) * durationMinutes;

      if (startPeriodIndex >= 0 && startPeriodIndex < periods) {
        result[startPeriodIndex] += startPeriodDuration;
      }

      for (let periodIndex = startPeriodIndex + 1; periodIndex < endPeriodIndex; periodIndex++) {
        if (periodIndex >= 0 && periodIndex < periods) {
          result[periodIndex] += (hoursPerPeriod / (endHour - startHour)) * durationMinutes;
        }
      }

      const endPeriodDuration =
        ((endHour - endPeriodIndex * hoursPerPeriod) / (endHour - startHour)) * durationMinutes;
      if (endPeriodIndex >= 0 && endPeriodIndex < periods) {
        result[endPeriodIndex] += endPeriodDuration;
      }
    }
  }

  /**
   * Generate correlation data for the past week
   * Creates data points for each day of the week showing bad position and crying totals
   * Takes complete sets of position and crying events including 'supine' and 'nocrying'
   */
  private static generateCorrelationData(
    positionEvents: DeviceEvent[],
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

      // Calculate bad position duration (from 'prone'/'side' to 'supine')
      let badPositionMinutes = 0;

      // Group events by device
      const deviceIds = positionEvents
        .filter((event) => event.time >= date && event.time < nextDay)
        .map((event) => event.deviceId)
        .filter((deviceId, index, array) => array.indexOf(deviceId) === index);

      for (const deviceId of deviceIds) {
        // Get all position events for this device on this day
        const devicePositionEvents = positionEvents
          .filter(
            (event) => event.deviceId === deviceId && event.time >= date && event.time < nextDay
          )
          .sort((a, b) => a.time.getTime() - b.time.getTime());

        // Track bad position segments
        let badPositionStart: Date | null = null;

        for (let j = 0; j < devicePositionEvents.length; j++) {
          const event = devicePositionEvents[j];

          if (event.type === 'prone' && !badPositionStart) {
            // Start a new segment when we encounter a bad position event
            badPositionStart = event.time;
          } else if (event.type === 'supine' && badPositionStart) {
            // End the segment when we encounter a 'supine' event
            const durationMs = event.time.getTime() - badPositionStart.getTime();
            badPositionMinutes += durationMs / (60 * 1000);
            badPositionStart = null;
          }
        }

        // If there's an open bad position segment at the end of the day, end it at midnight
        if (badPositionStart) {
          const endTime = new Date(
            Math.min(
              badPositionStart.getTime() + 5 * 60 * 1000, // 5 minutes max
              nextDay.getTime() // End of day
            )
          );

          const durationMs = endTime.getTime() - badPositionStart.getTime();
          badPositionMinutes += durationMs / (60 * 1000);
        }
      }

      // Calculate crying duration (from 'crying' to 'nocrying')
      let cryingMinutes = 0;

      // Group events by device
      const cryingDeviceIds = cryingEvents
        .filter((event) => event.time >= date && event.time < nextDay)
        .map((event) => event.deviceId)
        .filter((deviceId, index, array) => array.indexOf(deviceId) === index);

      for (const deviceId of cryingDeviceIds) {
        // Get all crying events for this device on this day
        const deviceCryingEvents = cryingEvents
          .filter(
            (event) => event.deviceId === deviceId && event.time >= date && event.time < nextDay
          )
          .sort((a, b) => a.time.getTime() - b.time.getTime());

        // Track crying segments
        let cryingStart: Date | null = null;

        for (let j = 0; j < deviceCryingEvents.length; j++) {
          const event = deviceCryingEvents[j];

          if (event.type === 'crying' && !cryingStart) {
            // Start a new segment when we encounter a crying event
            cryingStart = event.time;
          } else if (event.type === 'nocrying' && cryingStart) {
            // End the segment when we encounter a 'nocrying' event
            const durationMs = event.time.getTime() - cryingStart.getTime();
            cryingMinutes += durationMs / (60 * 1000);
            cryingStart = null;
          }
        }

        // If there's an open crying segment at the end of the day, end it at midnight
        if (cryingStart) {
          const endTime = new Date(
            Math.min(
              cryingStart.getTime() + 5 * 60 * 1000, // 5 minutes max
              nextDay.getTime() // End of day
            )
          );

          const durationMs = endTime.getTime() - cryingStart.getTime();
          cryingMinutes += durationMs / (60 * 1000);
        }
      }

      badPositionData.push({ value: Math.round(badPositionMinutes), label });
      cryingData.push({ value: Math.round(cryingMinutes), label });
    }

    return { badPositionData, cryingData };
  }
}
