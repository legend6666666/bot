import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export class ModerationManager {
    constructor(database) {
        this.db = database;
        this.autoModSettings = new Map();
    }

    async ban(guild, user, moderator, reason = 'No reason provided', deleteMessages = 0) {
        try {
            await guild.members.ban(user, { 
                reason: `${reason} | Moderator: ${moderator.tag}`,
                deleteMessageDays: deleteMessages 
            });

            await this.db.addModLog(guild.id, user.id, moderator.id, 'ban', reason);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: moderator.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return { success: true, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async kick(guild, user, moderator, reason = 'No reason provided') {
        try {
            const member = await guild.members.fetch(user.id);
            await member.kick(`${reason} | Moderator: ${moderator.tag}`);

            await this.db.addModLog(guild.id, user.id, moderator.id, 'kick', reason);

            const embed = new EmbedBuilder()
                .setColor('#FF8C00')
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: moderator.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return { success: true, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async timeout(guild, user, moderator, duration, reason = 'No reason provided') {
        try {
            const member = await guild.members.fetch(user.id);
            const timeoutUntil = new Date(Date.now() + duration);
            
            await member.timeout(duration, `${reason} | Moderator: ${moderator.tag}`);

            await this.db.addModLog(guild.id, user.id, moderator.id, 'timeout', reason, duration);

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏰ User Timed Out')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: moderator.tag, inline: true },
                    { name: 'Duration', value: this.formatDuration(duration), inline: true },
                    { name: 'Until', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return { success: true, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async warn(guild, user, moderator, reason) {
        try {
            await this.db.addWarning(guild.id, user.id, moderator.id, reason);
            await this.db.addModLog(guild.id, user.id, moderator.id, 'warn', reason);

            const warnings = await this.db.getWarnings(guild.id, user.id);
            const warnCount = warnings.length;

            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('⚠️ User Warned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: moderator.tag, inline: true },
                    { name: 'Warning Count', value: warnCount.toString(), inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            // Auto-escalation based on warning count
            let autoAction = null;
            if (warnCount >= 5) {
                autoAction = await this.ban(guild, user, { tag: 'AutoMod', id: guild.client.user.id }, 'Automatic ban: 5+ warnings');
            } else if (warnCount >= 3) {
                autoAction = await this.timeout(guild, user, { tag: 'AutoMod', id: guild.client.user.id }, 24 * 60 * 60 * 1000, 'Automatic timeout: 3+ warnings');
            }

            return { success: true, embed, warnCount, autoAction };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async purge(channel, amount, filter = null) {
        try {
            let messages = await channel.messages.fetch({ limit: Math.min(amount, 100) });
            
            if (filter) {
                if (filter.user) {
                    messages = messages.filter(msg => msg.author.id === filter.user.id);
                }
                if (filter.contains) {
                    messages = messages.filter(msg => 
                        msg.content.toLowerCase().includes(filter.contains.toLowerCase())
                    );
                }
                if (filter.bots) {
                    messages = messages.filter(msg => msg.author.bot);
                }
                if (filter.humans) {
                    messages = messages.filter(msg => !msg.author.bot);
                }
            }

            const deletedMessages = await channel.bulkDelete(messages, true);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🧹 Messages Purged')
                .addFields(
                    { name: 'Channel', value: channel.toString(), inline: true },
                    { name: 'Messages Deleted', value: deletedMessages.size.toString(), inline: true }
                )
                .setTimestamp();

            return { success: true, count: deletedMessages.size, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async lockdown(channel, reason = 'Lockdown activated') {
        try {
            const everyone = channel.guild.roles.everyone;
            await channel.permissionOverwrites.edit(everyone, {
                SendMessages: false,
                AddReactions: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Channel Locked Down')
                .addFields(
                    { name: 'Channel', value: channel.toString(), inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return { success: true, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async unlock(channel, reason = 'Lockdown lifted') {
        try {
            const everyone = channel.guild.roles.everyone;
            await channel.permissionOverwrites.edit(everyone, {
                SendMessages: null,
                AddReactions: null,
                CreatePublicThreads: null,
                CreatePrivateThreads: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Channel Unlocked')
                .addFields(
                    { name: 'Channel', value: channel.toString(), inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return { success: true, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async slowmode(channel, seconds) {
        try {
            await channel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🐌 Slowmode Updated')
                .addFields(
                    { name: 'Channel', value: channel.toString(), inline: true },
                    { name: 'Slowmode', value: seconds === 0 ? 'Disabled' : `${seconds} seconds`, inline: true }
                )
                .setTimestamp();

            return { success: true, embed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getModLogs(guildId, userId = null, limit = 10) {
        const logs = await this.db.getModLogs(guildId, userId, limit);
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📋 Moderation Logs')
            .setTimestamp();

        if (logs.length === 0) {
            embed.setDescription('No moderation logs found.');
            return embed;
        }

        const logText = logs.map((log, index) => {
            const date = new Date(log.created_at).toLocaleDateString();
            return `**${index + 1}.** ${log.action.toUpperCase()} - <@${log.user_id}>\n` +
                   `Moderator: <@${log.moderator_id}> | Date: ${date}\n` +
                   `Reason: ${log.reason}\n`;
        }).join('\n');

        embed.setDescription(logText);
        return embed;
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    parseDuration(str) {
        const regex = /(\d+)([smhd])/g;
        let total = 0;
        let match;

        while ((match = regex.exec(str)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's': total += value * 1000; break;
                case 'm': total += value * 60 * 1000; break;
                case 'h': total += value * 60 * 60 * 1000; break;
                case 'd': total += value * 24 * 60 * 60 * 1000; break;
            }
        }

        return total;
    }
}