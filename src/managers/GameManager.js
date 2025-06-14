import { Logger } from '../utils/Logger.js';

export class GameManager {
    constructor(database) {
        this.logger = new Logger();
        this.database = database;
        this.activeGames = new Map();
        this.tournaments = new Map();
    }

    async initialize() {
        this.logger.info('Game Manager initialized');
    }

    async startTrivia(userId, guildId, category = 'general', difficulty = 'medium') {
        try {
            const questions = this.getTriviaQuestions(category, difficulty);
            const question = questions[Math.floor(Math.random() * questions.length)];

            const gameId = `trivia_${userId}_${Date.now()}`;
            this.activeGames.set(gameId, {
                type: 'trivia',
                userId,
                guildId,
                question,
                startTime: Date.now(),
                answered: false
            });

            return {
                success: true,
                gameId,
                question: question.question,
                options: question.options,
                category: question.category,
                difficulty: question.difficulty
            };

        } catch (error) {
            this.logger.error('Trivia start error:', error);
            return {
                success: false,
                error: 'Failed to start trivia game'
            };
        }
    }

    async answerTrivia(gameId, answerIndex) {
        try {
            const game = this.activeGames.get(gameId);
            if (!game || game.type !== 'trivia' || game.answered) {
                return {
                    success: false,
                    error: 'Game not found or already answered'
                };
            }

            const correct = answerIndex === game.question.correct;
            const timeTaken = Date.now() - game.startTime;
            
            game.answered = true;
            this.activeGames.delete(gameId);

            // Award points for correct answers
            if (correct) {
                const points = Math.max(100 - Math.floor(timeTaken / 1000) * 5, 10);
                await this.addGameStats(game.userId, 'trivia', correct ? 'win' : 'loss', points);
            }

            return {
                success: true,
                correct,
                correctAnswer: game.question.options[game.question.correct],
                timeTaken,
                points: correct ? Math.max(100 - Math.floor(timeTaken / 1000) * 5, 10) : 0
            };

        } catch (error) {
            this.logger.error('Trivia answer error:', error);
            return {
                success: false,
                error: 'Failed to process answer'
            };
        }
    }

