import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    // Cache manager v5+ uses stores array
    const stores = (this.cacheManager as any).stores;
    if (stores && Array.isArray(stores)) {
      for (const store of stores) {
        if (store && typeof store.clear === 'function') {
          await store.clear();
        }
      }
    }
  }
}
