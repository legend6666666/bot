import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server leaderboard')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of leaderboard')
                .addChoices(
                    { name: 'Level', value: 'level' },
                    { name: 'Coins', value: 'coins' }
                )
        )
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number')
                .setMinValue(1)
        ),
    cooldown: 10,
    async execute(interaction) {
        const type = interaction.options.getString('type') || 'level';
        const page = interaction.options.getInteger('page') || 1;
        const limit = 10;

        const leaderboard = await interaction.client.database.getLeaderboard(type, limit * page);
        
        if (leaderboard.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ No data found for the leaderboard!')
                ],
                ephemeral: true
            });
        }

        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, leaderboard.length);
        const pageData = leaderboard.slice(startIndex, endIndex);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`🏆 ${type === 'level' ? 'Level' : 'Economy'} Leaderboard`)
            .setDescription(`Top ${type === 'level' ? 'leveled' : 'richest'} users in ${interaction.guild.name}`)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: `Page ${page} • ${leaderboard.length} total users` })
            .setTimestamp();

        let leaderboardText = '';
        for (let i = 0; i < pageData.length; i++) {
            const user = pageData[i];
            const position = startIndex + i + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅';
            
            try {
                const discordUser = await interaction.client.users.fetch(user.id);
                const value = type === 'level' ? `Level ${user.level}` : `${user.coins.toLocaleString()} coins`;
                leaderboardText += `${medal} **${position}.** ${discordUser.username} - ${value}\n`;
            } catch (error) {
                // User not found, skip
                continue;
            }
        }

        embed.addFields({ name: 'Rankings', value: leaderboardText || 'No users found' });

        // Add user's position if not on current page
        try {
            const userPosition = leaderboard.findIndex(u => u.id === interaction.user.id) + 1;
            if (userPosition > 0 && (userPosition < startIndex + 1 || userPosition > endIndex)) {
                const userData = leaderboard[userPosition - 1];
                const value = type === 'level' ? `Level ${userData.level}` : `${userData.coins.toLocaleString()} coins`;
                embed.addFields({ 
                    name: 'Your Position', 
                    value: `**${userPosition}.** ${interaction.user.username} - ${value}` 
                });
            }
        } catch (error) {
            // User not in leaderboard
        }

        await interaction.reply({ embeds: [embed] });
    },
};