interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

export class QRCodeCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private ttl: number;

  constructor(config: CacheConfig = { maxSize: 100, ttl: 300000 }) {
    // 5 minutes default TTL
    this.maxSize = config.maxSize;
    this.ttl = config.ttl;
  }

  private generateKey(data: any): string {
    return JSON.stringify(data);
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        entriesToDelete.push(key);
      }
    });

    entriesToDelete.forEach(key => this.cache.delete(key));
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    });

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  get<T>(data: any): T | null {
    const key = this.generateKey(data);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.data;
  }

  set<T>(data: any, value: T): void {
    const key = this.generateKey(data);

    // Cleanup expired entries
    this.cleanup();

    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  has(data: any): boolean {
    const key = this.generateKey(data);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    this.cleanup();
    const now = Date.now();
    const entries: Array<{ key: string; hits: number; age: number }> = [];

    this.cache.forEach((entry, key) => {
      entries.push({
        key: `${key.substring(0, 50)}...`, // Truncate long keys for display
        hits: entry.hits,
        age: now - entry.timestamp,
      });
    });

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      size: this.cache.size,
      hitRate,
      entries,
    };
  }
}

// Global cache instance
export const qrCodeCache = new QRCodeCache({
  maxSize: 50, // Cache up to 50 QR codes
  ttl: 600000, // 10 minutes TTL
});
