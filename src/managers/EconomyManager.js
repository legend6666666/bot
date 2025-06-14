import { EmbedBuilder } from 'discord.js';

export class EconomyManager {
    constructor(database) {
        this.db = database;
        this.cooldowns = new Map();
    }

    async getBalance(userId) {
        const user = await this.db.getUser(userId);
        return {
            coins: user.coins || 0,
            bank: user.bank || 0,
            total: (user.coins || 0) + (user.bank || 0)
        };
    }

    async addCoins(userId, amount, reason = 'Unknown') {
        const user = await this.db.getUser(userId);
        const newAmount = (user.coins || 0) + amount;
        
        await this.db.updateUser(userId, { coins: newAmount });
        await this.db.addTransaction(userId, 'earn', amount, reason);
        
        return newAmount;
    }

    async removeCoins(userId, amount, reason = 'Unknown') {
        const user = await this.db.getUser(userId);
        const currentCoins = user.coins || 0;
        
        if (currentCoins < amount) {
            return false; // Insufficient funds
        }
        
        const newAmount = currentCoins - amount;
        await this.db.updateUser(userId, { coins: newAmount });
        await this.db.addTransaction(userId, 'spend', -amount, reason);
        
        return newAmount;
    }

    async transferCoins(fromUserId, toUserId, amount) {
        const fromUser = await this.db.getUser(fromUserId);
        const currentCoins = fromUser.coins || 0;
        
        if (currentCoins < amount) {
            return false; // Insufficient funds
        }
        
        // Remove from sender
        await this.db.updateUser(fromUserId, { coins: currentCoins - amount });
        await this.db.addTransaction(fromUserId, 'transfer_out', -amount, `Transfer to user ${toUserId}`);
        
        // Add to receiver
        const toUser = await this.db.getUser(toUserId);
        const toCoins = (toUser.coins || 0) + amount;
        await this.db.updateUser(toUserId, { coins: toCoins });
        await this.db.addTransaction(toUserId, 'transfer_in', amount, `Transfer from user ${fromUserId}`);
        
        return true;
    }

    async claimDaily(userId) {
        const user = await this.db.getUser(userId);
        const now = Date.now();
        const lastClaimed = user.daily_claimed || 0;
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (now - lastClaimed < oneDayMs) {
            const timeLeft = oneDayMs - (now - lastClaimed);
            return { success: false, timeLeft };
        }
        
        const dailyAmount = parseInt(process.env.DAILY_REWARD) || 1000;
        const newCoins = (user.coins || 0) + dailyAmount;
        
        await this.db.updateUser(userId, { 
            coins: newCoins, 
            daily_claimed: now 
        });
        await this.db.addTransaction(userId, 'daily', dailyAmount, 'Daily reward');
        
        return { success: true, amount: dailyAmount, newBalance: newCoins };
    }

    async work(userId) {
        const user = await this.db.getUser(userId);
        const now = Date.now();
        const lastWorked = user.work_cooldown || 0;
        const cooldownMs = parseInt(process.env.WORK_COOLDOWN) || 3600000; // 1 hour
        
        if (now - lastWorked < cooldownMs) {
            const timeLeft = cooldownMs - (now - lastWorked);
            return { success: false, timeLeft };
        }
        
        const jobs = [
            { name: 'Programmer', min: 500, max: 1500 },
            { name: 'Designer', min: 400, max: 1200 },
            { name: 'Writer', min: 300, max: 1000 },
            { name: 'Teacher', min: 350, max: 900 },
            { name: 'Chef', min: 250, max: 800 },
            { name: 'Driver', min: 200, max: 600 }
        ];
        
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const earnings = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
        const newCoins = (user.coins || 0) + earnings;
        
        await this.db.updateUser(userId, { 
            coins: newCoins, 
            work_cooldown: now 
        });
        await this.db.addTransaction(userId, 'work', earnings, `Worked as ${job.name}`);
        
        return { success: true, job: job.name, earnings, newBalance: newCoins };
    }

    async gamble(userId, amount, game = 'coinflip') {
        const user = await this.db.getUser(userId);
        const currentCoins = user.coins || 0;
        
        if (currentCoins < amount) {
            return { success: false, reason: 'insufficient_funds' };
        }
        
        let won = false;
        let multiplier = 1;
        let result = '';
        
        switch (game) {
            case 'coinflip':
                won = Math.random() < 0.5;
                multiplier = 2;
                result = won ? 'Heads - You won!' : 'Tails - You lost!';
                break;
                
            case 'dice':
                const roll = Math.floor(Math.random() * 6) + 1;
                won = roll >= 4; // Win on 4, 5, or 6
                multiplier = 1.5;
                result = `Rolled ${roll} - ${won ? 'You won!' : 'You lost!'}`;
                break;
                
            case 'slots':
                const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
                const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
                const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
                const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
                
                if (slot1 === slot2 && slot2 === slot3) {
                    won = true;
                    multiplier = slot1 === '💎' ? 10 : slot1 === '⭐' ? 5 : 3;
                }
                result = `${slot1} ${slot2} ${slot3} - ${won ? `JACKPOT! x${multiplier}` : 'No match!'}`;
                break;
        }
        
        let newCoins;
        if (won) {
            const winnings = Math.floor(amount * multiplier);
            newCoins = currentCoins + winnings - amount;
            await this.db.addTransaction(userId, 'gamble_win', winnings - amount, `Won ${game}`);
        } else {
            newCoins = currentCoins - amount;
            await this.db.addTransaction(userId, 'gamble_loss', -amount, `Lost ${game}`);
        }
        
        await this.db.updateUser(userId, { coins: newCoins });
        
        return { 
            success: true, 
            won, 
            amount: won ? Math.floor(amount * multiplier) - amount : -amount,
            result, 
            newBalance: newCoins 
        };
    }

    async deposit(userId, amount) {
        const user = await this.db.getUser(userId);
        const currentCoins = user.coins || 0;
        
        if (amount === 'all') {
            amount = currentCoins;
        }
        
        if (currentCoins < amount) {
            return { success: false, reason: 'insufficient_funds' };
        }
        
        const newCoins = currentCoins - amount;
        const newBank = (user.bank || 0) + amount;
        
        await this.db.updateUser(userId, { coins: newCoins, bank: newBank });
        await this.db.addTransaction(userId, 'deposit', amount, 'Bank deposit');
        
        return { success: true, amount, newCoins, newBank };
    }

    async withdraw(userId, amount) {
        const user = await this.db.getUser(userId);
        const currentBank = user.bank || 0;
        
        if (amount === 'all') {
            amount = currentBank;
        }
        
        if (currentBank < amount) {
            return { success: false, reason: 'insufficient_funds' };
        }
        
        const newBank = currentBank - amount;
        const newCoins = (user.coins || 0) + amount;
        
        await this.db.updateUser(userId, { coins: newCoins, bank: newBank });
        await this.db.addTransaction(userId, 'withdraw', amount, 'Bank withdrawal');
        
        return { success: true, amount, newCoins, newBank };
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    formatCoins(amount) {
        return amount.toLocaleString();
    }
}