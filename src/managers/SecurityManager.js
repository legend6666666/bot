import { Logger } from '../utils/Logger.js';
import crypto from 'crypto';

export class SecurityManager {
    constructor() {
        this.logger = new Logger();
        this.rateLimiters = new Map();
        this.blacklistedUsers = new Set();
        this.blacklistedGuilds = new Set();
        this.suspiciousActivity = new Map();
        this.securityEvents = [];
        
        this.initializeRateLimiters();
    }

    initializeRateLimiters() {
        // Command rate limiter
        this.rateLimiters.set('commands', {
            points: 10, // Number of commands
            duration: 60, // Per 60 seconds
            blockDuration: 300, // Block for 5 minutes
            users: new Map()
        });

        // Message rate limiter
        this.rateLimiters.set('messages', {
            points: 20, // Number of messages
            duration: 60, // Per 60 seconds
            blockDuration: 600, // Block for 10 minutes
            users: new Map()
        });

        // API rate limiter
        this.rateLimiters.set('api', {
            points: 100, // Number of requests
            duration: 3600, // Per hour
            blockDuration: 3600, // Block for 1 hour
            users: new Map()
        });

        // Login attempts
        this.rateLimiters.set('login', {
            points: 5, // Number of attempts
            duration: 900, // Per 15 minutes
            blockDuration: 1800, // Block for 30 minutes
            users: new Map()
        });
    }

    async checkRateLimit(type, identifier) {
        const limiter = this.rateLimiters.get(type);
        if (!limiter) return { allowed: true };

        const now = Date.now();
        const userKey = `${type}:${identifier}`;
        const userData = limiter.users.get(userKey) || { 
            count: 0, 
            resetTime: now + (limiter.duration * 1000),
            blockUntil: 0
        };

        // Check if user is blocked
        if (userData.blockUntil > now) {
            const secs = Math.round((userData.blockUntil - now) / 1000) || 1;
            return { 
                allowed: false, 
                retryAfter: secs,
                totalHits: userData.count,
                remainingPoints: 0
            };
        }

        // Reset counter if duration has passed
        if (now > userData.resetTime) {
            userData.count = 0;
            userData.resetTime = now + (limiter.duration * 1000);
        }

        // Check if limit exceeded
        if (userData.count >= limiter.points) {
            userData.blockUntil = now + (limiter.blockDuration * 1000);
            limiter.users.set(userKey, userData);
            
            const secs = Math.round(limiter.blockDuration) || 1;
            this.logger.security('Rate limit exceeded', { identifier }, { 
                type, 
                identifier, 
                retryAfter: secs 
            });
            
            return { 
                allowed: false, 
                retryAfter: secs,
                totalHits: userData.count,
                remainingPoints: 0
            };
        }

        // Increment counter
        userData.count++;
        limiter.users.set(userKey, userData);
        
        return { 
            allowed: true,
            remainingPoints: limiter.points - userData.count,
            totalHits: userData.count
        };
    }

    // User security checks
    isUserBlacklisted(userId) {
        return this.blacklistedUsers.has(userId);
    }

    blacklistUser(userId, reason = 'Security violation') {
        this.blacklistedUsers.add(userId);
        this.logSecurityEvent('user_blacklisted', { userId, reason });
        this.logger.security('User blacklisted', { id: userId }, { reason });
    }

    unblacklistUser(userId) {
        const removed = this.blacklistedUsers.delete(userId);
        if (removed) {
            this.logSecurityEvent('user_unblacklisted', { userId });
            this.logger.security('User unblacklisted', { id: userId });
        }
        return removed;
    }

    // Guild security checks
    isGuildBlacklisted(guildId) {
        return this.blacklistedGuilds.has(guildId);
    }

    blacklistGuild(guildId, reason = 'Security violation') {
        this.blacklistedGuilds.add(guildId);
        this.logSecurityEvent('guild_blacklisted', { guildId, reason });
        this.logger.security('Guild blacklisted', { id: guildId }, { reason });
    }

    unblacklistGuild(guildId) {
        const removed = this.blacklistedGuilds.delete(guildId);
        if (removed) {
            this.logSecurityEvent('guild_unblacklisted', { guildId });
            this.logger.security('Guild unblacklisted', { id: guildId });
        }
        return removed;
    }

    // Suspicious activity detection
    reportSuspiciousActivity(userId, activity, severity = 'medium') {
        const key = `${userId}_${activity}`;
        const existing = this.suspiciousActivity.get(key) || { count: 0, firstSeen: Date.now() };
        
        existing.count++;
        existing.lastSeen = Date.now();
        existing.severity = severity;
        
        this.suspiciousActivity.set(key, existing);
        
        // Auto-blacklist for severe activities
        if (severity === 'high' && existing.count >= 3) {
            this.blacklistUser(userId, `Repeated suspicious activity: ${activity}`);
        }
        
        this.logSecurityEvent('suspicious_activity', { 
            userId, 
            activity, 
            severity, 
            count: existing.count 
        });
    }

