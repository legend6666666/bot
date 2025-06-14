import { Logger } from '../utils/Logger.js';

export class AnalyticsManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.metrics = new Map();
        this.events = [];
        this.startTime = Date.now();
        this.useInMemoryOnly = false;
        this.errorCount = 0;
        this.maxErrors = 3;
        
        this.initializeMetrics();
        this.startMetricsCollection();
    }

    initializeMetrics() {
        this.metrics.set('commands_executed', 0);
        this.metrics.set('messages_processed', 0);
        this.metrics.set('users_served', new Set());
        this.metrics.set('guilds_served', new Set());
        this.metrics.set('errors_occurred', 0);
        this.metrics.set('api_requests', 0);
        this.metrics.set('music_plays', 0);
        this.metrics.set('economy_transactions', 0);
        this.metrics.set('moderation_actions', 0);
        this.metrics.set('tickets_created', 0);
        this.metrics.set('ai_requests', 0);
        this.metrics.set('games_played', 0);
    }

    // Event tracking
    trackEvent(eventType, eventName, data = {}) {
        const eventData = {
            id: this.generateId(),
            event_type: eventType,
            event_name: eventName,
            data,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        this.events.push(eventData);
        
        // Keep only last 10000 events in memory
        if (this.events.length > 10000) {
            this.events.shift();
        }
        
        // Store in database if not in memory-only mode
        if (!this.useInMemoryOnly && this.database && this.database.isInitialized) {
            this.storeEvent(eventData).catch(error => {
                this.errorCount++;
                
                // If we get persistent database errors, switch to memory-only mode
                if (this.errorCount >= this.maxErrors) {
                    this.logger.warn(`Multiple database errors (${this.errorCount}), switching to memory-only mode for analytics`);
                    this.useInMemoryOnly = true;
                }
            });
        }
        
        this.logger.debug(`Analytics event: ${eventType}:${eventName}`, data);
    }

    // Metric tracking
    incrementMetric(metric, value = 1) {
        const current = this.metrics.get(metric);
        
        if (typeof current === 'number') {
            this.metrics.set(metric, current + value);
        } else if (current instanceof Set) {
            if (typeof value === 'string' || typeof value === 'number') {
                current.add(value);
            }
        }
    }

    setMetric(metric, value) {
        this.metrics.set(metric, value);
    }

    getMetric(metric) {
        const value = this.metrics.get(metric);
        return value instanceof Set ? value.size : value;
    }

    // Command analytics
    trackCommand(command, user, guild, success = true, executionTime = 0) {
        this.incrementMetric('commands_executed');
        this.incrementMetric('users_served', user.id);
        if (guild) this.incrementMetric('guilds_served', guild.id);
        
        this.trackEvent('command', 'executed', {
            command: command.name,
            userId: user.id,
            guildId: guild?.id,
            success,
            executionTime,
            category: command.category || 'unknown'
        });
        
        // Track command-specific metrics
        const commandMetric = `command_${command.name}`;
        this.incrementMetric(commandMetric);
    }

    // User analytics
    trackUser(user, action, data = {}) {
        this.incrementMetric('users_served', user.id);
        
        this.trackEvent('user', action, {
            userId: user.id,
            username: user.username,
            ...data
        });
    }

    // Guild analytics
    trackGuild(guild, action, data = {}) {
        this.incrementMetric('guilds_served', guild.id);
        
        this.trackEvent('guild', action, {
            guildId: guild.id,
            guildName: guild.name,
            memberCount: guild.memberCount,
            ...data
        });
    }

    // Feature-specific analytics
    trackMusic(action, data = {}) {
        this.incrementMetric('music_plays');
        this.trackEvent('music', action, data);
    }

    trackEconomy(action, amount, userId, data = {}) {
        this.incrementMetric('economy_transactions');
        this.trackEvent('economy', action, { 
            amount, 
            userId, 
            ...data 
        });
    }

    trackModeration(action, moderator, target, data = {}) {
        this.incrementMetric('moderation_actions');
        this.trackEvent('moderation', action, {
            moderatorId: moderator.id,
            targetId: target.id,
            ...data
        });
    }

    trackTicket(action, userId, data = {}) {
        if (action === 'created') {
            this.incrementMetric('tickets_created');
        }
        this.trackEvent('ticket', action, { userId, ...data });
    }

    trackAI(action, userId, data = {}) {
        this.incrementMetric('ai_requests');
        this.trackEvent('ai', action, { userId, ...data });
    }

    trackGame(game, userId, data = {}) {
        this.incrementMetric('games_played');
        this.trackEvent('game', 'played', { game, userId, ...data });
    }

    // Error tracking
    trackError(error, context = {}) {
        this.incrementMetric('errors_occurred');
        
        this.trackEvent('error', 'occurred', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        });
    }

    // Performance tracking
    trackPerformance(operation, duration, data = {}) {
        this.trackEvent('performance', 'metric', {
            operation,
            duration,
            ...data
        });
    }

    // API tracking
    trackAPI(endpoint, method, statusCode, duration, data = {}) {
        this.incrementMetric('api_requests');
        
        this.trackEvent('api', 'request', {
            endpoint,
            method,
            statusCode,
            duration,
            ...data
        });
    }

    // Data aggregation
    getHourlyStats(hours = 24) {
        const now = Date.now();
        const hourMs = 60 * 60 * 1000;
        const stats = [];
        
        for (let i = 0; i < hours; i++) {
            const hourStart = now - (i * hourMs);
            const hourEnd = hourStart + hourMs;
            
            const hourEvents = this.events.filter(event => 
                event.timestamp >= hourStart && event.timestamp < hourEnd
            );
            
            stats.unshift({
                hour: new Date(hourStart).toISOString(),
                events: hourEvents.length,
                commands: hourEvents.filter(e => e.event_type === 'command').length,
                errors: hourEvents.filter(e => e.event_type === 'error').length,
                users: new Set(hourEvents.map(e => e.data.userId).filter(Boolean)).size
            });
        }
        
        return stats;
    }

    getDailyStats(days = 30) {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const stats = [];
        
        for (let i = 0; i < days; i++) {
            const dayStart = now - (i * dayMs);
            const dayEnd = dayStart + dayMs;
            
            const dayEvents = this.events.filter(event => 
                event.timestamp >= dayStart && event.timestamp < dayEnd
            );
            
            stats.unshift({
                date: new Date(dayStart).toISOString().split('T')[0],
                events: dayEvents.length,
                commands: dayEvents.filter(e => e.event_type === 'command').length,
                errors: dayEvents.filter(e => e.event_type === 'error').length,
                users: new Set(dayEvents.map(e => e.data.userId).filter(Boolean)).size,
                guilds: new Set(dayEvents.map(e => e.data.guildId).filter(Boolean)).size
            });
        }
        
        return stats;
    }

    getTopCommands(limit = 10) {
        const commandCounts = {};
        
        this.events
            .filter(event => event.event_type === 'command')
            .forEach(event => {
                const command = event.data.command;
                commandCounts[command] = (commandCounts[command] || 0) + 1;
            });
        
        return Object.entries(commandCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([command, count]) => ({ command, count }));
    }

    getTopUsers(limit = 10) {
        const userCounts = {};
        
        this.events
            .filter(event => event.data.userId)
            .forEach(event => {
                const userId = event.data.userId;
                userCounts[userId] = (userCounts[userId] || 0) + 1;
            });
        
        return Object.entries(userCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([userId, count]) => ({ userId, count }));
    }

    getTopGuilds(limit = 10) {
        const guildCounts = {};
        
        this.events
            .filter(event => event.data.guildId)
            .forEach(event => {
                const guildId = event.data.guildId;
                guildCounts[guildId] = (guildCounts[guildId] || 0) + 1;
            });
        
        return Object.entries(guildCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([guildId, count]) => ({ guildId, count }));
    }

    // Real-time metrics
    getRealTimeMetrics() {
        const uptime = Date.now() - this.startTime;
        
        return {
            uptime,
            totalCommands: this.getMetric('commands_executed'),
            totalMessages: this.getMetric('messages_processed'),
            totalUsers: this.getMetric('users_served'),
            totalGuilds: this.getMetric('guilds_served'),
            totalErrors: this.getMetric('errors_occurred'),
            commandsPerMinute: this.getMetric('commands_executed') / (uptime / 60000),
            errorsPerHour: this.getMetric('errors_occurred') / (uptime / 3600000),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            inMemoryMode: this.useInMemoryOnly,
            errorCount: this.errorCount
        };
    }

    // Database operations
    async storeEvent(event) {
        if (!this.database || !this.database.db || this.useInMemoryOnly) {
            return;
        }
        
        try {
            // Map event data to match the analytics_events table structure
            const userId = event.data.userId || null;
            const guildId = event.data.guildId || null;
            const sessionId = event.data.sessionId || null;
            const ipAddress = event.data.ipAddress || null;
            const userAgent = event.data.userAgent || null;
            const data = JSON.stringify(event.data);
            
            // Use the database's addAnalyticsEvent method
            await this.database.addAnalyticsEvent(
                event.event_type,
                event.event_name,
                userId,
                guildId,
                data,
                sessionId,
                ipAddress,
                userAgent
            );
        } catch (error) {
            this.errorCount++;
            this.logger.error('Failed to store analytics event:', error);
            
            // If we get too many errors, switch to memory-only mode
            if (this.errorCount >= this.maxErrors) {
                this.logger.warn(`Multiple database errors (${this.errorCount}), switching to memory-only mode for analytics`);
                this.useInMemoryOnly = true;
            }
            
            throw error;
        }
    }

    async getStoredEvents(limit = 1000, offset = 0) {
        if (this.useInMemoryOnly || !this.database || !this.database.db) {
            return this.events.slice(-limit);
        }
        
        try {
            const events = await this.database.getAnalyticsEvents(null, limit, offset);
            
            return events.map(event => ({
                ...event,
                data: event.data ? JSON.parse(event.data) : {}
            }));
        } catch (error) {
            this.errorCount++;
            this.logger.error('Failed to get stored events:', error);
            
            // If we get too many errors, switch to memory-only mode
            if (this.errorCount >= this.maxErrors) {
                this.logger.warn(`Multiple database errors (${this.errorCount}), switching to memory-only mode for analytics`);
                this.useInMemoryOnly = true;
            }
            
            // Fall back to in-memory events
            return this.events.slice(-limit);
        }
    }

    // Metrics collection
    startMetricsCollection() {
        // Collect metrics every minute
        setInterval(() => {
            this.collectSystemMetrics();
        }, 60000);
        
        // Clean up old events every hour
        setInterval(() => {
            this.cleanupOldEvents();
        }, 3600000);
    }

    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.trackEvent('system', 'metrics', {
            memory: {
                rss: memUsage.rss,
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: process.uptime(),
            inMemoryMode: this.useInMemoryOnly,
            errorCount: this.errorCount
        });
    }

    cleanupOldEvents() {
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const cutoff = Date.now() - maxAge;
        
        this.events = this.events.filter(event => event.timestamp > cutoff);
        
        this.logger.debug('Cleaned up old analytics events');
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    exportData(format = 'json') {
        const data = {
            metrics: Object.fromEntries(
                Array.from(this.metrics.entries()).map(([key, value]) => [
                    key,
                    value instanceof Set ? Array.from(value) : value
                ])
            ),
            events: this.events,
            realTimeMetrics: this.getRealTimeMetrics(),
            hourlyStats: this.getHourlyStats(),
            dailyStats: this.getDailyStats(),
            topCommands: this.getTopCommands(),
            topUsers: this.getTopUsers(),
            topGuilds: this.getTopGuilds(),
            inMemoryMode: this.useInMemoryOnly,
            errorCount: this.errorCount
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(this.events);
            default:
                return data;
        }
    }

    convertToCSV(events) {
        if (events.length === 0) return '';
        
        const headers = ['timestamp', 'event_type', 'event_name', 'data'];
        const rows = events.map(event => [
            event.timestamp,
            event.event_type,
            event.event_name,
            JSON.stringify(event.data)
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }
}