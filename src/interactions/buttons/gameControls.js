import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    customId: 'game_control',
    async execute(interaction) {
        const action = interaction.customId.split('_')[2];
        const gameType = interaction.customId.split('_')[3];

        switch (gameType) {
            case 'trivia':
                await this.handleTriviaGame(interaction, action);
                break;
            case 'rps':
                await this.handleRPSGame(interaction, action);
                break;
            case 'slots':
                await this.handleSlotsGame(interaction, action);
                break;
            case 'blackjack':
                await this.handleBlackjackGame(interaction, action);
                break;
        }
    },

    async handleTriviaGame(interaction, action) {
        if (action === 'start') {
            // Generate trivia question
            const question = await this.generateTriviaQuestion();
            
            const embed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle('🧠 Trivia Time!')
                .setDescription(`**Category:** ${question.category}\n**Difficulty:** ${question.difficulty}\n\n**Question:** ${question.question}`)
                .addFields({ name: 'Time Limit', value: '30 seconds', inline: true })
                .setTimestamp();

            const answerButtons = new ActionRowBuilder()
                .addComponents(
                    ...question.answers.map((answer, index) => 
                        new ButtonBuilder()
                            .setCustomId(`trivia_answer_${index}_${question.correct}`)
                            .setLabel(answer)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

            await interaction.update({ embeds: [embed], components: [answerButtons] });

            // Set timeout for question
            setTimeout(async () => {
                try {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('⏰ Time\'s Up!')
                        .setDescription(`The correct answer was: **${question.answers[question.correct]}**`)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                } catch (error) {
                    // Interaction might have been answered already
                }
            }, 30000);
        } else if (action === 'answer') {
            const [, , selectedIndex, correctIndex] = interaction.customId.split('_');
            const isCorrect = selectedIndex === correctIndex;

            const embed = new EmbedBuilder()
                .setColor(isCorrect ? '#00FF00' : '#FF0000')
                .setTitle(isCorrect ? '✅ Correct!' : '❌ Wrong!')
                .setDescription(isCorrect ? 'Great job! You got it right!' : `The correct answer was option ${parseInt(correctIndex) + 1}`)
                .setTimestamp();

            if (isCorrect) {
                // Award XP and coins
                await interaction.client.leveling.addXP(interaction.user.id, interaction.guild.id, 50);
                await interaction.client.economy.addCoins(interaction.user.id, 100, 'Trivia correct answer');
                embed.addFields({ name: 'Rewards', value: '+50 XP, +100 coins' });
            }

            await interaction.update({ embeds: [embed], components: [] });
        }
    },

    async handleRPSGame(interaction, action) {
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        
        if (choices.includes(action)) {
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            const userChoice = action;
            
            let result;
            if (userChoice === botChoice) {
                result = 'tie';
            } else if (
                (userChoice === 'rock' && botChoice === 'scissors') ||
                (userChoice === 'paper' && botChoice === 'rock') ||
                (userChoice === 'scissors' && botChoice === 'paper')
            ) {
                result = 'win';
            } else {
                result = 'lose';
            }

            const embed = new EmbedBuilder()
                .setColor(result === 'win' ? '#00FF00' : result === 'lose' ? '#FF0000' : '#FFFF00')
                .setTitle('🎮 Rock Paper Scissors')
                .setDescription(`You chose ${emojis[userChoice]} **${userChoice}**\nI chose ${emojis[botChoice]} **${botChoice}**`)
                .addFields({ 
                    name: 'Result', 
                    value: result === 'win' ? '🎉 You Win!' : result === 'lose' ? '😢 You Lose!' : '🤝 It\'s a Tie!' 
                })
                .setTimestamp();

            if (result === 'win') {
                await interaction.client.economy.addCoins(interaction.user.id, 50, 'RPS win');
                embed.addFields({ name: 'Reward', value: '+50 coins' });
            }

            const playAgainButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('game_control_start_rps')
                        .setLabel('Play Again')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔄')
                );

            await interaction.update({ embeds: [embed], components: [playAgainButton] });
        } else if (action === 'start') {
            const embed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle('🎮 Rock Paper Scissors')
                .setDescription('Choose your move!')
                .setTimestamp();

            const gameButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('game_control_rock_rps')
                        .setLabel('Rock')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🪨'),
                    new ButtonBuilder()
                        .setCustomId('game_control_paper_rps')
                        .setLabel('Paper')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📄'),
                    new ButtonBuilder()
                        .setCustomId('game_control_scissors_rps')
                        .setLabel('Scissors')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('✂️')
                );

            await interaction.update({ embeds: [embed], components: [gameButtons] });
        }
    },

    async generateTriviaQuestion() {
        const categories = ['Science', 'History', 'Geography', 'Sports', 'Entertainment'];
        const difficulties = ['Easy', 'Medium', 'Hard'];
        
        const questions = [
            {
                category: 'Science',
                difficulty: 'Easy',
                question: 'What is the chemical symbol for water?',
                answers: ['H2O', 'CO2', 'NaCl', 'O2'],
                correct: 0
            },
            {
                category: 'History',
                difficulty: 'Medium',
                question: 'In which year did World War II end?',
                answers: ['1944', '1945', '1946', '1947'],
                correct: 1
            },
            {
                category: 'Geography',
                difficulty: 'Easy',
                question: 'What is the capital of France?',
                answers: ['London', 'Berlin', 'Paris', 'Madrid'],
                correct: 2
            }
        ];

        return questions[Math.floor(Math.random() * questions.length)];
    },

    createGameMenu() {
        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('game_select')
                    .setPlaceholder('Choose a game to play')
                    .addOptions([
                        { label: '🧠 Trivia', value: 'trivia', description: 'Test your knowledge' },
                        { label: '🎮 Rock Paper Scissors', value: 'rps', description: 'Classic hand game' },
                        { label: '🎰 Slot Machine', value: 'slots', description: 'Try your luck' },
                        { label: '🃏 Blackjack', value: 'blackjack', description: 'Beat the dealer' },
                        { label: '🎯 Number Guess', value: 'guess', description: 'Guess the number' }
                    ])
            );
    }
};