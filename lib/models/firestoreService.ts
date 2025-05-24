import { getFirestore } from '@react-native-firebase/firestore';

/**
 * Centralized Firestore service to optimize performance
 * - Caches Firestore instance
 * - Provides methods for batch operations
 * - Manages query cache
 */
export class FirestoreService {
  private static instance: FirestoreService;
  private firestore: any; // Using any type since the proper Firestore type isn't exported
  private cache: Map<string, any> = new Map();
  private cacheCleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.firestore = getFirestore();
    // Start cache cleanup timer - run every 10 minutes
    this.startCacheCleanup();
  }

  /**
   * Get the singleton instance of FirestoreService
   */
  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  /**
   * Get the Firestore instance
   */
  public getFirestore(): any {
    return this.firestore;
  }

  /**
   * Get item from cache
   */
  public getFromCache<T>(key: string): T | undefined {
    return this.cache.get(key) as T;
  }

  /**
   * Set item in cache
   */
  public setInCache<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  /**
   * Remove item from cache
   */
  public removeFromCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache or a specific prefix
   */
  public clearCache(prefix?: string): void {
    if (prefix) {
      // Clear only entries with specific prefix
      Array.from(this.cache.keys())
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => this.cache.delete(key));
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }

  /**
   * Generate a cache key for a document
   */
  public static documentCacheKey(collection: string, id: string): string {
    return `doc:${collection}:${id}`;
  }

  /**
   * Generate a cache key for a query
   */
  public static queryCacheKey(collection: string, queryParams: Record<string, any>): string {
    const sortedParams = Object.entries(queryParams)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('&');

    return `query:${collection}:${sortedParams}`;
  }

  /**
   * Start a timer to clean up expired cache entries
   */
  private startCacheCleanup() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }

    this.cacheCleanupInterval = setInterval(
      () => {
        this.cleanupExpiredCache();
      },
      10 * 60 * 1000
    ); // Every 10 minutes
  }

  /**
   * Clean up expired cache entries to reduce memory usage
   */
  private cleanupExpiredCache() {
    const now = Date.now();
    let itemsRemoved = 0;

    // Process cache entries
    for (const [key, value] of this.cache.entries()) {
      // Check for cached items with expiration time
      if (value && typeof value === 'object' && value.expiration && value.expiration < now) {
        this.cache.delete(key);
        itemsRemoved++;
      }
    }

    // Limit cache size to 1000 entries to prevent memory issues
    if (this.cache.size > 1000) {
      // Get all keys as array
      const keys = Array.from(this.cache.keys());
      // Sort keys by most recently added
      const keysToRemove = keys.slice(0, this.cache.size - 1000);
      // Remove oldest entries
      keysToRemove.forEach((key) => this.cache.delete(key));
      itemsRemoved += keysToRemove.length;
    }

    if (itemsRemoved > 0) {
      console.log(`FirestoreService: Cleaned up ${itemsRemoved} expired cache entries`);
    }
  }

  /**
   * Destroy the instance and clean up resources
   */
  public destroy() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }
    this.clearCache();
  }
}
