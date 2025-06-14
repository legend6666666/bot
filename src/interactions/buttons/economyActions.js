import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    customId: 'economy_action',
    async execute(interaction) {
        const action = interaction.customId.split('_')[2];
        const userId = interaction.user.id;
        const economyManager = interaction.client.economy;

        switch (action) {
            case 'daily':
                const dailyResult = await economyManager.claimDaily(userId);
                if (dailyResult.success) {
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('🎁 Daily Reward Claimed!')
                        .setDescription(`You received **${dailyResult.amount.toLocaleString()}** coins!`)
                        .addFields(
                            { name: '💰 New Balance', value: `${dailyResult.newBalance.toLocaleString()} coins`, inline: true },
                            { name: '📅 Next Claim', value: 'Available in 24 hours', inline: true }
                        )
                        .setTimestamp();

                    await interaction.update({ embeds: [embed], components: [] });
                } else {
                    const timeLeft = economyManager.formatTime(dailyResult.timeLeft);
                    await interaction.reply({
                        content: `⏰ You can claim your daily reward again in **${timeLeft}**`,
                        ephemeral: true
                    });
                }
                break;

            case 'work':
                const workResult = await economyManager.work(userId);
                if (workResult.success) {
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('💼 Work Complete!')
                        .setDescription(`You worked as a **${workResult.job}** and earned **${workResult.earnings.toLocaleString()}** coins!`)
                        .addFields(
                            { name: '💰 New Balance', value: `${workResult.newBalance.toLocaleString()} coins`, inline: true },
                            { name: '⏰ Next Work', value: 'Available in 1 hour', inline: true }
                        )
                        .setTimestamp();

                    await interaction.update({ embeds: [embed], components: [] });
                } else {
                    const timeLeft = economyManager.formatTime(workResult.timeLeft);
                    await interaction.reply({
                        content: `⏰ You're tired! You can work again in **${timeLeft}**`,
                        ephemeral: true
                    });
                }
                break;

            case 'balance':
                const balance = await economyManager.getBalance(userId);
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('💰 Your Balance')
                    .addFields(
                        { name: '💵 Wallet', value: `${balance.coins.toLocaleString()} coins`, inline: true },
                        { name: '🏦 Bank', value: `${balance.bank.toLocaleString()} coins`, inline: true },
                        { name: '💎 Total', value: `${balance.total.toLocaleString()} coins`, inline: true }
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp();

                const economyControls = this.createEconomyControls();
                await interaction.update({ embeds: [embed], components: [economyControls] });
                break;

            case 'gamble':
                // Show gambling options
                const gamblingMenu = this.createGamblingMenu();
                await interaction.update({ components: [gamblingMenu] });
                break;
        }
    },

    createEconomyControls() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('economy_action_daily')
                    .setLabel('Daily Reward')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎁'),
                new ButtonBuilder()
                    .setCustomId('economy_action_work')
                    .setLabel('Work')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💼'),
                new ButtonBuilder()
                    .setCustomId('economy_action_gamble')
                    .setLabel('Gamble')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🎰'),
                new ButtonBuilder()
                    .setCustomId('economy_action_shop')
                    .setLabel('Shop')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛒')
            );
    },

    createGamblingMenu() {
        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('gambling_game')
                    .setPlaceholder('Choose a gambling game')
                    .addOptions([
                        { label: '🪙 Coinflip', value: 'coinflip', description: '50/50 chance, 2x payout' },
                        { label: '🎲 Dice Roll', value: 'dice', description: 'Roll 4+ to win, 1.5x payout' },
                        { label: '🎰 Slot Machine', value: 'slots', description: 'Match symbols, up to 10x payout' },
                        { label: '🃏 Blackjack', value: 'blackjack', description: 'Beat the dealer, 2x payout' }
                    ])
            );
    }
};