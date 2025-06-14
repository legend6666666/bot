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

    async deleteReminder(userId, reminderId) {
        try {
            const reminder = this.reminders.get(reminderId);
            if (!reminder) {
                return { success: false, error: 'Reminder not found' };
            }

            if (reminder.userId !== userId) {
                return { success: false, error: 'You can only delete your own reminders' };
            }

            this.reminders.delete(reminderId);
            return { success: true, message: 'Reminder deleted successfully' };

        } catch (error) {
            this.logger.error('Error deleting reminder:', error);
            return { success: false, error: 'Failed to delete reminder' };
        }
    }

    getUserReminders(userId) {
        const userReminders = [];
        for (const [id, reminder] of this.reminders.entries()) {
            if (reminder.userId === userId) {
                userReminders.push({ id, ...reminder });
            }
        }
        return userReminders.sort((a, b) => a.time - b.time);
    }

    // Poll System
    async createPoll(channelId, question, options, duration = 300000) {
        try {
            if (options.length < 2 || options.length > 10) {
                return { success: false, error: 'Polls must have between 2 and 10 options' };
            }

            const pollId = this.generateId();
            const endTime = Date.now() + duration;

            const poll = {
                id: pollId,
                channelId,
                question,
                options: options.map((option, index) => ({
                    text: option,
                    votes: 0,
                    voters: new Set(),
                    emoji: this.getNumberEmoji(index + 1)
                })),
                endTime,
                active: true,
                voters: new Set()
            };

            this.polls.set(pollId, poll);

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📊 Poll')
                .setDescription(`**${question}**\n\n${poll.options.map(opt => `${opt.emoji} ${opt.text}`).join('\n')}`)
                .addFields({ name: 'Duration', value: this.formatDuration(duration), inline: true })
                .setFooter({ text: `Poll ID: ${pollId} • React to vote!` })
                .setTimestamp();

            // Auto-end poll
            setTimeout(() => {
                this.endPoll(pollId);
            }, duration);

            return { success: true, embed, poll };

        } catch (error) {
            this.logger.error('Error creating poll:', error);
            return { success: false, error: 'Failed to create poll' };
        }
    }

    async votePoll(pollId, userId, optionIndex) {
        try {
            const poll = this.polls.get(pollId);
            if (!poll) {
                return { success: false, error: 'Poll not found' };
            }

            if (!poll.active) {
                return { success: false, error: 'This poll has ended' };
            }

            if (poll.voters.has(userId)) {
                return { success: false, error: 'You have already voted in this poll' };
            }

            if (optionIndex < 0 || optionIndex >= poll.options.length) {
                return { success: false, error: 'Invalid option' };
            }

            // Add vote
            poll.options[optionIndex].votes++;
            poll.options[optionIndex].voters.add(userId);
            poll.voters.add(userId);

            return { success: true, poll };

        } catch (error) {
            this.logger.error('Error voting in poll:', error);
            return { success: false, error: 'Failed to vote' };
        }
    }

    async endPoll(pollId) {
        try {
            const poll = this.polls.get(pollId);
            if (!poll) return;

            poll.active = false;

            // Find winner
            const winner = poll.options.reduce((prev, current) => 
                prev.votes > current.votes ? prev : current
            );

            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('📊 Poll Results')
                .setDescription(`**${poll.question}**\n\n${poll.options.map(opt => {
                    const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const bar = this.createProgressBar(percentage);
                    return `${opt.emoji} ${opt.text}\n${bar} ${opt.votes} votes (${percentage}%)`;
                }).join('\n\n')}`)
                .addFields(
                    { name: '🏆 Winner', value: `${winner.emoji} ${winner.text}`, inline: true },
                    { name: '📊 Total Votes', value: totalVotes.toString(), inline: true }
                )
                .setTimestamp();

            return { success: true, embed, poll };

        } catch (error) {
            this.logger.error('Error ending poll:', error);
            return { success: false, error: 'Failed to end poll' };
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

    // URL Shortener (Mock)
    async shortenUrl(url, alias = null) {
        try {
            // Validate URL
            try {
                new URL(url);
            } catch {
                return { success: false, error: 'Invalid URL format' };
            }

            const shortId = alias || this.generateShortId();
            const shortUrl = `https://short.ly/${shortId}`;

            this.urlShortener.set(shortId, {
                originalUrl: url,
                shortUrl,
                clicks: 0,
                created: new Date()
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔗 URL Shortened')
                .addFields(
                    { name: 'Original URL', value: url, inline: false },
                    { name: 'Short URL', value: shortUrl, inline: false },
                    { name: 'Alias', value: shortId, inline: true }
                )
                .setTimestamp();

            return { success: true, embed, shortUrl, shortId };

        } catch (error) {
            this.logger.error('Error shortening URL:', error);
            return { success: false, error: 'Failed to shorten URL' };
        }
    }

    // Translation (Mock)
    async translateText(text, fromLang, toLang) {
        try {
            // This is a mock implementation
            // In a real bot, you would use Google Translate API or similar
            
            const translations = {
                'hello': { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao' },
                'goodbye': { es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', it: 'ciao' },
                'thank you': { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie' }
            };

            const lowerText = text.toLowerCase();
            const translation = translations[lowerText]?.[toLang] || `[Translation of "${text}" to ${toLang}]`;

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🌐 Translation')
                .addFields(
                    { name: `Original (${fromLang})`, value: text, inline: false },
                    { name: `Translation (${toLang})`, value: translation, inline: false }
                )
                .setFooter({ text: 'Note: This is a mock translation service' })
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

    getNumberEmoji(number) {
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        return emojis[number - 1] || '❓';
    }

    createProgressBar(percentage, length = 10) {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
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

    // Cleanup
    cleanup() {
        // Clean up expired polls and old data
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [id, poll] of this.polls.entries()) {
            if (now - poll.endTime > maxAge) {
                this.polls.delete(id);
            }
        }

        // Clean up old URL shortener entries
        for (const [id, data] of this.urlShortener.entries()) {
            if (now - data.created.getTime() > 30 * 24 * 60 * 60 * 1000) { // 30 days
                this.urlShortener.delete(id);
            }
        }
    }

    // Statistics
    getStats() {
        return {
            activeReminders: this.reminders.size,
            activePolls: Array.from(this.polls.values()).filter(p => p.active).length,
            totalPolls: this.polls.size,
            shortenedUrls: this.urlShortener.size
        };
    }
}