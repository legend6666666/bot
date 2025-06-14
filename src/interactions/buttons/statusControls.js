import { EmbedBuilder } from 'discord.js';

export default {
    customId: 'status',
    async execute(interaction) {
        const action = interaction.customId.split('_')[1];
        const botCore = interaction.client.core;

        switch (action) {
            case 'refresh':
                await this.refreshStatus(interaction, botCore);
                break;
            case 'detailed':
                await this.showDetailedStatus(interaction, botCore);
                break;
            case 'performance':
                await this.showPerformance(interaction, botCore);
                break;
            case 'health_check':
                await this.performHealthCheck(interaction, botCore);
                break;
        }
    },

    async refreshStatus(interaction, botCore) {
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
            .setFooter({ text: 'Status refreshed' })
            .setTimestamp();

        await interaction.update({ embeds: [embed] });
    },

    async showDetailedStatus(interaction, botCore) {
        const stats = botCore.getStats();
        const initReport = botCore.getInitializationReport();
        const systemInfo = this.getSystemInfo();

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🔍 Detailed Bot Status')
            .setDescription('Comprehensive system information and diagnostics')
            .addFields(
                { name: '🖥️ Platform', value: systemInfo.platform, inline: true },
                { name: '🏗️ Architecture', value: systemInfo.arch, inline: true },
                { name: '📦 Node.js', value: systemInfo.nodeVersion, inline: true },
                { name: '🔄 CPU Usage', value: `${systemInfo.cpuUsage}%`, inline: true },
                { name: '💽 Total Memory', value: `${systemInfo.totalMemory}GB`, inline: true },
                { name: '📊 Load Average', value: systemInfo.loadAverage, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        // Add memory usage details
        embed.addFields({
            name: '💾 Memory Usage',
            value: `Heap Used: ${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB\n` +
                   `Heap Total: ${Math.round(stats.memory.heapTotal / 1024 / 1024)}MB\n` +
                   `External: ${Math.round(stats.memory.external / 1024 / 1024)}MB\n` +
                   `RSS: ${Math.round(stats.memory.rss / 1024 / 1024)}MB`,
            inline: false
        });

        // Add feature status
        const features = initReport.features;
        const featureStatus = Object.entries(features)
            .map(([name, status]) => `${status ? '✅' : '❌'} ${name.charAt(0).toUpperCase() + name.slice(1)}`)
            .join('\n');
        
        embed.addFields({ name: '🎯 Feature Status', value: featureStatus });

        await interaction.update({ embeds: [embed] });
    },

    async showPerformance(interaction, botCore) {
        const stats = botCore.getStats();
        
        const embed = new EmbedBuilder()
            .setColor('#FF9800')
            .setTitle('⚡ Performance Metrics')
            .setDescription('Real-time performance data and system metrics')
            .addFields(
                { name: '🏓 API Latency', value: `${stats.ping}ms`, inline: true },
                { name: '⏱️ Uptime', value: this.formatUptime(stats.uptime), inline: true },
                { name: '🔄 Memory Usage', value: `${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(stats.memory.heapTotal / 1024 / 1024)}MB`, inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        // Add command stats if available
        if (botCore.database && botCore.database.getCommandStats) {
            try {
                const commandStats = await botCore.database.getCommandStats(1); // Last 24 hours
                if (commandStats && commandStats.length > 0) {
                    const topCommands = commandStats.slice(0, 5).map(cmd => 
                        `${cmd.command}: ${cmd.total_uses} uses`
                    ).join('\n');
                    
                    embed.addFields({ 
                        name: '🔝 Top Commands (24h)', 
                        value: topCommands || 'No command usage data available',
                        inline: false
                    });
                }
            } catch (error) {
                console.error('Error getting command stats:', error);
            }
        }

        // Add system performance
        const systemInfo = this.getSystemInfo();
        embed.addFields({ 
            name: '🖥️ System Performance', 
            value: `CPU: ${systemInfo.cpuUsage}%\nMemory: ${Math.round((1 - systemInfo.freeMemory / systemInfo.totalMemory) * 100)}%\nLoad: ${systemInfo.loadAverage}`,
            inline: false
        });

        await interaction.update({ embeds: [embed] });
    },

    async performHealthCheck(interaction, botCore) {
        await interaction.deferUpdate();
        
        const checks = [
            { name: 'Discord API', status: botCore.client.ws.ping < 200 ? 'healthy' : 'degraded', details: `Ping: ${botCore.client.ws.ping}ms` },
            { name: 'Commands', status: botCore.client.commands.size > 0 ? 'healthy' : 'warning', details: `${botCore.client.commands.size} commands loaded` },
            { name: 'Database', status: botCore.database?.isInitialized ? 'healthy' : 'critical', details: botCore.database?.isInitialized ? 'Connected' : 'Disconnected' },
            { name: 'Memory', status: this.checkMemoryHealth(botCore.getStats().memory), details: `${Math.round(botCore.getStats().memory.heapUsed / 1024 / 1024)}MB used` },
            { name: 'Web Server', status: botCore.webServer?.isRunning ? 'healthy' : 'warning', details: botCore.webServer?.isRunning ? 'Running' : 'Stopped' }
        ];

        const overallStatus = checks.some(c => c.status === 'critical') ? 'critical' :
                             checks.some(c => c.status === 'degraded') ? 'degraded' :
                             checks.some(c => c.status === 'warning') ? 'warning' : 'healthy';

        const statusEmoji = {
            healthy: '✅',
            warning: '⚠️',
            degraded: '🟠',
            critical: '❌'
        };

        const statusColor = {
            healthy: '#00FF00',
            warning: '#FFFF00',
            degraded: '#FFA500',
            critical: '#FF0000'
        };

        const embed = new EmbedBuilder()
            .setColor(statusColor[overallStatus])
            .setTitle(`${statusEmoji[overallStatus]} Health Check Results`)
            .setDescription(`Overall Status: **${overallStatus.toUpperCase()}**`)
            .setTimestamp();

        checks.forEach(check => {
            embed.addFields({
                name: `${statusEmoji[check.status]} ${check.name}`,
                value: check.details,
                inline: true
            });
        });

        // Add recommendations if needed
        if (overallStatus !== 'healthy') {
            const recommendations = [];
            
            if (checks.find(c => c.name === 'Discord API').status !== 'healthy') {
                recommendations.push('• Check your internet connection');
            }
            
            if (checks.find(c => c.name === 'Database').status !== 'healthy') {
                recommendations.push('• Restart the bot to reconnect to the database');
            }
            
            if (checks.find(c => c.name === 'Memory').status !== 'healthy') {
                recommendations.push('• Consider restarting the bot to free up memory');
            }
            
            if (recommendations.length > 0) {
                embed.addFields({
                    name: '🔧 Recommendations',
                    value: recommendations.join('\n'),
                    inline: false
                });
            }
        }

        await interaction.editReply({ embeds: [embed] });
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
            freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024),
            loadAverage: os.loadavg().map(avg => avg.toFixed(2)).join(', ')
        };
    },

    checkMemoryHealth(memory) {
        const heapUsedMB = memory.heapUsed / 1024 / 1024;
        const heapTotalMB = memory.heapTotal / 1024 / 1024;
        const usage = (heapUsedMB / heapTotalMB) * 100;
        
        if (usage > 90) return 'critical';
        if (usage > 75) return 'degraded';
        if (usage > 60) return 'warning';
        return 'healthy';
    }
};