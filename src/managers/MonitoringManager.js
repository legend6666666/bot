import { Logger } from '../utils/Logger.js';
import os from 'os';

export class MonitoringManager {
    constructor() {
        this.logger = new Logger();
        this.metrics = new Map();
        this.alerts = new Map();
        this.thresholds = {
            cpu: 80,
            memory: 80,
            disk: 90,
            errors: 10,
            responseTime: 5000
        };
        this.isRunning = false;
        this.intervals = [];
    }

    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.logger.info('Starting monitoring system...');
        
        // System metrics collection
        this.intervals.push(setInterval(() => {
            this.collectSystemMetrics();
        }, 30000)); // Every 30 seconds

        // Performance metrics
        this.intervals.push(setInterval(() => {
            this.collectPerformanceMetrics();
        }, 60000)); // Every minute

        // Health checks
        this.intervals.push(setInterval(() => {
            this.performHealthChecks();
        }, 120000)); // Every 2 minutes

        // Alert processing
        this.intervals.push(setInterval(() => {
            this.processAlerts();
        }, 300000)); // Every 5 minutes

        this.logger.success('Monitoring system started');
    }

    async stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        // Clear all intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        
        this.logger.info('Monitoring system stopped');
    }

    collectSystemMetrics() {
        try {
            // CPU Usage
            const cpuUsage = process.cpuUsage();
            const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
            
            // Memory Usage
            const memUsage = process.memoryUsage();
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;
            const memoryPercent = (usedMemory / totalMemory) * 100;
            
            // Disk Usage (approximate)
            const diskUsage = this.getDiskUsage();
            
            // Network Stats
            const networkStats = this.getNetworkStats();
            
            const metrics = {
                timestamp: Date.now(),
                cpu: {
                    usage: cpuPercent,
                    loadAverage: os.loadavg()
                },
                memory: {
                    total: totalMemory,
                    used: usedMemory,
                    free: freeMemory,
                    percent: memoryPercent,
                    heap: memUsage.heapUsed,
                    heapTotal: memUsage.heapTotal,
                    external: memUsage.external
                },
                disk: diskUsage,
                network: networkStats,
                uptime: process.uptime(),
                platform: os.platform(),
                arch: os.arch()
            };
            
            this.metrics.set('system', metrics);
            
            // Check thresholds
            this.checkThresholds(metrics);
            
        } catch (error) {
            this.logger.error('Failed to collect system metrics:', error);
        }
    }

    collectPerformanceMetrics() {
        try {
            const eventLoopLag = this.measureEventLoopLag();
            const gcStats = this.getGCStats();
            
            const metrics = {
                timestamp: Date.now(),
                eventLoopLag,
                gc: gcStats,
                handles: process._getActiveHandles().length,
                requests: process._getActiveRequests().length
            };
            
            this.metrics.set('performance', metrics);
            
        } catch (error) {
            this.logger.error('Failed to collect performance metrics:', error);
        }
    }

    async performHealthChecks() {
        const checks = {
            timestamp: Date.now(),
            database: await this.checkDatabase(),
            discord: await this.checkDiscord(),
            memory: this.checkMemoryHealth(),
            disk: this.checkDiskHealth(),
            services: await this.checkServices()
        };
        
        this.metrics.set('health', checks);
        
        // Log any failed health checks
        Object.entries(checks).forEach(([check, status]) => {
            if (check !== 'timestamp' && !status.healthy) {
                this.logger.warn(`Health check failed: ${check}`, status);
            }
        });
    }

    async checkDatabase() {
        try {
            // Simple database ping
            const start = Date.now();
            await this.client?.database?.db?.get('SELECT 1');
            const responseTime = Date.now() - start;
            
            return {
                healthy: true,
                responseTime,
                status: 'connected'
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                status: 'disconnected'
            };
        }
    }

    async checkDiscord() {
        try {
            const client = this.client?.client;
            if (!client || !client.isReady()) {
                return {
                    healthy: false,
                    status: 'disconnected',
                    ping: null
                };
            }
            
            return {
                healthy: true,
                status: 'connected',
                ping: client.ws.ping,
                guilds: client.guilds.cache.size,
                users: client.users.cache.size
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                status: 'error'
            };
        }
    }

    checkMemoryHealth() {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
        const usage = (heapUsedMB / heapTotalMB) * 100;
        
        return {
            healthy: usage < this.thresholds.memory,
            usage,
            heapUsed: heapUsedMB,
            heapTotal: heapTotalMB
        };
    }

    checkDiskHealth() {
        try {
            const stats = this.getDiskUsage();
            return {
                healthy: stats.percent < this.thresholds.disk,
                ...stats
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    async checkServices() {
        const services = {
            webServer: this.checkWebServer(),
            cache: this.checkCache(),
            analytics: this.checkAnalytics()
        };
        
        return services;
    }

    checkWebServer() {
        try {
            const webServer = this.client?.webServer;
            return {
                healthy: webServer?.isRunning || false,
                port: webServer?.port || null,
                status: webServer?.isRunning ? 'running' : 'stopped'
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    checkCache() {
        try {
            const cache = this.client?.cache;
            return {
                healthy: true,
                size: cache?.size() || 0,
                status: 'operational'
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    checkAnalytics() {
        try {
            const analytics = this.client?.analytics;
            return {
                healthy: true,
                events: analytics?.events?.length || 0,
                status: 'collecting'
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    checkThresholds(metrics) {
        // CPU threshold
        if (metrics.cpu.usage > this.thresholds.cpu) {
            this.createAlert('high_cpu', `CPU usage is ${metrics.cpu.usage.toFixed(2)}%`);
        }
        
        // Memory threshold
        if (metrics.memory.percent > this.thresholds.memory) {
            this.createAlert('high_memory', `Memory usage is ${metrics.memory.percent.toFixed(2)}%`);
        }
        
        // Disk threshold
        if (metrics.disk.percent > this.thresholds.disk) {
            this.createAlert('high_disk', `Disk usage is ${metrics.disk.percent.toFixed(2)}%`);
        }
    }

    createAlert(type, message, severity = 'warning') {
        const alert = {
            id: Date.now().toString(),
            type,
            message,
            severity,
            timestamp: Date.now(),
            acknowledged: false
        };
        
        this.alerts.set(alert.id, alert);
        
        this.logger.warn(`Alert: ${type} - ${message}`);
        
        // Send notification if configured
        this.sendAlertNotification(alert);
    }

    async sendAlertNotification(alert) {
        try {
            const notifications = this.client?.notifications;
            if (notifications) {
                await notifications.sendAlert(alert);
            }
        } catch (error) {
            this.logger.error('Failed to send alert notification:', error);
        }
    }

    processAlerts() {
        const now = Date.now();
        const alertTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        // Remove old alerts
        for (const [id, alert] of this.alerts.entries()) {
            if (now - alert.timestamp > alertTimeout) {
                this.alerts.delete(id);
            }
        }
    }

    measureEventLoopLag() {
        const start = process.hrtime.bigint();
        return new Promise((resolve) => {
            setImmediate(() => {
                const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
                resolve(lag);
            });
        });
    }

    getGCStats() {
        // Basic GC stats (would need gc-stats package for detailed info)
        return {
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal,
            external: process.memoryUsage().external
        };
    }

    getDiskUsage() {
        // Simplified disk usage (would need proper disk usage library)
        const stats = {
            total: 100 * 1024 * 1024 * 1024, // 100GB placeholder
            used: 50 * 1024 * 1024 * 1024,   // 50GB placeholder
            free: 50 * 1024 * 1024 * 1024,   // 50GB placeholder
            percent: 50
        };
        
        return stats;
    }

    getNetworkStats() {
        const networkInterfaces = os.networkInterfaces();
        const stats = {
            interfaces: Object.keys(networkInterfaces).length,
            active: 0
        };
        
        Object.values(networkInterfaces).forEach(interfaces => {
            interfaces.forEach(iface => {
                if (!iface.internal) {
                    stats.active++;
                }
            });
        });
        
        return stats;
    }

    getMetrics(type = null) {
        if (type) {
            return this.metrics.get(type);
        }
        return Object.fromEntries(this.metrics);
    }

    getAlerts(acknowledged = false) {
        return Array.from(this.alerts.values())
            .filter(alert => alert.acknowledged === acknowledged)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.acknowledged = true;
            this.logger.info(`Alert acknowledged: ${alert.type}`);
            return true;
        }
        return false;
    }

    getSystemStatus() {
        const systemMetrics = this.metrics.get('system');
        const healthChecks = this.metrics.get('health');
        const activeAlerts = this.getAlerts(false);
        
        let status = 'healthy';
        if (activeAlerts.some(alert => alert.severity === 'critical')) {
            status = 'critical';
        } else if (activeAlerts.some(alert => alert.severity === 'warning')) {
            status = 'warning';
        }
        
        return {
            status,
            uptime: process.uptime(),
            lastUpdate: Date.now(),
            metrics: systemMetrics,
            health: healthChecks,
            alerts: activeAlerts.length
        };
    }
}