import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check balance for')
        ),
    cooldown: 3,
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const balance = await interaction.client.economyManager.getBalance(targetUser.id);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('💰 Balance')
            .setDescription(`**${targetUser.username}**'s balance`)
            .addFields(
                { name: '💵 Wallet', value: `${interaction.client.economyManager.formatCoins(balance.coins)} coins`, inline: true },
                { name: '🏦 Bank', value: `${interaction.client.economyManager.formatCoins(balance.bank)} coins`, inline: true },
                { name: '💎 Total', value: `${interaction.client.economyManager.formatCoins(balance.total)} coins`, inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};