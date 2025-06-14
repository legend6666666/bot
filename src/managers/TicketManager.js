import { EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/Logger.js';

export class TicketManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.activeTickets = new Map();
        this.ticketCategories = new Map();
        this.ticketSettings = new Map();
    }

    async initialize() {
        this.logger.info('Ticket manager initialized');
        await this.loadTicketSettings();
    }

    async loadTicketSettings() {
        // Load ticket settings from database or use defaults
        this.defaultSettings = {
            categoryId: null,
            supportRoleId: null,
            transcriptsEnabled: true,
            autoCloseTime: 24 * 60 * 60 * 1000, // 24 hours
            maxTicketsPerUser: 3,
            ticketNameFormat: 'ticket-{username}-{id}'
        };
    }

    async createTicket(guild, user, subject, category = 'general', priority = 'normal') {
        try {
            // Check if user has too many open tickets
            const userTickets = await this.getUserTickets(guild.id, user.id);
            const maxTickets = this.getGuildSetting(guild.id, 'maxTicketsPerUser');
            
            if (userTickets.length >= maxTickets) {
                return {
                    success: false,
                    error: `You already have ${userTickets.length} open tickets. Please close some before creating new ones.`
                };
            }

            // Generate ticket ID
            const ticketId = this.generateTicketId();
            const channelName = this.formatTicketName(user.username, ticketId);

            // Get ticket category
            const categoryId = this.getGuildSetting(guild.id, 'categoryId');
            const supportRoleId = this.getGuildSetting(guild.id, 'supportRoleId');

            // Create ticket channel
            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    }
                ]
            });

            // Add support role permissions if configured
            if (supportRoleId) {
                await ticketChannel.permissionOverwrites.create(supportRoleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    ManageMessages: true
                });
            }

            // Save ticket to database
            const ticketData = {
                id: ticketId,
                guildId: guild.id,
                userId: user.id,
                channelId: ticketChannel.id,
                subject,
                category,
                priority,
                status: 'open',
                createdAt: new Date(),
                messages: []
            };

            await this.saveTicket(ticketData);
            this.activeTickets.set(ticketChannel.id, ticketData);

            // Create welcome embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎫 Support Ticket Created')
                .setDescription(`Hello ${user}, thank you for creating a support ticket!`)
                .addFields(
                    { name: '📋 Subject', value: subject, inline: false },
                    { name: '📂 Category', value: category, inline: true },
                    { name: '⚡ Priority', value: priority, inline: true },
                    { name: '🆔 Ticket ID', value: ticketId, inline: true },
                    { name: '📝 Instructions', value: 'Please describe your issue in detail. A staff member will assist you shortly.', inline: false }
                )
                .setFooter({ text: `Ticket created at ${new Date().toLocaleString()}` })
                .setTimestamp();

            // Create ticket controls
            const controls = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ticket_close_${ticketId}`)
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒'),
                    new ButtonBuilder()
                        .setCustomId(`ticket_claim_${ticketId}`)
                        .setLabel('Claim Ticket')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('👤'),
                    new ButtonBuilder()
                        .setCustomId(`ticket_transcript_${ticketId}`)
                        .setLabel('Generate Transcript')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📄')
                );

            await ticketChannel.send({
                content: `${user} ${supportRoleId ? `<@&${supportRoleId}>` : ''}`,
                embeds: [welcomeEmbed],
                components: [controls]
            });

            this.logger.info(`Ticket created: ${ticketId} by ${user.tag} in ${guild.name}`);

            return {
                success: true,
                ticket: ticketData,
                channel: ticketChannel
            };

        } catch (error) {
            this.logger.error('Error creating ticket:', error);
            return {
                success: false,
                error: 'Failed to create ticket. Please try again later.'
            };
        }
    }

    async closeTicket(channelId, closedBy, reason = 'No reason provided') {
        try {
            const ticket = this.activeTickets.get(channelId);
            if (!ticket) {
                return { success: false, error: 'Ticket not found.' };
            }

            const channel = await this.getTicketChannel(ticket.guildId, channelId);
            if (!channel) {
                return { success: false, error: 'Ticket channel not found.' };
            }

            // Generate transcript if enabled
            let transcript = null;
            if (this.getGuildSetting(ticket.guildId, 'transcriptsEnabled')) {
                transcript = await this.generateTranscript(channel);
            }

            // Update ticket in database
            ticket.status = 'closed';
            ticket.closedAt = new Date();
            ticket.closedBy = closedBy.id;
            ticket.closeReason = reason;
            ticket.transcript = transcript;

            await this.updateTicket(ticket);

            // Send closing message
            const closeEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Ticket Closed')
                .setDescription('This ticket has been closed.')
                .addFields(
                    { name: '👤 Closed by', value: closedBy.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '⏰ Closed at', value: new Date().toLocaleString(), inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [closeEmbed] });

            // Delete channel after delay
            setTimeout(async () => {
                try {
                    await channel.delete();
                    this.activeTickets.delete(channelId);
                } catch (error) {
                    this.logger.error('Error deleting ticket channel:', error);
                }
            }, 10000); // 10 seconds delay

            this.logger.info(`Ticket closed: ${ticket.id} by ${closedBy.tag}`);

            return {
                success: true,
                ticket,
                transcript
            };

        } catch (error) {
            this.logger.error('Error closing ticket:', error);
            return {
                success: false,
                error: 'Failed to close ticket.'
            };
        }
    }

    async claimTicket(channelId, claimedBy) {
        try {
            const ticket = this.activeTickets.get(channelId);
            if (!ticket) {
                return { success: false, error: 'Ticket not found.' };
            }

            ticket.claimedBy = claimedBy.id;
            ticket.claimedAt = new Date();

            await this.updateTicket(ticket);

            const claimEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('👤 Ticket Claimed')
                .setDescription(`This ticket has been claimed by ${claimedBy}.`)
                .setTimestamp();

            const channel = await this.getTicketChannel(ticket.guildId, channelId);
            await channel.send({ embeds: [claimEmbed] });

            return { success: true, ticket };

        } catch (error) {
            this.logger.error('Error claiming ticket:', error);
            return { success: false, error: 'Failed to claim ticket.' };
        }
    }

    async generateTranscript(channel) {
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const transcript = [];

            messages.reverse().forEach(message => {
                transcript.push({
                    author: message.author.tag,
                    content: message.content,
                    timestamp: message.createdAt.toISOString(),
                    attachments: message.attachments.map(att => att.url)
                });
            });

            return JSON.stringify(transcript, null, 2);

        } catch (error) {
            this.logger.error('Error generating transcript:', error);
            return null;
        }
    }

    async addUserToTicket(channelId, user) {
        try {
            const channel = await this.getTicketChannel(null, channelId);
            if (!channel) return false;

            await channel.permissionOverwrites.create(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            const addEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`${user} has been added to this ticket.`)
                .setTimestamp();

            await channel.send({ embeds: [addEmbed] });
            return true;

        } catch (error) {
            this.logger.error('Error adding user to ticket:', error);
            return false;
        }
    }

    async removeUserFromTicket(channelId, user) {
        try {
            const channel = await this.getTicketChannel(null, channelId);
            if (!channel) return false;

            await channel.permissionOverwrites.delete(user.id);

            const removeEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`${user} has been removed from this ticket.`)
                .setTimestamp();

            await channel.send({ embeds: [removeEmbed] });
            return true;

        } catch (error) {
            this.logger.error('Error removing user from ticket:', error);
            return false;
        }
    }

    async getUserTickets(guildId, userId) {
        try {
            // This would query the database for user's tickets
            // For now, return empty array
            return [];
        } catch (error) {
            this.logger.error('Error getting user tickets:', error);
            return [];
        }
    }

    async getTicketChannel(guildId, channelId) {
        try {
            const guild = await this.client?.guilds.fetch(guildId);
            return await guild?.channels.fetch(channelId);
        } catch (error) {
            return null;
        }
    }

    async saveTicket(ticketData) {
        try {
            if (this.database && this.database.db) {
                await this.database.db.run(
                    'INSERT INTO tickets (id, guild_id, user_id, channel_id, subject, category, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [ticketData.id, ticketData.guildId, ticketData.userId, ticketData.channelId, ticketData.subject, ticketData.category, ticketData.priority, ticketData.status]
                );
            }
        } catch (error) {
            this.logger.error('Error saving ticket:', error);
        }
    }

    async updateTicket(ticketData) {
        try {
            if (this.database && this.database.db) {
                await this.database.db.run(
                    'UPDATE tickets SET status = ?, closed_at = ?, transcript = ? WHERE id = ?',
                    [ticketData.status, ticketData.closedAt?.toISOString(), ticketData.transcript, ticketData.id]
                );
            }
        } catch (error) {
            this.logger.error('Error updating ticket:', error);
        }
    }

    generateTicketId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTicketName(username, ticketId) {
        return `ticket-${username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${ticketId.slice(-4)}`;
    }

    getGuildSetting(guildId, setting) {
        const guildSettings = this.ticketSettings.get(guildId) || this.defaultSettings;
        return guildSettings[setting] || this.defaultSettings[setting];
    }

    async setGuildSetting(guildId, setting, value) {
        let guildSettings = this.ticketSettings.get(guildId) || { ...this.defaultSettings };
        guildSettings[setting] = value;
        this.ticketSettings.set(guildId, guildSettings);
        
        // Save to database
        try {
            if (this.database && this.database.db) {
                await this.database.db.run(
                    'UPDATE guilds SET ticket_settings = ? WHERE id = ?',
                    [JSON.stringify(guildSettings), guildId]
                );
            }
        } catch (error) {
            this.logger.error('Error saving guild ticket settings:', error);
        }
    }

    isTicketChannel(channelId) {
        return this.activeTickets.has(channelId);
    }

    getTicketData(channelId) {
        return this.activeTickets.get(channelId);
    }
}