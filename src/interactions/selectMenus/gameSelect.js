import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    customId: 'game_select',
    async execute(interaction) {
        const gameType = interaction.values[0];
        
        switch (gameType) {
            case 'trivia':
                await this.startTrivia(interaction);
                break;
            case 'rps':
                await this.startRPS(interaction);
                break;
            case 'slots':
                await this.startSlots(interaction);
                break;
            default:
                await interaction.reply({
                    content: '❌ Invalid game selection',
                    ephemeral: true
                });
        }
    },
    
    async startTrivia(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🧠 Trivia Challenge')
            .setDescription('Test your knowledge with a random trivia question!')
            .addFields(
                { name: 'Categories', value: 'General, Science, History, Geography, Entertainment', inline: true },
                { name: 'Difficulty', value: 'Easy, Medium, Hard', inline: true }
            )
            .setTimestamp();

        const controls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('game_control_start_trivia')
                    .setLabel('Start Trivia')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('game_select_category')
                    .setLabel('Select Category')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('game_select_difficulty')
                    .setLabel('Select Difficulty')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        await interaction.update({ embeds: [embed], components: [controls] });
    },
    
    async startRPS(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('🎮 Rock Paper Scissors')
            .setDescription('Choose your move to play against the bot!')
            .setTimestamp();

        const controls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('game_control_rock_rps')
                    .setLabel('Rock')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🪨'),
                new ButtonBuilder()
                    .setCustomId('game_control_paper_rps')
                    .setLabel('Paper')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📄'),
                new ButtonBuilder()
                    .setCustomId('game_control_scissors_rps')
                    .setLabel('Scissors')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('✂️')
            );

        await interaction.update({ embeds: [embed], components: [controls] });
    },
    
    async startSlots(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#FF9800')
            .setTitle('🎰 Slot Machine')
            .setDescription('Try your luck with the slot machine!')
            .addFields(
                { name: '💰 How to Play', value: 'Click the Spin button to try your luck!', inline: false },
                { name: '🏆 Winning Combinations', value: '3 matching symbols = Jackpot (3-10x)\n2 matching symbols = Small Win (1.5x)', inline: false }
            )
            .setTimestamp();

        const controls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('game_control_spin_slots')
                    .setLabel('Spin')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎰')
            );

        await interaction.update({ embeds: [embed], components: [controls] });
    }
};