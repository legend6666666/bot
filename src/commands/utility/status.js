import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('View comprehensive bot status and system information')
        .addBooleanOption(option =>
            option.setName('detailed')
                .setDescription('Show detailed system information')
        ),
    category: 'Utility',
    cooldown: 5,
    async execute(interaction) {
        const detailed = interaction.options.getBoolean('detailed') || false;
        const botCore = interaction.client.core;
        const stats = botCore.getStats();
        const initReport = botCore.getInitializationReport();

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🤖 Bot Status Dashboard')
            .setDescription('Comprehensive system status and performance metrics')
            .addFields(
                { name: '🏠 Servers', value: stats.guilds.toLocaleString(), inline: true },
                { name: '👥 Users', value: stats.users.toLocaleString(), inline: true },
                { name: '⚡ Commands', value: stats.commands.toLocaleString(), inline: true },
                { name: '🏓 Ping', value: `${stats.ping}ms`, inline: true },
                { name: '⏱️ Uptime', value: this.formatUptime(stats.uptime), inline: true },
                { name: '💾 Memory', value: `${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB`, inline: true },
                { name: '🔧 Version', value: stats.version, inline: true },
                { name: '🌍 Environment', value: stats.environment, inline: true },
                { name: '✅ Initialization', value: `${initReport.totalSteps} steps completed`, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        if (detailed) {
            // Add detailed system information
            const systemInfo = this.getSystemInfo();
            embed.addFields(
                { name: '🖥️ Platform', value: systemInfo.platform, inline: true },
                { name: '🏗️ Architecture', value: systemInfo.arch, inline: true },
                { name: '📦 Node.js', value: systemInfo.nodeVersion, inline: true },
                { name: '🔄 CPU Usage', value: `${systemInfo.cpuUsage}%`, inline: true },
                { name: '💽 Total Memory', value: `${systemInfo.totalMemory}GB`, inline: true },
                { name: '📊 Load Average', value: systemInfo.loadAverage, inline: true }
            );

            // Add feature status
            const features = initReport.features;
            const featureStatus = Object.entries(features)
                .map(([name, status]) => `${status ? '✅' : '❌'} ${name.charAt(0).toUpperCase() + name.slice(1)}`)
                .join('\n');
            
            embed.addFields({ name: '🎯 Feature Status', value: featureStatus });
        }

        const statusControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('status_refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('status_detailed')
                    .setLabel('Detailed View')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('status_performance')
                    .setLabel('Performance')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚡'),
                new ButtonBuilder()
                    .setCustomId('status_health_check')
                    .setLabel('Health Check')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏥')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [statusControls] 
        });
    },

    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m ${seconds % 60}s`;
    },

    getSystemInfo() {
        const os = require('os');
        
        return {
            platform: `${os.platform()} ${os.release()}`,
            arch: os.arch(),
            nodeVersion: process.version,
            cpuUsage: Math.round(process.cpuUsage().user / 1000000),
            totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
            loadAverage: os.loadavg().map(avg => avg.toFixed(2)).join(', ')
        };
    }
};