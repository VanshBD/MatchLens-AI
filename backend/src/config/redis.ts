import { logger } from './logger';

/**
 * Optional Redis cache client.
 * Gracefully degrades — if Redis is unavailable, the app runs fine without it.
 */

interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
}

class MemoryCache implements CacheClient {
  private store = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}

class RedisCache implements CacheClient {
  private client: import('ioredis').Redis;

  constructor(client: import('ioredis').Redis) {
    this.client = client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }
}

let cache: CacheClient;

export async function initCache(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      const { default: Redis } = await import('ioredis');
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        lazyConnect: true,
      });

      await client.connect();
      cache = new RedisCache(client);
      logger.info('✅ Redis cache connected');
    } catch (error) {
      logger.warn('Redis unavailable, falling back to in-memory cache', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      cache = new MemoryCache();
    }
  } else {
    cache = new MemoryCache();
    logger.info('Using in-memory cache (REDIS_URL not set)');
  }
}

export function getCache(): CacheClient {
  if (!cache) cache = new MemoryCache();
  return cache;
}

/**
 * Memoize an async function with cache
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const c = getCache();
  const cached = await c.get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // cached value corrupted — re-fetch
    }
  }

  const result = await fn();
  await c.set(key, JSON.stringify(result), ttlSeconds);
  return result;
}
