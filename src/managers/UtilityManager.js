import { Logger } from '../utils/Logger.js';

export class UtilityManager {
    constructor() {
        this.logger = new Logger();
        this.reminders = new Map();
        this.polls = new Map();
    }

    async initialize() {
        this.logger.info('Utility Manager initialized');
        this.startReminderCheck();
    }

    async createReminder(userId, time, message) {
        try {
            const reminderId = `${userId}_${Date.now()}`;
            const reminderTime = Date.now() + time;

            this.reminders.set(reminderId, {
                userId,
                message,
                time: reminderTime,
                created: Date.now()
            });

            return {
                success: true,
                reminderId,
                reminderTime: new Date(reminderTime)
            };

        } catch (error) {
            this.logger.error('Create reminder error:', error);
            return {
                success: false,
                error: 'Failed to create reminder'
            };
        }
    }

    async createPoll(guildId, channelId, question, options, duration = 300000) {
        try {
            const pollId = `${guildId}_${Date.now()}`;
            const endTime = Date.now() + duration;

            const poll = {
                id: pollId,
                guildId,
                channelId,
                question,
                options: options.map(option => ({ text: option, votes: 0 })),
                voters: new Set(),
                endTime,
                active: true
            };

            this.polls.set(pollId, poll);

            return {
                success: true,
                pollId,
                poll
            };

        } catch (error) {
            this.logger.error('Create poll error:', error);
            return {
                success: false,
                error: 'Failed to create poll'
            };
        }
    }

    async vote(pollId, userId, optionIndex) {
        try {
            const poll = this.polls.get(pollId);
            
            if (!poll) {
                return {
                    success: false,
                    error: 'Poll not found'
                };
            }

            if (!poll.active || Date.now() > poll.endTime) {
                return {
                    success: false,
                    error: 'Poll has ended'
                };
            }

            if (poll.voters.has(userId)) {
                return {
                    success: false,
                    error: 'You have already voted in this poll'
                };
            }

            if (optionIndex < 0 || optionIndex >= poll.options.length) {
                return {
                    success: false,
                    error: 'Invalid option'
                };
            }

            poll.options[optionIndex].votes++;
            poll.voters.add(userId);

            return {
                success: true,
                poll
            };

        } catch (error) {
            this.logger.error('Vote error:', error);
            return {
                success: false,
                error: 'Failed to vote'
            };
        }
    }

    async getPoll(pollId) {
        const poll = this.polls.get(pollId);
        
        if (!poll) {
            return {
                success: false,
                error: 'Poll not found'
            };
        }

        return {
            success: true,
            poll
        };
    }

    async calculate(expression) {
        try {
            // Basic calculator - only allow safe mathematical operations
            const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
            
            if (!sanitized) {
                return {
                    success: false,
                    error: 'Invalid expression'
                };
            }

            // Use Function constructor for safe evaluation
            const result = Function(`"use strict"; return (${sanitized})`)();
            
            if (!isFinite(result)) {
                return {
                    success: false,
                    error: 'Result is not a finite number'
                };
            }

            return {
                success: true,
                expression: sanitized,
                result
            };

        } catch (error) {
            return {
                success: false,
                error: 'Invalid mathematical expression'
            };
        }
    }

    async generateQR(text, size = 'medium') {
        try {
            const sizes = {
                small: '150x150',
                medium: '200x200',
                large: '300x300'
            };

            const qrSize = sizes[size] || sizes.medium;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(text)}`;

            return {
                success: true,
                url: qrUrl,
                text,
                size: qrSize
            };

        } catch (error) {
            this.logger.error('Generate QR error:', error);
            return {
                success: false,
                error: 'Failed to generate QR code'
            };
        }
    }

    async shortenUrl(url, alias = null) {
        try {
            // Mock URL shortener - in a real implementation, you'd use a service like bit.ly
            const shortId = alias || this.generateShortId();
            const shortUrl = `https://short.ly/${shortId}`;

            return {
                success: true,
                originalUrl: url,
                shortUrl,
                shortId,
                clicks: 0
            };

        } catch (error) {
            this.logger.error('Shorten URL error:', error);
            return {
                success: false,
                error: 'Failed to shorten URL'
            };
        }
    }

    async translateText(text, fromLang, toLang) {
        try {
            // Mock translation - in a real implementation, you'd use Google Translate API
            return {
                success: false,
                error: 'Translation service is not yet implemented. This feature will be available in a future update.'
            };

        } catch (error) {
            this.logger.error('Translate text error:', error);
            return {
                success: false,
                error: 'Failed to translate text'
            };
        }
    }

    parseTime(timeString) {
        const regex = /(\d+)([smhd])/g;
        let totalMs = 0;
        let match;

        while ((match = regex.exec(timeString)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's': totalMs += value * 1000; break;
                case 'm': totalMs += value * 60 * 1000; break;
                case 'h': totalMs += value * 60 * 60 * 1000; break;
                case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
            }
        }

        return totalMs;
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    generateShortId() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    startReminderCheck() {
        setInterval(() => {
            const now = Date.now();
            
            for (const [reminderId, reminder] of this.reminders.entries()) {
                if (now >= reminder.time) {
                    // In a real implementation, you would send the reminder to the user
                    this.logger.debug(`Reminder triggered for user ${reminder.userId}: ${reminder.message}`);
                    this.reminders.delete(reminderId);
                }
            }

            // Clean up expired polls
            for (const [pollId, poll] of this.polls.entries()) {
                if (now > poll.endTime && poll.active) {
                    poll.active = false;
                    this.logger.debug(`Poll ${pollId} has ended`);
                }
            }
        }, 10000); // Check every 10 seconds
    }

    cleanup() {
        // Clean up old reminders and polls
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

        for (const [reminderId, reminder] of this.reminders.entries()) {
            if (reminder.created < cutoff) {
                this.reminders.delete(reminderId);
            }
        }

        for (const [pollId, poll] of this.polls.entries()) {
            if (poll.endTime < cutoff) {
                this.polls.delete(pollId);
            }
        }
    }
}