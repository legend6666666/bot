import { Logger } from '../utils/Logger.js';

export class NotificationManager {
    constructor() {
        this.logger = new Logger();
        this.emailTransporter = null;
        this.discordWebhook = null;
        this.smsClient = null;
        this.notificationQueue = [];
        this.isProcessing = false;
        
        this.initializeProviders();
    }

    async initializeProviders() {
        try {
            // Initialize Discord webhook
            if (process.env.DISCORD_WEBHOOK_URL) {
                this.logger.info('Discord webhook notifications initialized');
            }

            this.startNotificationProcessor();
            
        } catch (error) {
            this.logger.error('Failed to initialize notification providers:', error);
        }
    }

    startNotificationProcessor() {
        setInterval(() => {
            this.processNotificationQueue();
        }, 5000); // Process every 5 seconds
    }

    async processNotificationQueue() {
        if (this.isProcessing || this.notificationQueue.length === 0) return;
        
        this.isProcessing = true;
        
        try {
            while (this.notificationQueue.length > 0) {
                const notification = this.notificationQueue.shift();
                await this.sendNotification(notification);
                
                // Small delay between notifications
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            this.logger.error('Error processing notification queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    queueNotification(notification) {
        this.notificationQueue.push({
            ...notification,
            timestamp: Date.now(),
            id: this.generateNotificationId()
        });
    }

    async sendNotification(notification) {
        const { type, channels, ...data } = notification;
        
        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'console':
                        this.sendConsoleNotification(data);
                        break;
                }
            } catch (error) {
                this.logger.error(`Failed to send ${channel} notification:`, error);
            }
        }
    }

    sendConsoleNotification(data) {
        const severity = data.severity || 'info';
        const message = `${data.title || 'Notification'}: ${data.message}`;
        
        switch (severity) {
            case 'critical':
                this.logger.critical(message);
                break;
            case 'error':
                this.logger.error(message);
                break;
            case 'warning':
                this.logger.warn(message);
                break;
            default:
                this.logger.info(message);
        }
    }

    // Predefined notification types
    async sendAlert(alert) {
        this.queueNotification({
            type: 'alert',
            channels: ['console'],
            title: `🚨 ${alert.type.toUpperCase()} Alert`,
            message: alert.message,
            severity: alert.severity,
            fields: [
                { name: 'Alert Type', value: alert.type, inline: true },
                { name: 'Severity', value: alert.severity, inline: true },
                { name: 'Time', value: new Date(alert.timestamp).toLocaleString(), inline: true }
            ]
        });
    }

    async sendErrorNotification(error, context = {}) {
        this.queueNotification({
            type: 'error',
            channels: ['console'],
            title: '❌ Error Occurred',
            message: error.message,
            severity: 'error',
            fields: [
                { name: 'Error Type', value: error.name, inline: true },
                { name: 'Context', value: JSON.stringify(context), inline: false }
            ]
        });
    }

    async sendStartupNotification() {
        this.queueNotification({
            type: 'startup',
            channels: ['console'],
            title: '🚀 Bot Started',
            message: 'World\'s Best Discord Bot has started successfully!',
            severity: 'info',
            fields: [
                { name: 'Version', value: '2.0.0', inline: true },
                { name: 'Environment', value: process.env.NODE_ENV || 'development', inline: true },
                { name: 'Uptime', value: '0 seconds', inline: true }
            ]
        });
    }

    async sendShutdownNotification() {
        this.queueNotification({
            type: 'shutdown',
            channels: ['console'],
            title: '🔄 Bot Shutting Down',
            message: 'World\'s Best Discord Bot is shutting down...',
            severity: 'warning',
            fields: [
                { name: 'Uptime', value: this.formatUptime(process.uptime()), inline: true },
                { name: 'Reason', value: 'Manual shutdown', inline: true }
            ]
        });
    }

    async sendGuildJoinNotification(guild) {
        this.queueNotification({
            type: 'guild_join',
            channels: ['console'],
            title: '➕ New Guild Joined',
            message: `Bot has been added to a new server!`,
            severity: 'info',
            fields: [
                { name: 'Guild Name', value: guild.name, inline: true },
                { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
                { name: 'Owner', value: guild.ownerId, inline: true }
            ]
        });
    }

    async sendGuildLeaveNotification(guild) {
        this.queueNotification({
            type: 'guild_leave',
            channels: ['console'],
            title: '➖ Guild Left',
            message: `Bot has been removed from a server.`,
            severity: 'warning',
            fields: [
                { name: 'Guild Name', value: guild.name, inline: true },
                { name: 'Member Count', value: guild.memberCount.toString(), inline: true }
            ]
        });
    }

    async sendPerformanceAlert(metric, value, threshold) {
        this.queueNotification({
            type: 'performance',
            channels: ['console'],
            title: '⚠️ Performance Alert',
            message: `${metric} has exceeded the threshold!`,
            severity: 'warning',
            fields: [
                { name: 'Metric', value: metric, inline: true },
                { name: 'Current Value', value: value.toString(), inline: true },
                { name: 'Threshold', value: threshold.toString(), inline: true }
            ]
        });
    }

    async sendMaintenanceNotification(message, scheduled = false) {
        this.queueNotification({
            type: 'maintenance',
            channels: ['console'],
            title: scheduled ? '🔧 Scheduled Maintenance' : '🛠️ Maintenance',
            message,
            severity: 'info'
        });
    }

    // Utility methods
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    generateNotificationId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Statistics
    getNotificationStats() {
        return {
            queueSize: this.notificationQueue.length,
            isProcessing: this.isProcessing,
            providers: {
                email: !!this.emailTransporter,
                discord: !!this.discordWebhook,
                sms: !!this.smsClient
            }
        };
    }
}