import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true)
        ),
    cooldown: 1,
    async execute(interaction) {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You don\'t have permission to warn members!')
                ],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        // Check if user is trying to warn themselves
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You cannot warn yourself!')
                ],
                ephemeral: true
            });
        }

        // Check if user is trying to warn the bot
        if (targetUser.id === interaction.client.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You cannot warn me!')
                ],
                ephemeral: true
            });
        }

        try {
            const result = await interaction.client.moderationManager.warn(
                interaction.guild,
                targetUser,
                interaction.user,
                reason
            );

            if (result.success) {
                await interaction.reply({ embeds: [result.embed] });

                // Send DM to warned user
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#FFFF00')
                        .setTitle('⚠️ You have been warned')
                        .addFields(
                            { name: 'Server', value: interaction.guild.name, inline: true },
                            { name: 'Moderator', value: interaction.user.tag, inline: true },
                            { name: 'Warning Count', value: result.warnCount.toString(), inline: true },
                            { name: 'Reason', value: reason, inline: false }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (error) {
                    // User has DMs disabled
                    console.log(`Could not send DM to ${targetUser.tag}`);
                }

                // Handle auto-escalation
                if (result.autoAction) {
                    const followUpEmbed = new EmbedBuilder()
                        .setColor('#FF8C00')
                        .setTitle('🔄 Auto-Escalation Triggered')
                        .setDescription(`Due to multiple warnings, additional action was taken.`)
                        .setTimestamp();

                    await interaction.followUp({ embeds: [followUpEmbed] });
                }

            } else {
                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ Failed to warn user: ${result.error}`)
                    ],
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Warn command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ An error occurred while trying to warn the user!')
                ],
                ephemeral: true
            });
        }
    },
};