import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default {
    customId: 'moderation_panel',
    async execute(interaction) {
        const action = interaction.customId.split('_')[2];
        const targetUserId = interaction.customId.split('_')[3];

        switch (action) {
            case 'warn':
                const warnModal = new ModalBuilder()
                    .setCustomId(`warn_modal_${targetUserId}`)
                    .setTitle('Issue Warning');

                const warnReasonInput = new TextInputBuilder()
                    .setCustomId('warn_reason')
                    .setLabel('Warning Reason')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the reason for this warning...')
                    .setRequired(true);

                const warnRow = new ActionRowBuilder().addComponents(warnReasonInput);
                warnModal.addComponents(warnRow);

                await interaction.showModal(warnModal);
                break;

            case 'timeout':
                const timeoutModal = new ModalBuilder()
                    .setCustomId(`timeout_modal_${targetUserId}`)
                    .setTitle('Timeout User');

                const timeoutDurationInput = new TextInputBuilder()
                    .setCustomId('timeout_duration')
                    .setLabel('Duration (e.g., 1h, 30m, 1d)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('1h')
                    .setRequired(true);

                const timeoutReasonInput = new TextInputBuilder()
                    .setCustomId('timeout_reason')
                    .setLabel('Reason')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the reason for timeout...')
                    .setRequired(true);

                const timeoutRow1 = new ActionRowBuilder().addComponents(timeoutDurationInput);
                const timeoutRow2 = new ActionRowBuilder().addComponents(timeoutReasonInput);
                timeoutModal.addComponents(timeoutRow1, timeoutRow2);

                await interaction.showModal(timeoutModal);
                break;

            case 'kick':
                const kickModal = new ModalBuilder()
                    .setCustomId(`kick_modal_${targetUserId}`)
                    .setTitle('Kick User');

                const kickReasonInput = new TextInputBuilder()
                    .setCustomId('kick_reason')
                    .setLabel('Kick Reason')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the reason for kicking...')
                    .setRequired(true);

                const kickRow = new ActionRowBuilder().addComponents(kickReasonInput);
                kickModal.addComponents(kickRow);

                await interaction.showModal(kickModal);
                break;

            case 'ban':
                const banModal = new ModalBuilder()
                    .setCustomId(`ban_modal_${targetUserId}`)
                    .setTitle('Ban User');

                const banReasonInput = new TextInputBuilder()
                    .setCustomId('ban_reason')
                    .setLabel('Ban Reason')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter the reason for banning...')
                    .setRequired(true);

                const banDaysInput = new TextInputBuilder()
                    .setCustomId('ban_delete_days')
                    .setLabel('Delete Messages (0-7 days)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('7')
                    .setRequired(false);

                const banRow1 = new ActionRowBuilder().addComponents(banReasonInput);
                const banRow2 = new ActionRowBuilder().addComponents(banDaysInput);
                banModal.addComponents(banRow1, banRow2);

                await interaction.showModal(banModal);
                break;

            case 'history':
                try {
                    const targetUser = await interaction.client.users.fetch(targetUserId);
                    const modLogs = await interaction.client.database.getModLogs(interaction.guild.id, targetUserId, 10);

                    const embed = new EmbedBuilder()
                        .setColor('#0099FF')
                        .setTitle(`📋 Moderation History - ${targetUser.tag}`)
                        .setThumbnail(targetUser.displayAvatarURL())
                        .setTimestamp();

                    if (modLogs.length === 0) {
                        embed.setDescription('No moderation history found.');
                    } else {
                        const logText = modLogs.map((log, index) => {
                            const date = new Date(log.created_at).toLocaleDateString();
                            return `**${index + 1}.** ${log.action.toUpperCase()} - ${date}\nReason: ${log.reason}`;
                        }).join('\n\n');

                        embed.setDescription(logText.slice(0, 4096));
                    }

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    await interaction.reply({ content: '❌ Failed to fetch moderation history.', ephemeral: true });
                }
                break;
        }
    },

    createModerationPanel(targetUserId) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`moderation_panel_warn_${targetUserId}`)
                    .setLabel('Warn')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚠️'),
                new ButtonBuilder()
                    .setCustomId(`moderation_panel_timeout_${targetUserId}`)
                    .setLabel('Timeout')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⏰'),
                new ButtonBuilder()
                    .setCustomId(`moderation_panel_kick_${targetUserId}`)
                    .setLabel('Kick')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👢'),
                new ButtonBuilder()
                    .setCustomId(`moderation_panel_ban_${targetUserId}`)
                    .setLabel('Ban')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔨'),
                new ButtonBuilder()
                    .setCustomId(`moderation_panel_history_${targetUserId}`)
                    .setLabel('History')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );
    }
};