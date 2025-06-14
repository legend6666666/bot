import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn coins'),
    cooldown: 5,
    async execute(interaction) {
        const result = await interaction.client.economyManager.work(interaction.user.id);

        if (!result.success) {
            const timeLeft = interaction.client.economyManager.formatTime(result.timeLeft);
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⏰ Work Cooldown')
                    .setDescription(`You're tired! You can work again in **${timeLeft}**`)
                ],
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('💼 Work Complete!')
            .setDescription(`You worked as a **${result.job}** and earned **${result.earnings.toLocaleString()}** coins!`)
            .addFields(
                { name: '💰 New Balance', value: `${result.newBalance.toLocaleString()} coins`, inline: true },
                { name: '⏰ Next Work', value: 'Available in 1 hour', inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};