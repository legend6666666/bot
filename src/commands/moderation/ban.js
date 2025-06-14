import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
        )
        .addIntegerOption(option =>
            option.setName('delete_days')
                .setDescription('Days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
        ),
    cooldown: 2,
    async execute(interaction) {
        // Check permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You don\'t have permission to ban members!')
                ],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') || 0;

        // Check if user is trying to ban themselves
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You cannot ban yourself!')
                ],
                ephemeral: true
            });
        }

        // Check if user is trying to ban the bot
        if (targetUser.id === interaction.client.user.id) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ I cannot ban myself!')
                ],
                ephemeral: true
            });
        }

        try {
            // Check if user is in the guild
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            
            if (targetMember) {
                // Check role hierarchy
                if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ You cannot ban someone with a higher or equal role!')
                        ],
                        ephemeral: true
                    });
                }

                // Check if bot can ban the user
                if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ I cannot ban someone with a higher or equal role than me!')
                        ],
                        ephemeral: true
                    });
                }
            }

            const result = await interaction.client.moderationManager.ban(
                interaction.guild,
                targetUser,
                interaction.user,
                reason,
                deleteDays
            );

            if (result.success) {
                await interaction.reply({ embeds: [result.embed] });
            } else {
                await interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ Failed to ban user: ${result.error}`)
                    ],
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Ban command error:', error);
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ An error occurred while trying to ban the user!')
                ],
                ephemeral: true
            });
        }
    },
};