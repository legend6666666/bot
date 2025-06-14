import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/Logger.js';

export class UtilityManager {
    constructor() {
        this.logger = new Logger();
        this.reminders = new Map();
        this.polls = new Map();
        this.qrCodeCache = new Map();
        this.urlShortener = new Map();
        this.translations = new Map();
        
        this.initializeUtilities();
    }

    async initialize() {
        this.logger.info('Utility manager initialized');
        this.startReminderCheck();
    }

    initializeUtilities() {
        this.timeUnits = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
            w: 7 * 24 * 60 * 60 * 1000
        };

        this.mathOperators = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => a / b,
            '%': (a, b) => a % b,
            '^': (a, b) => Math.pow(a, b),
            '**': (a, b) => Math.pow(a, b)
        };

        this.mathFunctions = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            log: Math.log,
            ln: Math.log,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round,
            pi: Math.PI,
            e: Math.E
        };
    }

    // Server Information
    async getServerInfo(guild) {
        try {
            const owner = await guild.fetchOwner();
            const channels = guild.channels.cache;
            const roles = guild.roles.cache;
            const emojis = guild.emojis.cache;
            
            const channelCounts = {
                text: channels.filter(c => c.type === 0).size,
                voice: channels.filter(c => c.type === 2).size,
                category: channels.filter(c => c.type === 4).size,
                stage: channels.filter(c => c.type === 13).size,
                forum: channels.filter(c => c.type === 15).size
            };

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`📊 ${guild.name} Server Information`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '🆔 Server ID', value: guild.id, inline: true },
                    { name: '👑 Owner', value: `${owner.user.tag}`, inline: true },
                    { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '👥 Members', value: guild.memberCount.toLocaleString(), inline: true },
                    { name: '🤖 Bots', value: guild.members.cache.filter(m => m.user.bot).size.toString(), inline: true },
                    { name: '🟢 Online', value: guild.members.cache.filter(m => m.presence?.status === 'online').size.toString(), inline: true },
                    { name: '💬 Text Channels', value: channelCounts.text.toString(), inline: true },
                    { name: '🔊 Voice Channels', value: channelCounts.voice.toString(), inline: true },
                    { name: '📁 Categories', value: channelCounts.category.toString(), inline: true },
                    { name: '🎭 Roles', value: roles.size.toString(), inline: true },
                    { name: '😀 Emojis', value: emojis.size.toString(), inline: true },
                    { name: '🚀 Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
                    { name: '💎 Boosts', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
                    { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
                    { name: '🛡️ Content Filter', value: guild.explicitContentFilter.toString(), inline: true }
                )
                .setFooter({ text: `Server Features: ${guild.features.join(', ') || 'None'}` })
                .setTimestamp();

            if (guild.description) {
                embed.setDescription(guild.description);
            }

            if (guild.bannerURL()) {
                embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
            }

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting server info:', error);
            return { success: false, error: 'Failed to get server information' };
        }
    }

    // User Information
    async getUserInfo(user, member = null) {
        try {
            const embed = new EmbedBuilder()
                .setColor(member?.displayHexColor || '#0099FF')
                .setTitle(`👤 ${user.username} User Information`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '🆔 User ID', value: user.id, inline: true },
                    { name: '🏷️ Tag', value: user.tag, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true }
                );

            if (member) {
                embed.addFields(
                    { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                    { name: '🎨 Display Name', value: member.displayName, inline: true },
                    { name: '🎭 Roles', value: member.roles.cache.filter(r => r.id !== member.guild.id).map(r => r.toString()).join(', ') || 'None', inline: false },
                    { name: '🔑 Permissions', value: member.permissions.has('Administrator') ? 'Administrator' : 'Member', inline: true }
                );

                if (member.premiumSince) {
                    embed.addFields({ name: '💎 Boosting Since', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`, inline: true });
                }

                if (member.presence) {
                    const statusEmojis = {
                        online: '🟢',
                        idle: '🟡',
                        dnd: '🔴',
                        offline: '⚫'
                    };
                    embed.addFields({ name: '📱 Status', value: `${statusEmojis[member.presence.status]} ${member.presence.status}`, inline: true });
                }
            }

            if (user.bannerURL()) {
                embed.setImage(user.bannerURL({ dynamic: true, size: 1024 }));
            }

            return { success: true, embed };

        } catch (error) {
            this.logger.error('Error getting user info:', error);
            return { success: false, error: 'Failed to get user information' };
        }
    }

    // Reminder System
    async createReminder(userId, time, message) {
        try {
            const duration = this.parseTime(time);
            if (!duration) {
                return { success: false, error: 'Invalid time format. Use formats like: 1h, 30m, 2d' };
            }

            const reminderId = this.generateId();
            const reminderTime = Date.now() + duration;

            const reminder = {
                id: reminderId,
                userId,
                message,
                time: reminderTime,
                created: Date.now()
            };

            this.reminders.set(reminderId, reminder);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('⏰ Reminder Set')
                .setDescription(`I'll remind you about: **${message}**`)
                .addFields(
                    { name: 'Reminder Time', value: `<t:${Math.floor(reminderTime / 1000)}:F>`, inline: true },
                    { name: 'Duration', value: this.formatDuration(duration), inline: true }
                )
                .setTimestamp();

            return { success: true, embed, reminderId };

        } catch (error) {
            this.logger.error('Error creating reminder:', error);
            return { success: false, error: 'Failed to create reminder' };
        }
    }

    // Calculator
    async calculate(expression) {
        try {
            // Sanitize expression
            const sanitized = expression
                .replace(/[^0-9+\-*/().\s]/g, '')
                .replace(/\s+/g, '');

            if (!sanitized) {
                return { success: false, error: 'Invalid mathematical expression' };
            }

            // Basic validation
            if (sanitized.includes('..') || sanitized.includes('++') || sanitized.includes('--')) {
                return { success: false, error: 'Invalid expression format' };
            }

            // Evaluate safely
            let result;
            try {
                result = Function(`"use strict"; return (${sanitized})`)();
            } catch (evalError) {
                return { success: false, error: 'Invalid mathematical expression' };
            }

            if (!isFinite(result)) {
                return { success: false, error: 'Result is not a finite number' };
            }

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🧮 Calculator')
                .addFields(
                    { name: 'Expression', value: `\`${expression}\``, inline: false },
                    { name: 'Result', value: `\`${result}\``, inline: false }
                )
                .setTimestamp();

            return { success: true, embed, result };

        } catch (error) {
            this.logger.error('Error calculating:', error);
            return { success: false, error: 'Failed to calculate expression' };
        }
    }

    // QR Code Generator
    async generateQR(text, size = 'medium') {
        try {
            const sizes = {
                small: '150x150',
                medium: '300x300',
                large: '500x500'
            };

            const qrSize = sizes[size] || sizes.medium;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(text)}`;

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📱 QR Code Generated')
                .setDescription(`QR Code for: \`${text.slice(0, 100)}${text.length > 100 ? '...' : ''}\``)
                .setImage(qrUrl)
                .setTimestamp();

            return { success: true, embed, url: qrUrl };

        } catch (error) {
            this.logger.error('Error generating QR code:', error);
            return { success: false, error: 'Failed to generate QR code' };
        }
    }

    // Poll System
    async createPoll(question, options, duration = 60000) {
        try {
            const pollId = this.generateId();
            const endTime = Date.now() + duration;

            const poll = {
                id: pollId,
                question,
                options: options.map(opt => ({ text: opt, votes: 0 })),
                voters: new Set(),
                endTime,
                active: true
            };

            this.polls.set(pollId, poll);

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📊 Poll Created')
                .setDescription(question)
                .addFields(
                    ...poll.options.map((opt, index) => ({
                        name: `${index + 1}. ${opt.text}`,
                        value: `0 votes`,
                        inline: true
                    }))
                )
                .setFooter({ text: `Poll ends in ${this.formatDuration(duration)}` })
                .setTimestamp();

            // Auto-end poll
            setTimeout(() => {
                this.endPoll(pollId);
            }, duration);

            return { success: true, embed, pollId };

        } catch (error) {
            this.logger.error('Error creating poll:', error);
            return { success: false, error: 'Failed to create poll' };
        }
    }

    async votePoll(pollId, userId, optionIndex) {
        try {
            const poll = this.polls.get(pollId);
            if (!poll || !poll.active) {
                return { success: false, error: 'Poll not found or has ended' };
            }

            if (poll.voters.has(userId)) {
                return { success: false, error: 'You have already voted in this poll' };
            }

            if (optionIndex < 0 || optionIndex >= poll.options.length) {
                return { success: false, error: 'Invalid option selected' };
            }

            poll.options[optionIndex].votes++;
            poll.voters.add(userId);

            return { success: true, poll };

        } catch (error) {
            this.logger.error('Error voting in poll:', error);
            return { success: false, error: 'Failed to vote in poll' };
        }
    }

    endPoll(pollId) {
        const poll = this.polls.get(pollId);
        if (poll) {
            poll.active = false;
            // In a real implementation, you would update the poll message
            this.logger.debug(`Poll ended: ${poll.question}`);
        }
    }

    // URL Shortener
    async shortenUrl(originalUrl, customAlias = null) {
        try {
            // Basic URL validation
            try {
                new URL(originalUrl);
            } catch {
                return { success: false, error: 'Invalid URL provided' };
            }

            const shortId = customAlias || this.generateShortId();
            
            if (this.urlShortener.has(shortId)) {
                return { success: false, error: 'Alias already exists' };
            }

            const shortUrl = `https://bot.ly/${shortId}`;
            
            this.urlShortener.set(shortId, {
                original: originalUrl,
                short: shortUrl,
                clicks: 0,
                created: Date.now()
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔗 URL Shortened')
                .addFields(
                    { name: 'Original URL', value: originalUrl, inline: false },
                    { name: 'Short URL', value: shortUrl, inline: false },
                    { name: 'Clicks', value: '0', inline: true }
                )
                .setTimestamp();

            return { success: true, embed, shortUrl };

        } catch (error) {
            this.logger.error('Error shortening URL:', error);
            return { success: false, error: 'Failed to shorten URL' };
        }
    }

    // Translation (Mock implementation)
    async translateText(text, targetLang, sourceLang = 'auto') {
        try {
            // This is a mock implementation
            // In a real bot, you would use Google Translate API or similar
            
            const mockTranslations = {
                'hello': { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao' },
                'goodbye': { es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', it: 'ciao' },
                'thank you': { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie' }
            };

            const lowerText = text.toLowerCase();
            const translation = mockTranslations[lowerText]?.[targetLang] || `[${targetLang.toUpperCase()}] ${text}`;

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🌐 Translation')
                .addFields(
                    { name: 'Original', value: text, inline: false },
                    { name: 'Translation', value: translation, inline: false },
                    { name: 'Language', value: `${sourceLang} → ${targetLang}`, inline: true }
                )
                .setTimestamp();

            return { success: true, embed, translation };

        } catch (error) {
            this.logger.error('Error translating text:', error);
            return { success: false, error: 'Failed to translate text' };
        }
    }

    // Utility Methods
    parseTime(timeString) {
        const regex = /(\d+)([smhdw])/g;
        let totalMs = 0;
        let match;

        while ((match = regex.exec(timeString)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];
            totalMs += value * this.timeUnits[unit];
        }

        return totalMs > 0 ? totalMs : null;
    }

    formatDuration(ms) {
        const units = [
            { name: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
            { name: 'day', ms: 24 * 60 * 60 * 1000 },
            { name: 'hour', ms: 60 * 60 * 1000 },
            { name: 'minute', ms: 60 * 1000 },
            { name: 'second', ms: 1000 }
        ];

        const parts = [];
        let remaining = ms;

        for (const unit of units) {
            const count = Math.floor(remaining / unit.ms);
            if (count > 0) {
                parts.push(`${count} ${unit.name}${count !== 1 ? 's' : ''}`);
                remaining -= count * unit.ms;
            }
        }

        return parts.slice(0, 2).join(', ') || '0 seconds';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateShortId() {
        return Math.random().toString(36).substr(2, 8);
    }

    // Reminder Check Loop
    startReminderCheck() {
        setInterval(() => {
            this.checkReminders();
        }, 10000); // Check every 10 seconds
    }

    async checkReminders() {
        const now = Date.now();
        const dueReminders = [];

        for (const [id, reminder] of this.reminders.entries()) {
            if (reminder.time <= now) {
                dueReminders.push({ id, ...reminder });
                this.reminders.delete(id);
            }
        }

        // Process due reminders
        for (const reminder of dueReminders) {
            try {
                // In a real implementation, you would send the reminder to the user
                this.logger.debug(`Reminder due: ${reminder.message} for user ${reminder.userId}`);
            } catch (error) {
                this.logger.error('Error processing reminder:', error);
            }
        }
    }

    // Statistics
    getStats() {
        return {
            activeReminders: this.reminders.size,
            activePolls: this.polls.size,
            shortenedUrls: this.urlShortener.size
        };
    }

    // Cleanup
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        // Clean up old reminders
        for (const [id, reminder] of this.reminders.entries()) {
            if (now - reminder.created > maxAge) {
                this.reminders.delete(id);
            }
        }

        // Clean up old polls
        for (const [id, poll] of this.polls.entries()) {
            if (now > poll.endTime + maxAge) {
                this.polls.delete(id);
            }
        }
    }
}