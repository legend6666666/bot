import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/Logger.js';

export class GameManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.activeGames = new Map();
        this.gameStats = new Map();
        this.tournaments = new Map();
        this.leaderboards = new Map();
        
        this.initializeGames();
    }

    async initialize() {
        this.logger.info('Game manager initialized');
        await this.loadGameStats();
    }

    initializeGames() {
        this.games = {
            trivia: {
                name: 'Trivia',
                description: 'Test your knowledge',
                minPlayers: 1,
                maxPlayers: 10,
                duration: 30000 // 30 seconds per question
            },
            rps: {
                name: 'Rock Paper Scissors',
                description: 'Classic hand game',
                minPlayers: 1,
                maxPlayers: 2,
                duration: 15000 // 15 seconds to choose
            },
            slots: {
                name: 'Slot Machine',
                description: 'Try your luck',
                minPlayers: 1,
                maxPlayers: 1,
                duration: 5000 // 5 seconds
            },
            blackjack: {
                name: 'Blackjack',
                description: 'Beat the dealer',
                minPlayers: 1,
                maxPlayers: 6,
                duration: 30000 // 30 seconds per turn
            },
            hangman: {
                name: 'Hangman',
                description: 'Guess the word',
                minPlayers: 1,
                maxPlayers: 10,
                duration: 60000 // 60 seconds
            },
            duel: {
                name: 'Duel',
                description: 'Battle another player',
                minPlayers: 2,
                maxPlayers: 2,
                duration: 45000 // 45 seconds per turn
            }
        };

        this.triviaCategories = [
            'general', 'science', 'history', 'geography', 'sports', 
            'entertainment', 'art', 'literature', 'music', 'movies'
        ];

        this.triviaQuestions = {
            general: [
                {
                    question: "What is the capital of France?",
                    answers: ["London", "Berlin", "Paris", "Madrid"],
                    correct: 2,
                    difficulty: "easy"
                },
                {
                    question: "Which planet is known as the Red Planet?",
                    answers: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correct: 1,
                    difficulty: "easy"
                }
            ],
            science: [
                {
                    question: "What is the chemical symbol for gold?",
                    answers: ["Go", "Gd", "Au", "Ag"],
                    correct: 2,
                    difficulty: "medium"
                },
                {
                    question: "What is the speed of light in vacuum?",
                    answers: ["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "298,792,458 m/s"],
                    correct: 0,
                    difficulty: "hard"
                }
            ]
        };
    }

    async loadGameStats() {
        try {
            if (this.database && this.database.db) {
                const stats = await this.database.db.all('SELECT * FROM game_stats');
                stats.forEach(stat => {
                    const key = `${stat.user_id}_${stat.game}`;
                    this.gameStats.set(key, stat);
                });
            }
        } catch (error) {
            this.logger.error('Error loading game stats:', error);
        }
    }

    // Trivia Game
    async startTrivia(interaction, category = 'general', difficulty = 'easy') {
        try {
            const gameId = this.generateGameId();
            const questions = this.triviaQuestions[category] || this.triviaQuestions.general;
            const question = questions[Math.floor(Math.random() * questions.length)];

            const game = {
                id: gameId,
                type: 'trivia',
                players: [interaction.user.id],
                question,
                category,
                difficulty,
                startTime: Date.now(),
                answers: new Map(),
                status: 'active'
            };

            this.activeGames.set(gameId, game);

            const embed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle('🧠 Trivia Challenge')
                .setDescription(`**Category:** ${category}\n**Difficulty:** ${difficulty}\n\n**Question:** ${question.question}`)
                .addFields({ name: 'Time Limit', value: '30 seconds', inline: true })
                .setFooter({ text: `Game ID: ${gameId}` })
                .setTimestamp();

            const buttons = new ActionRowBuilder()
                .addComponents(
                    ...question.answers.map((answer, index) => 
                        new ButtonBuilder()
                            .setCustomId(`trivia_answer_${gameId}_${index}`)
                            .setLabel(`${index + 1}. ${answer}`)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

            await interaction.reply({ embeds: [embed], components: [buttons] });

            // Set timeout for question
            setTimeout(() => {
                this.endTrivia(gameId, interaction);
            }, 30000);

            return { success: true, gameId };

        } catch (error) {
            this.logger.error('Error starting trivia:', error);
            return { success: false, error: 'Failed to start trivia game' };
        }
    }

    async answerTrivia(interaction, gameId, answerIndex) {
        try {
            const game = this.activeGames.get(gameId);
            if (!game || game.type !== 'trivia') {
                return { success: false, error: 'Game not found' };
            }

            if (game.status !== 'active') {
                return { success: false, error: 'Game is no longer active' };
            }

            const userId = interaction.user.id;
            const isCorrect = answerIndex === game.question.correct;
            
            game.answers.set(userId, { answer: answerIndex, correct: isCorrect });

            const embed = new EmbedBuilder()
                .setColor(isCorrect ? '#00FF00' : '#FF0000')
                .setTitle(isCorrect ? '✅ Correct!' : '❌ Wrong!')
                .setDescription(isCorrect ? 
                    'Great job! You got it right!' : 
                    `The correct answer was: **${game.question.answers[game.question.correct]}**`)
                .setTimestamp();

            if (isCorrect) {
                // Award points and coins
                await this.updateGameStats(userId, 'trivia', true);
                embed.addFields({ name: 'Rewards', value: '+50 XP, +100 coins' });
            } else {
                await this.updateGameStats(userId, 'trivia', false);
            }

            game.status = 'completed';
            await interaction.update({ embeds: [embed], components: [] });

            return { success: true, correct: isCorrect };

        } catch (error) {
            this.logger.error('Error answering trivia:', error);
            return { success: false, error: 'Failed to process answer' };
        }
    }

    async endTrivia(gameId, interaction) {
        try {
            const game = this.activeGames.get(gameId);
            if (!game || game.status !== 'active') return;

            game.status = 'expired';

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⏰ Time\'s Up!')
                .setDescription(`The correct answer was: **${game.question.answers[game.question.correct]}**`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], components: [] });
            this.activeGames.delete(gameId);

        } catch (error) {
            this.logger.error('Error ending trivia:', error);
        }
    }

    // Rock Paper Scissors
    async startRPS(interaction, opponent = null) {
        try {
            const gameId = this.generateGameId();
            const choices = ['rock', 'paper', 'scissors'];
            const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

            if (!opponent) {
                // Play against bot
                const botChoice = choices[Math.floor(Math.random() * choices.length)];
                
                const embed = new EmbedBuilder()
                    .setColor('#9932CC')
                    .setTitle('🎮 Rock Paper Scissors')
                    .setDescription('Choose your move!')
                    .setTimestamp();

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`rps_choice_${gameId}_rock`)
                            .setLabel('Rock')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🪨'),
                        new ButtonBuilder()
                            .setCustomId(`rps_choice_${gameId}_paper`)
                            .setLabel('Paper')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('📄'),
                        new ButtonBuilder()
                            .setCustomId(`rps_choice_${gameId}_scissors`)
                            .setLabel('Scissors')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('✂️')
                    );

                const game = {
                    id: gameId,
                    type: 'rps',
                    players: [interaction.user.id],
                    botChoice,
                    status: 'waiting_choice'
                };

                this.activeGames.set(gameId, game);
                await interaction.reply({ embeds: [embed], components: [buttons] });

                return { success: true, gameId };
            }

            return { success: false, error: 'Multiplayer RPS not implemented yet' };

        } catch (error) {
            this.logger.error('Error starting RPS:', error);
            return { success: false, error: 'Failed to start RPS game' };
        }
    }

    async playRPS(interaction, gameId, userChoice) {
        try {
            const game = this.activeGames.get(gameId);
            if (!game || game.type !== 'rps') {
                return { success: false, error: 'Game not found' };
            }

            const botChoice = game.botChoice;
            const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
            
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
                await this.updateGameStats(interaction.user.id, 'rps', true);
                embed.addFields({ name: 'Reward', value: '+25 coins' });
            } else if (result === 'lose') {
                await this.updateGameStats(interaction.user.id, 'rps', false);
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
            this.activeGames.delete(gameId);

            return { success: true, result };

        } catch (error) {
            this.logger.error('Error playing RPS:', error);
            return { success: false, error: 'Failed to process RPS move' };
        }
    }

    // Slot Machine
    async playSlots(interaction, bet = 100) {
        try {
            const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
            const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

            let won = false;
            let multiplier = 0;
            let winnings = 0;

            if (slot1 === slot2 && slot2 === slot3) {
                won = true;
                multiplier = slot1 === '💎' ? 10 : slot1 === '⭐' ? 5 : 3;
                winnings = bet * multiplier;
            }

            const embed = new EmbedBuilder()
                .setColor(won ? '#00FF00' : '#FF0000')
                .setTitle('🎰 Slot Machine')
                .setDescription(`${slot1} ${slot2} ${slot3}`)
                .addFields(
                    { name: 'Bet', value: `${bet} coins`, inline: true },
                    { name: 'Result', value: won ? `JACKPOT! x${multiplier}` : 'No match', inline: true },
                    { name: 'Winnings', value: won ? `${winnings} coins` : '0 coins', inline: true }
                )
                .setTimestamp();

            await this.updateGameStats(interaction.user.id, 'slots', won);

            await interaction.reply({ embeds: [embed] });

            return { success: true, won, winnings };

        } catch (error) {
            this.logger.error('Error playing slots:', error);
            return { success: false, error: 'Failed to play slots' };
        }
    }

    // Number Guessing Game
    async startNumberGuess(interaction, min = 1, max = 100) {
        try {
            const gameId = this.generateGameId();
            const targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;

            const game = {
                id: gameId,
                type: 'guess',
                players: [interaction.user.id],
                targetNumber,
                min,
                max,
                attempts: 0,
                maxAttempts: Math.ceil(Math.log2(max - min + 1)) + 2,
                status: 'active',
                startTime: Date.now()
            };

            this.activeGames.set(gameId, game);

            const embed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle('🎯 Number Guessing Game')
                .setDescription(`I'm thinking of a number between **${min}** and **${max}**!\nYou have **${game.maxAttempts}** attempts to guess it.`)
                .addFields(
                    { name: 'Range', value: `${min} - ${max}`, inline: true },
                    { name: 'Attempts Left', value: game.maxAttempts.toString(), inline: true }
                )
                .setFooter({ text: 'Type your guess in chat!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            return { success: true, gameId };

        } catch (error) {
            this.logger.error('Error starting number guess:', error);
            return { success: false, error: 'Failed to start guessing game' };
        }
    }

    // Duel System
    async startDuel(interaction, opponent) {
        try {
            const gameId = this.generateGameId();
            
            const player1Stats = await this.getPlayerStats(interaction.user.id);
            const player2Stats = await this.getPlayerStats(opponent.id);

            const game = {
                id: gameId,
                type: 'duel',
                players: [interaction.user.id, opponent.id],
                player1: {
                    id: interaction.user.id,
                    hp: 100,
                    attack: player1Stats.attack || 20,
                    defense: player1Stats.defense || 10
                },
                player2: {
                    id: opponent.id,
                    hp: 100,
                    attack: player2Stats.attack || 20,
                    defense: player2Stats.defense || 10
                },
                currentTurn: interaction.user.id,
                status: 'active',
                round: 1
            };

            this.activeGames.set(gameId, game);

            const embed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('⚔️ Duel Started!')
                .setDescription(`${interaction.user} vs ${opponent}`)
                .addFields(
                    { name: `${interaction.user.username}`, value: `HP: ${game.player1.hp}/100\nATK: ${game.player1.attack}\nDEF: ${game.player1.defense}`, inline: true },
                    { name: `${opponent.username}`, value: `HP: ${game.player2.hp}/100\nATK: ${game.player2.attack}\nDEF: ${game.player2.defense}`, inline: true },
                    { name: 'Current Turn', value: `${interaction.user}`, inline: false }
                )
                .setTimestamp();

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`duel_attack_${gameId}`)
                        .setLabel('Attack')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('⚔️'),
                    new ButtonBuilder()
                        .setCustomId(`duel_defend_${gameId}`)
                        .setLabel('Defend')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🛡️'),
                    new ButtonBuilder()
                        .setCustomId(`duel_special_${gameId}`)
                        .setLabel('Special')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('✨')
                );

            await interaction.reply({ embeds: [embed], components: [buttons] });

            return { success: true, gameId };

        } catch (error) {
            this.logger.error('Error starting duel:', error);
            return { success: false, error: 'Failed to start duel' };
        }
    }

    // Game Statistics
    async updateGameStats(userId, game, won) {
        try {
            const key = `${userId}_${game}`;
            let stats = this.gameStats.get(key) || {
                user_id: userId,
                game,
                wins: 0,
                losses: 0,
                draws: 0,
                total_played: 0,
                best_score: 0,
                last_played: new Date()
            };

            stats.total_played++;
            if (won === true) {
                stats.wins++;
            } else if (won === false) {
                stats.losses++;
            } else {
                stats.draws++;
            }
            stats.last_played = new Date();

            this.gameStats.set(key, stats);

            // Save to database
            if (this.database && this.database.db) {
                await this.database.db.run(`
                    INSERT OR REPLACE INTO game_stats 
                    (user_id, game, wins, losses, draws, total_played, best_score, last_played)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [userId, game, stats.wins, stats.losses, stats.draws, stats.total_played, stats.best_score, stats.last_played]);
            }

        } catch (error) {
            this.logger.error('Error updating game stats:', error);
        }
    }

    async getPlayerStats(userId) {
        const key = `${userId}_duel`;
        const stats = this.gameStats.get(key);
        
        return {
            attack: 20 + (stats?.wins || 0) * 2,
            defense: 10 + (stats?.wins || 0),
            level: Math.floor((stats?.total_played || 0) / 10) + 1
        };
    }

    async getGameLeaderboard(game, limit = 10) {
        try {
            const leaderboard = [];
            
            for (const [key, stats] of this.gameStats.entries()) {
                if (stats.game === game) {
                    leaderboard.push(stats);
                }
            }

            leaderboard.sort((a, b) => {
                const scoreA = a.wins * 3 + a.draws;
                const scoreB = b.wins * 3 + b.draws;
                return scoreB - scoreA;
            });

            return leaderboard.slice(0, limit);

        } catch (error) {
            this.logger.error('Error getting game leaderboard:', error);
            return [];
        }
    }

    // Tournament System
    async createTournament(guildId, game, name, maxPlayers = 8) {
        try {
            const tournamentId = this.generateGameId();
            
            const tournament = {
                id: tournamentId,
                guildId,
                game,
                name,
                maxPlayers,
                players: [],
                status: 'registration',
                rounds: [],
                winner: null,
                createdAt: new Date()
            };

            this.tournaments.set(tournamentId, tournament);

            return { success: true, tournament };

        } catch (error) {
            this.logger.error('Error creating tournament:', error);
            return { success: false, error: 'Failed to create tournament' };
        }
    }

    // Utility Methods
    generateGameId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getActiveGame(gameId) {
        return this.activeGames.get(gameId);
    }

    endGame(gameId) {
        this.activeGames.delete(gameId);
    }

    getUserGameStats(userId, game) {
        const key = `${userId}_${game}`;
        return this.gameStats.get(key);
    }

    getAllUserStats(userId) {
        const userStats = [];
        for (const [key, stats] of this.gameStats.entries()) {
            if (stats.user_id === userId) {
                userStats.push(stats);
            }
        }
        return userStats;
    }

    getAvailableGames() {
        return Object.keys(this.games);
    }

    getGameInfo(gameName) {
        return this.games[gameName];
    }

    // Cleanup old games
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        for (const [gameId, game] of this.activeGames.entries()) {
            if (now - game.startTime > maxAge) {
                this.activeGames.delete(gameId);
            }
        }
    }
}