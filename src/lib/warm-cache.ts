type CacheEntry<T> = {
  data?: T;
  promise?: Promise<T>;
  expiresAt: number;
};

const warmCache = new Map<string, CacheEntry<unknown>>();

export function getWarmCacheData<T>(key: string) {
  const entry = warmCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    warmCache.delete(key);
    return undefined;
  }
  return entry.data;
}

export function loadWarmCache<T>(key: string, loader: () => Promise<T>, ttlMs: number) {
  const now = Date.now();
  const cached = warmCache.get(key) as CacheEntry<T> | undefined;

  if (cached?.data !== undefined && cached.expiresAt > now) {
    return Promise.resolve(cached.data);
  }

  if (cached?.promise && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = loader()
    .then((data) => {
      warmCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    })
    .catch((error) => {
      const current = warmCache.get(key) as CacheEntry<T> | undefined;
      if (current?.promise === promise) {
        warmCache.delete(key);
      }
      throw error;
    });

  warmCache.set(key, {
    promise,
    expiresAt: now + ttlMs,
  });

  return promise;
}

export function preloadWarmCache<T>(key: string, loader: () => Promise<T>, ttlMs: number) {
  void loadWarmCache(key, loader, ttlMs).catch(() => undefined);
}

export function clearWarmCache(key?: string) {
  if (key) {
    warmCache.delete(key);
    return;
  }
  warmCache.clear();
}
