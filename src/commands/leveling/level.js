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

        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('📈 Level Information')
            .setDescription(`**${targetUser.username}**'s level stats`)
            .addFields(
                { name: '🏆 Level', value: levelData.level.toString(), inline: true },
                { name: '⭐ Total XP', value: levelData.xp.toLocaleString(), inline: true },
                { name: '📊 Progress', value: `${Math.round(levelData.progress)}%`, inline: true },
                { name: '🎯 Current Level XP', value: `${levelData.progressXP.toLocaleString()} / ${levelData.neededXP.toLocaleString()}`, inline: false },
                { name: '🚀 Next Level', value: `${levelData.neededXP - levelData.progressXP} XP needed`, inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        // Create rank card
        try {
            const rankCard = await interaction.client.levelingManager.createRankCard(targetUser, levelData);
            const attachment = new AttachmentBuilder(rankCard, { name: 'rank-card.png' });
            
            embed.setImage('attachment://rank-card.png');
            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Error creating rank card:', error);
            await interaction.reply({ embeds: [embed] });
        }
    },
};