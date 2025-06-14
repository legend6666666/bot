import { Logger } from '../utils/Logger.js';

export class AnalyticsManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.metrics = new Map();
        this.events = [];
        this.startTime = Date.now();
        
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
    trackEvent(event, data = {}) {
        const eventData = {
            id: this.generateId(),
            event,
            data,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        this.events.push(eventData);
        
        // Keep only last 10000 events in memory
        if (this.events.length > 10000) {
            this.events.shift();
        }
        
        // Store in database
        this.storeEvent(eventData);
        
        this.logger.debug(`Analytics event: ${event}`, data);
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
        
        this.trackEvent('command_executed', {
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
        
        this.trackEvent('user_action', {
            userId: user.id,
            username: user.username,
            action,
            ...data
        });
    }

    // Guild analytics
    trackGuild(guild, action, data = {}) {
        this.incrementMetric('guilds_served', guild.id);
        
        this.trackEvent('guild_action', {
            guildId: guild.id,
            guildName: guild.name,
            memberCount: guild.memberCount,
            action,
            ...data
        });
    }

    // Feature-specific analytics
    trackMusic(action, data = {}) {
        this.incrementMetric('music_plays');
        this.trackEvent('music_action', { action, ...data });
    }

    trackEconomy(action, amount, userId, data = {}) {
        this.incrementMetric('economy_transactions');
        this.trackEvent('economy_action', { 
            action, 
            amount, 
            userId, 
            ...data 
        });
    }

    trackModeration(action, moderator, target, data = {}) {
        this.incrementMetric('moderation_actions');
        this.trackEvent('moderation_action', {
            action,
            moderatorId: moderator.id,
            targetId: target.id,
            ...data
        });
    }

    trackTicket(action, userId, data = {}) {
        if (action === 'created') {
            this.incrementMetric('tickets_created');
        }
        this.trackEvent('ticket_action', { action, userId, ...data });
    }

    trackAI(action, userId, data = {}) {
        this.incrementMetric('ai_requests');
        this.trackEvent('ai_action', { action, userId, ...data });
    }

    trackGame(game, userId, data = {}) {
        this.incrementMetric('games_played');
        this.trackEvent('game_action', { game, userId, ...data });
    }

    // Error tracking
    trackError(error, context = {}) {
        this.incrementMetric('errors_occurred');
        
        this.trackEvent('error_occurred', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        });
    }

    // Performance tracking
    trackPerformance(operation, duration, data = {}) {
        this.trackEvent('performance_metric', {
            operation,
            duration,
            ...data
        });
    }

    // API tracking
    trackAPI(endpoint, method, statusCode, duration, data = {}) {
        this.incrementMetric('api_requests');
        
        this.trackEvent('api_request', {
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
                commands: hourEvents.filter(e => e.event === 'command_executed').length,
                errors: hourEvents.filter(e => e.event === 'error_occurred').length,
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
                commands: dayEvents.filter(e => e.event === 'command_executed').length,
                errors: dayEvents.filter(e => e.event === 'error_occurred').length,
                users: new Set(dayEvents.map(e => e.data.userId).filter(Boolean)).size,
                guilds: new Set(dayEvents.map(e => e.data.guildId).filter(Boolean)).size
            });
        }
        
        return stats;
    }

    getTopCommands(limit = 10) {
        const commandCounts = {};
        
        this.events
            .filter(event => event.event === 'command_executed')
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
            cpuUsage: process.cpuUsage()
        };
    }

    // Database operations
    async storeEvent(event) {
        try {
            if (this.database && this.database.db) {
                await this.database.db.run(
                    'INSERT INTO analytics_events (id, event, data, timestamp) VALUES (?, ?, ?, ?)',
                    [event.id, event.event, JSON.stringify(event.data), event.timestamp]
                );
            }
        } catch (error) {
            this.logger.error('Failed to store analytics event:', error);
        }
    }

    async getStoredEvents(limit = 1000, offset = 0) {
        try {
            if (this.database && this.database.db) {
                const events = await this.database.db.all(
                    'SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT ? OFFSET ?',
                    [limit, offset]
                );
                
                return events.map(event => ({
                    ...event,
                    data: JSON.parse(event.data)
                }));
            }
        } catch (error) {
            this.logger.error('Failed to get stored events:', error);
        }
        
        return [];
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
        
        this.trackEvent('system_metrics', {
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
            uptime: process.uptime()
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
            topGuilds: this.getTopGuilds()
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                // Implement CSV export if needed
                return this.convertToCSV(data.events);
            default:
                return data;
        }
    }

    convertToCSV(events) {
        if (events.length === 0) return '';
        
        const headers = ['timestamp', 'event', 'data'];
        const rows = events.map(event => [
            event.timestamp,
            event.event,
            JSON.stringify(event.data)
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }
}