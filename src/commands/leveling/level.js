import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your or another user\'s level')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check level for')
        ),
    cooldown: 5,
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const levelData = await interaction.client.levelingManager.getLevel(targetUser.id);

        // Create progress bar
        const progressBarLength = 20;
        const filledBars = Math.round((levelData.progress / 100) * progressBarLength);
        const emptyBars = progressBarLength - filledBars;
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('📈 Level Information')
            .setDescription(`**${targetUser.username}**'s level stats`)
            .addFields(
                { name: '🏆 Level', value: levelData.level.toString(), inline: true },
                { name: '⭐ Total XP', value: levelData.xp.toLocaleString(), inline: true },
                { name: '📊 Progress', value: `${Math.round(levelData.progress)}%`, inline: true },
                { name: '🎯 Current Level XP', value: `${levelData.progressXP.toLocaleString()} / ${levelData.neededXP.toLocaleString()}`, inline: false },
                { name: '🚀 Next Level', value: `${levelData.neededXP - levelData.progressXP} XP needed`, inline: true },
                { name: '📏 Progress Bar', value: progressBar, inline: false }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};