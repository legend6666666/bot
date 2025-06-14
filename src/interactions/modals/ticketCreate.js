import { EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';

export default {
    customId: 'ticket_create_modal',
    async execute(interaction) {
        const subject = interaction.fields.getTextInputValue('ticket_subject');
        const description = interaction.fields.getTextInputValue('ticket_description');
        const priority = interaction.fields.getTextInputValue('ticket_priority') || 'normal';

        try {
            // Create ticket channel
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}-${Date.now().toString().slice(-4)}`,
                type: ChannelType.GuildText,
                parent: process.env.TICKET_CATEGORY,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels
                        ],
                    }
                ]
            });

            // Save ticket to database
            await interaction.client.database.db.run(
                'INSERT INTO tickets (guild_id, user_id, channel_id, subject, priority) VALUES (?, ?, ?, ?, ?)',
                [interaction.guild.id, interaction.user.id, ticketChannel.id, subject, priority]
            );

            // Create ticket embed
            const ticketEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎫 Support Ticket Created')
                .setDescription(`**Subject:** ${subject}\n**Description:** ${description}\n**Priority:** ${priority}`)
                .addFields(
                    { name: 'Created by', value: interaction.user.toString(), inline: true },
                    { name: 'Channel', value: ticketChannel.toString(), inline: true },
                    { name: 'Status', value: '🟢 Open', inline: true }
                )
                .setTimestamp();

            // Create ticket controls
            const ticketControls = this.createTicketControls();

            await ticketChannel.send({ 
                content: `${interaction.user}, your ticket has been created!`,
                embeds: [ticketEmbed], 
                components: [ticketControls] 
            });

            await interaction.reply({
                content: `✅ Ticket created successfully! ${ticketChannel}`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error creating ticket:', error);
            await interaction.reply({
                content: '❌ Failed to create ticket. Please try again.',
                ephemeral: true
            });
        }
    },

    createTicketControls() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👤'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Generate Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📄')
            );
    }
};