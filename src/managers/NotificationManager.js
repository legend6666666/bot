import { Logger } from '../utils/Logger.js';
import nodemailer from 'nodemailer';
import { Webhook } from 'discord.js';

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
            // Initialize email transporter
            if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                this.emailTransporter = nodemailer.createTransporter({
                    service: process.env.EMAIL_SERVICE,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
                this.logger.info('Email notifications initialized');
            }

            // Initialize Discord webhook
            if (process.env.DISCORD_WEBHOOK_URL) {
                this.discordWebhook = new Webhook(process.env.DISCORD_WEBHOOK_URL);
                this.logger.info('Discord webhook notifications initialized');
            }

            // Initialize SMS (Twilio)
            if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
                const twilio = await import('twilio');
                this.smsClient = twilio.default(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                );
                this.logger.info('SMS notifications initialized');
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
                    case 'email':
                        await this.sendEmail(data);
                        break;
                    case 'discord':
                        await this.sendDiscordNotification(data);
                        break;
                    case 'sms':
                        await this.sendSMS(data);
                        break;
                    case 'console':
                        this.sendConsoleNotification(data);
                        break;
                }
            } catch (error) {
                this.logger.error(`Failed to send ${channel} notification:`, error);
            }
        }
    }

    async sendEmail(data) {
        if (!this.emailTransporter) return;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.recipient || process.env.ADMIN_EMAIL,
            subject: data.subject || 'Bot Notification',
            html: this.generateEmailHTML(data)
        };
        
        await this.emailTransporter.sendMail(mailOptions);
        this.logger.debug('Email notification sent');
    }

    async sendDiscordNotification(data) {
        if (!this.discordWebhook) return;
        
        const embed = {
            title: data.title || 'Bot Notification',
            description: data.message,
            color: this.getColorForSeverity(data.severity),
            timestamp: new Date().toISOString(),
            footer: {
                text: 'World\'s Best Discord Bot'
            }
        };
        
        if (data.fields) {
            embed.fields = data.fields;
        }
        
        await this.discordWebhook.send({ embeds: [embed] });
        this.logger.debug('Discord webhook notification sent');
    }

    async sendSMS(data) {
        if (!this.smsClient) return;
        
        const message = `${data.title || 'Bot Alert'}: ${data.message}`;
        
        await this.smsClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: data.recipient || process.env.ADMIN_PHONE
        });
        
        this.logger.debug('SMS notification sent');
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
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
            channels: ['console', 'discord'],
            title: scheduled ? '🔧 Scheduled Maintenance' : '🛠️ Maintenance',
            message,
            severity: 'info'
        });
    }

    // Utility methods
    generateEmailHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
                .header { background-color: #7289da; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { padding: 20px; }
                .footer { background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
                .severity-critical { border-left: 4px solid #dc3545; }
                .severity-warning { border-left: 4px solid #ffc107; }
                .severity-info { border-left: 4px solid #17a2b8; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${data.title || 'Bot Notification'}</h1>
                </div>
                <div class="content severity-${data.severity || 'info'}">
                    <p>${data.message}</p>
                    ${data.fields ? data.fields.map(field => `<p><strong>${field.name}:</strong> ${field.value}</p>`).join('') : ''}
                </div>
                <div class="footer">
                    <p>World's Best Discord Bot - ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getColorForSeverity(severity) {
        const colors = {
            critical: 0xdc3545,
            error: 0xdc3545,
            warning: 0xffc107,
            info: 0x17a2b8,
            success: 0x28a745
        };
        return colors[severity] || colors.info;
    }

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

    // Configuration methods
    setEmailConfig(config) {
        if (config.service && config.user && config.pass) {
            this.emailTransporter = nodemailer.createTransporter({
                service: config.service,
                auth: {
                    user: config.user,
                    pass: config.pass
                }
            });
            this.logger.info('Email configuration updated');
        }
    }

    setDiscordWebhook(webhookUrl) {
        if (webhookUrl) {
            this.discordWebhook = new Webhook(webhookUrl);
            this.logger.info('Discord webhook updated');
        }
    }

    setSMSConfig(config) {
        if (config.accountSid && config.authToken) {
            import('twilio').then(twilio => {
                this.smsClient = twilio.default(config.accountSid, config.authToken);
                this.logger.info('SMS configuration updated');
            });
        }
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