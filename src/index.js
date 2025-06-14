import { BotCore } from './core/BotCore.js';
import { Logger } from './utils/Logger.js';
import chalk from 'chalk';

const logger = new Logger();

// ASCII Art Banner
const banner = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    ██╗    ██╗ ██████╗ ██████╗ ██╗     ██████╗ ███████╗    ██████╗ ███████╗   ║
║    ██║    ██║██╔═══██╗██╔══██╗██║     ██╔══██╗██╔════╝    ██╔══██╗██╔════╝   ║
║    ██║ █╗ ██║██║   ██║██████╔╝██║     ██║  ██║███████╗    ██████╔╝█████╗     ║
║    ██║███╗██║██║   ██║██╔══██╗██║     ██║  ██║╚════██║    ██╔══██╗██╔══╝     ║
║    ╚███╔███╔╝╚██████╔╝██║  ██║███████╗██████╔╝███████║    ██████╔╝███████╗   ║
║     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ ╚══════╝    ╚═════╝ ╚══════╝   ║
║                                                                              ║
║                        ██████╗  ██████╗ ████████╗                           ║
║                        ██╔══██╗██╔═══██╗╚══██╔══╝                           ║
║                        ██████╔╝██║   ██║   ██║                              ║
║                        ██╔══██╗██║   ██║   ██║                              ║
║                        ██████╔╝╚██████╔╝   ██║                              ║
║                        ╚═════╝  ╚═════╝    ╚═╝                              ║
║                                                                              ║
║                           World's Best Discord Bot                          ║
║                              Version 2.0.0                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

console.log(chalk.cyan(banner));

// Environment validation
function validateEnvironment() {
    const required = [
        'DISCORD_TOKEN',
        'CLIENT_ID'
    ];
    
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
        logger.critical(`Missing required environment variables: ${missing.join(', ')}`);
        logger.error('Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }
    
    logger.success('Environment validation passed');
}

// System information
function displaySystemInfo() {
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    
    logger.info(`Node.js Version: ${nodeVersion}`);
    logger.info(`Platform: ${platform} (${arch})`);
    logger.info(`Memory Usage: ${memory} MB`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

// Performance monitoring
function setupPerformanceMonitoring() {
    // Monitor memory usage
    setInterval(() => {
        const memUsage = process.memoryUsage();
        const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
        const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
        
        if (heapUsed > 500) { // Alert if using more than 500MB
            logger.warn(`High memory usage: ${heapUsed}MB / ${heapTotal}MB`);
        }
    }, 300000); // Check every 5 minutes
    
    // Monitor event loop lag
    let start = process.hrtime.bigint();
    setInterval(() => {
        const delta = process.hrtime.bigint() - start;
        const nanosec = Number(delta);
        const millisec = nanosec / 1000000;
        
        if (millisec > 100) { // Alert if lag is more than 100ms
            logger.warn(`Event loop lag detected: ${millisec.toFixed(2)}ms`);
        }
        
        start = process.hrtime.bigint();
    }, 5000);
}

// Graceful shutdown
function setupGracefulShutdown(bot) {
    const shutdown = async (signal) => {
        logger.info(`Received ${signal}, shutting down gracefully...`);
        
        try {
            await bot.shutdown();
            logger.success('Bot shutdown completed successfully');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
}

// Error handling
function setupErrorHandling() {
    process.on('uncaughtException', (error) => {
        logger.critical('Uncaught Exception:', error);
        process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        logger.critical('Unhandled Rejection at:', promise, 'reason:', reason);
        // Don't exit on unhandled rejections, just log them
    });
    
    process.on('warning', (warning) => {
        logger.warn('Process Warning:', warning);
    });
}

// Main initialization
async function main() {
    try {
        logger.loading('Starting World\'s Best Discord Bot...');
        
        // Setup
        validateEnvironment();
        displaySystemInfo();
        setupErrorHandling();
        setupPerformanceMonitoring();
        
        // Initialize bot
        const bot = new BotCore();
        setupGracefulShutdown(bot);
        
        // Start bot
        await bot.initialize();
        
        // Success message
        logger.success('🚀 World\'s Best Discord Bot is now online!');
        logger.info('📊 Dashboard: http://localhost:3000');
        logger.info('📚 Documentation: https://docs.discordbot.pro');
        logger.info('💬 Support: https://discord.gg/support');
        
        // Display feature summary
        const features = [
            '🎵 Advanced Music System',
            '🛡️ Security & Moderation',
            '💰 Complete Economy',
            '🎮 Interactive Games',
            '🤖 AI Integration',
            '📈 Leveling System',
            '🎫 Ticket Support',
            '😂 Meme Generation',
            '💖 Anime Features',
            '👥 Social Commands',
            '🔧 Utility Tools',
            '📊 Analytics Dashboard',
            '🌐 Web Interface',
            '🔒 Advanced Security',
            '⚡ High Performance'
        ];
        
        console.log(chalk.green('\n✨ Active Features:'));
        features.forEach(feature => {
            console.log(chalk.green(`   ${feature}`));
        });
        
        console.log(chalk.blue('\n🎯 Ready to serve the world!'));
        
    } catch (error) {
        logger.critical('Failed to start bot:', error);
        process.exit(1);
    }
}

// Start the bot
main();