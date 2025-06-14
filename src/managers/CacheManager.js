import { Logger } from '../utils/Logger.js';

export class CacheManager {
    constructor() {
        this.logger = new Logger();
        this.cache = new Map();
        this.ttlMap = new Map();
        this.defaultTTL = 3600000; // 1 hour
        this.maxSize = 10000;
        this.cleanupInterval = 300000; // 5 minutes
        
        this.startCleanupTimer();
    }

    async initialize() {
        this.logger.info('Cache manager initialized');
    }

    set(key, value, ttl = this.defaultTTL) {
        // Check cache size limit
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 0,
            lastAccess: Date.now()
        });

        if (ttl > 0) {
            this.ttlMap.set(key, Date.now() + ttl);
        }

        this.logger.debug(`Cache set: ${key}`);
        return true;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        // Check TTL
        const ttl = this.ttlMap.get(key);
        if (ttl && Date.now() > ttl) {
            this.delete(key);
            return null;
        }

        // Update access statistics
        item.accessCount++;
        item.lastAccess = Date.now();

        this.logger.debug(`Cache hit: ${key}`);
        return item.value;
    }

    has(key) {
        const exists = this.cache.has(key);
        if (!exists) return false;

        // Check TTL
        const ttl = this.ttlMap.get(key);
        if (ttl && Date.now() > ttl) {
            this.delete(key);
            return false;
        }

        return true;
    }

    delete(key) {
        const deleted = this.cache.delete(key);
        this.ttlMap.delete(key);
        
        if (deleted) {
            this.logger.debug(`Cache deleted: ${key}`);
        }
        
        return deleted;
    }

    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.ttlMap.clear();
        
        this.logger.debug(`Cache cleared: ${size} items removed`);
        return size;
    }

    size() {
        return this.cache.size;
    }

    keys() {
        return Array.from(this.cache.keys());
    }

    values() {
        return Array.from(this.cache.values()).map(item => item.value);
    }

    entries() {
        return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
    }

    // Advanced cache operations
    mget(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = this.get(key);
        }
        return results;
    }

    mset(entries, ttl = this.defaultTTL) {
        for (const [key, value] of Object.entries(entries)) {
            this.set(key, value, ttl);
        }
        return true;
    }

    increment(key, amount = 1) {
        const current = this.get(key) || 0;
        const newValue = current + amount;
        this.set(key, newValue);
        return newValue;
    }

    decrement(key, amount = 1) {
        return this.increment(key, -amount);
    }

    expire(key, ttl) {
        if (this.cache.has(key)) {
            this.ttlMap.set(key, Date.now() + ttl);
            return true;
        }
        return false;
    }

    persist(key) {
        return this.ttlMap.delete(key);
    }

    ttl(key) {
        const expiry = this.ttlMap.get(key);
        if (!expiry) return -1; // No expiry
        
        const remaining = expiry - Date.now();
        return remaining > 0 ? remaining : 0;
    }

    // Cache statistics
    getStats() {
        const items = Array.from(this.cache.values());
        const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0);
        const avgAccess = items.length > 0 ? totalAccess / items.length : 0;

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            totalAccess,
            avgAccess,
            hitRate: this.hitRate || 0,
            memoryUsage: this.getMemoryUsage()
        };
    }

    getMemoryUsage() {
        // Rough estimation of memory usage
        let size = 0;
        for (const [key, item] of this.cache.entries()) {
            size += JSON.stringify(key).length;
            size += JSON.stringify(item.value).length;
            size += 64; // Overhead for timestamps and metadata
        }
        return size;
    }

    // Cache patterns
    getOrSet(key, factory, ttl = this.defaultTTL) {
        let value = this.get(key);
        if (value === null) {
            value = factory();
            this.set(key, value, ttl);
        }
        return value;
    }

    async getOrSetAsync(key, asyncFactory, ttl = this.defaultTTL) {
        let value = this.get(key);
        if (value === null) {
            value = await asyncFactory();
            this.set(key, value, ttl);
        }
        return value;
    }

    // Namespace operations
    deleteByPattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            this.delete(key);
        }
        
        return keysToDelete.length;
    }

    getByPattern(pattern) {
        const regex = new RegExp(pattern);
        const results = {};
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                results[key] = this.get(key);
            }
        }
        
        return results;
    }

    // Internal methods
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, item] of this.cache.entries()) {
            if (item.lastAccess < oldestTime) {
                oldestTime = item.lastAccess;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.delete(oldestKey);
            this.logger.debug(`Evicted oldest cache entry: ${oldestKey}`);
        }
    }

    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, expiry] of this.ttlMap.entries()) {
            if (now > expiry) {
                expiredKeys.push(key);
            }
        }
        
        for (const key of expiredKeys) {
            this.delete(key);
        }
        
        if (expiredKeys.length > 0) {
            this.logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
        
        return expiredKeys.length;
    }

    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }

    async close() {
        this.clear();
        this.logger.info('Cache manager closed');
    }
}