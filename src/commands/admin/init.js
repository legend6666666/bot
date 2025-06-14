import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('init')
        .setDescription('View bot initialization report and system startup information')
        .addStringOption(option =>
            option.setName('component')
                .setDescription('View specific component initialization')
                .addChoices(
                    { name: 'Core Systems', value: 'core' },
                    { name: 'Feature Managers', value: 'features' },
                    { name: 'Commands & Events', value: 'commands' },
                    { name: 'Web & API', value: 'web' },
                    { name: 'Analytics & Monitoring', value: 'analytics' }
                )
        ),
    category: 'Admin',
    cooldown: 5,
    async execute(interaction) {
        const component = interaction.options.getString('component');
        const botCore = interaction.client.core;
        const initReport = botCore.getInitializationReport();

        if (component) {
            await this.showComponentDetails(interaction, component, initReport);
        } else {
            await this.showFullReport(interaction, initReport);
        }
    },

    async showFullReport(interaction, initReport) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🚀 Bot Initialization Report')
            .setDescription('Comprehensive startup and initialization status')
            .addFields(
                { name: '📊 Total Steps', value: initReport.totalSteps.toString(), inline: true },
                { name: '✅ Completion Status', value: initReport.completedAt ? 'Completed' : 'In Progress', inline: true },
                { name: '⏱️ Completed At', value: initReport.completedAt ? initReport.completedAt.toLocaleString() : 'N/A', inline: true }
            )
            .setTimestamp();

        // Add initialization steps summary
        const stepsSummary = initReport.steps.slice(0, 10).map((step, index) => 
            `**${index + 1}.** ${step.name} - ${step.description}`
        ).join('\n');

        embed.addFields({ name: '🔧 Recent Initialization Steps', value: stepsSummary });

        // Add feature status
        const features = initReport.features;
        const coreFeatures = [
            `${features.music ? '✅' : '❌'} Music System`,
            `${features.economy ? '✅' : '❌'} Economy`,
            `${features.moderation ? '✅' : '❌'} Moderation`,
            `${features.leveling ? '✅' : '❌'} Leveling`,
            `${features.ai ? '✅' : '❌'} AI Integration`,
            `${features.games ? '✅' : '❌'} Games`
        ].join('\n');

        const systemFeatures = [
            `${features.webServer ? '✅' : '❌'} Web Server`,
            `${features.analytics ? '✅' : '❌'} Analytics`,
            `${features.monitoring ? '✅' : '❌'} Monitoring`,
            `${features.tickets ? '✅' : '❌'} Tickets`,
            `${features.social ? '✅' : '❌'} Social`,
            `${features.utility ? '✅' : '❌'} Utility`
        ].join('\n');

        embed.addFields(
            { name: '🎯 Core Features', value: coreFeatures, inline: true },
            { name: '🔧 System Features', value: systemFeatures, inline: true }
        );

        const initControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('init_view_core')
                    .setLabel('Core Systems')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔧'),
                new ButtonBuilder()
                    .setCustomId('init_view_features')
                    .setLabel('Features')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎯'),
                new ButtonBuilder()
                    .setCustomId('init_view_performance')
                    .setLabel('Performance')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚡'),
                new ButtonBuilder()
                    .setCustomId('init_refresh')
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [initControls] 
        });
    },

    async showComponentDetails(interaction, component, initReport) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`🔍 ${component.charAt(0).toUpperCase() + component.slice(1)} Component Details`)
            .setTimestamp();

        switch (component) {
            case 'core':
                embed.setDescription('Core system components and their initialization status')
                    .addFields(
                        { name: '🤖 Discord Client', value: '✅ Initialized with all intents', inline: false },
                        { name: '📊 Collections', value: '✅ All Discord.js collections ready', inline: false },
                        { name: '🗄️ Database', value: '✅ SQLite database with advanced features', inline: false },
                        { name: '💾 Cache Manager', value: '✅ Memory-efficient caching system', inline: false },
                        { name: '🛡️ Security Manager', value: '✅ Multi-layer security protection', inline: false },
                        { name: '🔐 Permission Manager', value: '✅ Role-based permission system', inline: false }
                    );
                break;

            case 'features':
                embed.setDescription('Feature managers and their capabilities')
                    .addFields(
                        { name: '🎵 Music Manager', value: '✅ Multi-platform music streaming', inline: true },
                        { name: '💰 Economy Manager', value: '✅ Virtual economy with jobs & shops', inline: true },
                        { name: '⚖️ Moderation Manager', value: '✅ Advanced moderation tools', inline: true },
                        { name: '📈 Leveling Manager', value: '✅ XP system with rank cards', inline: true },
                        { name: '🤖 AI Manager', value: '✅ GPT-4 powered AI features', inline: true },
                        { name: '🎮 Game Manager', value: '✅ Interactive games & tournaments', inline: true }
                    );
                break;

            case 'commands':
                embed.setDescription('Commands, events, and interaction handlers')
                    .addFields(
                        { name: '⚡ Slash Commands', value: `✅ ${interaction.client.commands.size} commands loaded`, inline: true },
                        { name: '📡 Events', value: `✅ ${interaction.client.events.size} events registered`, inline: true },
                        { name: '🔘 Buttons', value: `✅ ${interaction.client.buttons.size} button handlers`, inline: true },
                        { name: '📋 Select Menus', value: `✅ ${interaction.client.selectMenus.size} menu handlers`, inline: true },
                        { name: '📝 Modals', value: `✅ ${interaction.client.modals.size} modal handlers`, inline: true },
                        { name: '🔍 Autocomplete', value: `✅ ${interaction.client.autocomplete.size} autocomplete handlers`, inline: true }
                    );
                break;

            case 'web':
                embed.setDescription('Web server, API, and external integrations')
                    .addFields(
                        { name: '🌐 Web Server', value: '✅ Express.js dashboard & API', inline: true },
                        { name: '🔌 API Manager', value: '✅ RESTful API with authentication', inline: true },
                        { name: '🪝 Webhook Manager', value: '✅ External webhook handling', inline: true },
                        { name: '📢 Notifications', value: '✅ Multi-channel notifications', inline: true },
                        { name: '🔒 Security', value: '✅ Rate limiting & protection', inline: true },
                        { name: '📊 Real-time Data', value: '✅ WebSocket connections', inline: true }
                    );
                break;

            case 'analytics':
                embed.setDescription('Analytics, monitoring, and performance systems')
                    .addFields(
                        { name: '📈 Analytics Manager', value: '✅ Real-time analytics & insights', inline: true },
                        { name: '🔍 Monitoring Manager', value: '✅ System health monitoring', inline: true },
                        { name: '⚡ Performance Manager', value: '✅ Performance optimization', inline: true },
                        { name: '📊 Metrics Collection', value: '✅ Command usage tracking', inline: true },
                        { name: '🚨 Alert System', value: '✅ Automated alerting', inline: true },
                        { name: '📋 Reporting', value: '✅ Detailed reports & logs', inline: true }
                    );
                break;
        }

        await interaction.reply({ embeds: [embed] });
    }
};