    getSuspiciousActivity(userId) {
        const activities = [];
        for (const [key, data] of this.suspiciousActivity.entries()) {
            if (key.startsWith(userId + '_')) {
                const activity = key.substring(userId.length + 1);
                activities.push({ activity, ...data });
            }
        }
        return activities;
    }

    // Content security
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially dangerous characters
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/data:/gi, '') // Remove data: protocol
            .replace(/vbscript:/gi, '') // Remove vbscript: protocol
            .trim();
    }

    validateUrl(url) {
        try {
            const parsed = new URL(url);
            const allowedProtocols = ['http:', 'https:'];
            
            if (!allowedProtocols.includes(parsed.protocol)) {
                return false;
            }
            
            // Check for suspicious domains
            const suspiciousDomains = [
                'bit.ly', 'tinyurl.com', 'short.link', 'grabify.link'
            ];
            
            if (suspiciousDomains.some(domain => parsed.hostname.includes(domain))) {
                this.logger.security('Suspicious URL detected', null, { url });
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }

    // Encryption utilities
    encrypt(text, key = process.env.ENCRYPTION_KEY) {
        if (!key) throw new Error('Encryption key not provided');
        
        const algorithm = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.padEnd(32).slice(0, 32)), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted,
            iv: iv.toString('hex')
        };
    }

    decrypt(encryptedData, key = process.env.ENCRYPTION_KEY) {
        if (!key) throw new Error('Encryption key not provided');
        
        const algorithm = 'aes-256-cbc';
        const decipher = crypto.createDecipheriv(
            algorithm, 
            Buffer.from(key.padEnd(32).slice(0, 32)), 
            Buffer.from(encryptedData.iv, 'hex')
        );
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    // Hash utilities
    hash(data, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(data).digest('hex');
    }

    verifyHash(data, hash, algorithm = 'sha256') {
        const computed = this.hash(data, algorithm);
        return computed === hash;
    }

    // Token generation
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    generateApiKey() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(16).toString('hex');
        return `${timestamp}_${random}`;
    }

    // Security event logging
    logSecurityEvent(event, data = {}) {
        const securityEvent = {
            id: crypto.randomUUID(),
            event,
            data,
            timestamp: new Date().toISOString(),
            ip: data.ip || 'unknown'
        };
        
        this.securityEvents.push(securityEvent);
        
        // Keep only last 1000 events
        if (this.securityEvents.length > 1000) {
            this.securityEvents.shift();
        }
        
        this.logger.security(`Security event: ${event}`, null, data);
    }

    getSecurityEvents(limit = 100) {
        return this.securityEvents.slice(-limit);
    }

    // Permission validation
    validatePermissions(user, requiredPermissions) {
        if (!user || !user.permissions) return false;
        
        return requiredPermissions.every(permission => 
            user.permissions.has(permission)
        );
    }

    // IP security
    isIpBlacklisted(ip) {
        // Implement IP blacklist checking
        const blacklistedRanges = [
            '127.0.0.1', // Localhost (for testing)
            // Add more IP ranges as needed
        ];
        
        return blacklistedRanges.includes(ip);
    }

    // Session security
    generateSessionToken() {
        return {
            token: this.generateSecureToken(64),
            expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            created: Date.now()
        };
    }

    validateSessionToken(token, storedToken) {
        if (!token || !storedToken) return false;
        if (Date.now() > storedToken.expires) return false;
        
        return token === storedToken.token;
    }

    // Security headers for web requests
    getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'",
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };
    }

    // Cleanup old data
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        // Clean up old suspicious activities
        for (const [key, data] of this.suspiciousActivity.entries()) {
            if (now - data.lastSeen > maxAge) {
                this.suspiciousActivity.delete(key);
            }
        }
        
        // Clean up old security events
        this.securityEvents = this.securityEvents.filter(
            event => now - new Date(event.timestamp).getTime() < maxAge * 7 // Keep for 7 days
        );
    }

    // Security statistics
    getSecurityStats() {
        return {
            blacklistedUsers: this.blacklistedUsers.size,
            blacklistedGuilds: this.blacklistedGuilds.size,
            suspiciousActivities: this.suspiciousActivity.size,
            securityEvents: this.securityEvents.length,
            rateLimiters: this.rateLimiters.size
        };
    }
}