    async playRockPaperScissors(userId, choice, opponentId = null) {
        try {
            const choices = ['rock', 'paper', 'scissors'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            
            let result;
            if (choice === botChoice) {
                result = 'tie';
            } else if (
                (choice === 'rock' && botChoice === 'scissors') ||
                (choice === 'paper' && botChoice === 'rock') ||
                (choice === 'scissors' && botChoice === 'paper')
            ) {
                result = 'win';
            } else {
                result = 'lose';
            }

            await this.addGameStats(userId, 'rps', result, result === 'win' ? 10 : 0);

            return {
                success: true,
                userChoice: choice,
                botChoice,
                result,
                points: result === 'win' ? 10 : 0
            };

        } catch (error) {
            this.logger.error('RPS game error:', error);
            return {
                success: false,
                error: 'Failed to play Rock Paper Scissors'
            };
        }
    }

    async startNumberGuess(userId, guildId, min = 1, max = 100) {
        try {
            const targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            
            const gameId = `guess_${userId}_${Date.now()}`;
            this.activeGames.set(gameId, {
                type: 'guess',
                userId,
                guildId,
                targetNumber,
                min,
                max,
                attempts: 0,
                maxAttempts: Math.ceil(Math.log2(max - min + 1)) + 2,
                startTime: Date.now()
            });

            return {
                success: true,
                gameId,
                min,
                max,
                maxAttempts: Math.ceil(Math.log2(max - min + 1)) + 2
            };

        } catch (error) {
            this.logger.error('Number guess start error:', error);
            return {
                success: false,
                error: 'Failed to start number guessing game'
            };
        }
    }

    async guessNumber(gameId, guess) {
        try {
            const game = this.activeGames.get(gameId);
            if (!game || game.type !== 'guess') {
                return {
                    success: false,
                    error: 'Game not found'
                };
            }

            game.attempts++;
            
            if (guess === game.targetNumber) {
                const points = Math.max(50 - game.attempts * 5, 10);
                await this.addGameStats(game.userId, 'guess', 'win', points);
                this.activeGames.delete(gameId);
                
                return {
                    success: true,
                    result: 'correct',
                    attempts: game.attempts,
                    points
                };
            } else if (game.attempts >= game.maxAttempts) {
                await this.addGameStats(game.userId, 'guess', 'loss', 0);
                this.activeGames.delete(gameId);
                
                return {
                    success: true,
                    result: 'failed',
                    targetNumber: game.targetNumber,
                    attempts: game.attempts
                };
            } else {
                const hint = guess < game.targetNumber ? 'higher' : 'lower';
                return {
                    success: true,
                    result: 'continue',
                    hint,
                    attempts: game.attempts,
                    remaining: game.maxAttempts - game.attempts
                };
            }

        } catch (error) {
            this.logger.error('Number guess error:', error);
            return {
                success: false,
                error: 'Failed to process guess'
            };
        }
    }

    async playSlots(userId, bet = 0) {
        try {
            const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
            const reels = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];

            let multiplier = 0;
            let result = 'lose';

            // Check for wins
            if (reels[0] === reels[1] && reels[1] === reels[2]) {
                result = 'jackpot';
                multiplier = reels[0] === '💎' ? 10 : reels[0] === '⭐' ? 5 : 3;
            } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
                result = 'small_win';
                multiplier = 1.5;
            }

            const winnings = Math.floor(bet * multiplier);
            const points = result === 'jackpot' ? 100 : result === 'small_win' ? 25 : 0;

            await this.addGameStats(userId, 'slots', result === 'lose' ? 'loss' : 'win', points);

            return {
                success: true,
                reels,
                result,
                multiplier,
                winnings,
                points
            };

        } catch (error) {
            this.logger.error('Slots game error:', error);
            return {
                success: false,
                error: 'Failed to play slots'
            };
        }
    }

    async getGameStats(userId, game = null) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            let query = 'SELECT * FROM game_stats WHERE user_id = ?';
            let params = [userId];

            if (game) {
                query += ' AND game = ?';
                params.push(game);
            }

            const stats = await this.database.db.all(query, params);
            
            return {
                success: true,
                stats
            };

        } catch (error) {
            this.logger.error('Get game stats error:', error);
            return {
                success: false,
                error: 'Failed to get game stats'
            };
        }
    }

    async getLeaderboard(game, limit = 10) {
        try {
            if (!this.database || !this.database.db) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }

            const leaderboard = await this.database.db.all(`
                SELECT user_id, game, wins, losses, score, best_score, total_played
                FROM game_stats 
                WHERE game = ? 
                ORDER BY score DESC 
                LIMIT ?
            `, [game, limit]);

            return {
                success: true,
                leaderboard
            };

        } catch (error) {
            this.logger.error('Get leaderboard error:', error);
            return {
                success: false,
                error: 'Failed to get leaderboard'
            };
        }
    }

    async addGameStats(userId, game, result, score = 0) {
        try {
            if (!this.database || !this.database.db) {
                return;
            }

            // Get existing stats
            const existing = await this.database.db.get(
                'SELECT * FROM game_stats WHERE user_id = ? AND game = ?',
                [userId, game]
            );

            if (existing) {
                // Update existing stats
                const wins = existing.wins + (result === 'win' ? 1 : 0);
                const losses = existing.losses + (result === 'loss' ? 1 : 0);
                const draws = existing.draws + (result === 'tie' ? 1 : 0);
                const newScore = existing.score + score;
                const bestScore = Math.max(existing.best_score, score);
                const totalPlayed = existing.total_played + 1;

                await this.database.db.run(`
                    UPDATE game_stats 
                    SET wins = ?, losses = ?, draws = ?, score = ?, best_score = ?, total_played = ?, last_played = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND game = ?
                `, [wins, losses, draws, newScore, bestScore, totalPlayed, userId, game]);
            } else {
                // Create new stats
                const wins = result === 'win' ? 1 : 0;
                const losses = result === 'loss' ? 1 : 0;
                const draws = result === 'tie' ? 1 : 0;

                await this.database.db.run(`
                    INSERT INTO game_stats (user_id, game, wins, losses, draws, score, best_score, total_played)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                `, [userId, game, wins, losses, draws, score, score]);
            }

        } catch (error) {
            this.logger.error('Add game stats error:', error);
        }
    }

    getTriviaQuestions(category = 'general', difficulty = 'medium') {
        const questions = [
            {
                category: 'Science',
                difficulty: 'easy',
                question: 'What is the chemical symbol for water?',
                options: ['H2O', 'CO2', 'NaCl', 'O2'],
                correct: 0
            },
            {
                category: 'History',
                difficulty: 'medium',
                question: 'In which year did World War II end?',
                options: ['1944', '1945', '1946', '1947'],
                correct: 1
            },
            {
                category: 'Geography',
                difficulty: 'easy',
                question: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correct: 2
            },
            {
                category: 'Science',
                difficulty: 'hard',
                question: 'What is the speed of light in vacuum?',
                options: ['299,792,458 m/s', '300,000,000 m/s', '299,000,000 m/s', '298,792,458 m/s'],
                correct: 0
            },
            {
                category: 'General',
                difficulty: 'medium',
                question: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correct: 1
            }
        ];

        return questions.filter(q => 
            (category === 'general' || q.category.toLowerCase() === category.toLowerCase()) &&
            q.difficulty === difficulty
        );
    }

    cleanup() {
        // Clean up old games (older than 1 hour)
        const cutoff = Date.now() - (60 * 60 * 1000);
        
        for (const [gameId, game] of this.activeGames.entries()) {
            if (game.startTime < cutoff) {
                this.activeGames.delete(gameId);
            }
        }
    }
}