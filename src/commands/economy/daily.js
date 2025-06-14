import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    cooldown: 5,
    async execute(interaction) {
        const result = await interaction.client.economyManager.claimDaily(interaction.user.id);

        if (!result.success) {
            const timeLeft = interaction.client.economyManager.formatTime(result.timeLeft);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⏰ Daily Cooldown')
                    .setDescription(`You can claim your daily reward again in **${timeLeft}**`)
                ],
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎁 Daily Reward Claimed!')
            .setDescription(`You received **${result.amount.toLocaleString()}** coins!`)
            .addFields(
                { name: '💰 New Balance', value: `${result.newBalance.toLocaleString()} coins`, inline: true },
                { name: '📅 Next Claim', value: 'Available in 24 hours', inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};