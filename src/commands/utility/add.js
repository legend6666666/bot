import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add the bot to another server or invite a different bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('thisbot')
                .setDescription('Generate an invite link for this bot')
                .addStringOption(option =>
                    option.setName('permissions')
                        .setDescription('Permission level for the bot')
                        .addChoices(
                            { name: 'Administrator (All Permissions)', value: 'admin' },
                            { name: 'Standard (Recommended)', value: 'standard' },
                            { name: 'Minimal (Limited Features)', value: 'minimal' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('otherbot')
                .setDescription('Generate an invite link for another bot')
                .addStringOption(option =>
                    option.setName('client_id')
                        .setDescription('The Client ID of the bot to invite')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('permissions')
                        .setDescription('Permission level for the bot')
                        .addChoices(
                            { name: 'Administrator (All Permissions)', value: 'admin' },
                            { name: 'Standard (Recommended)', value: 'standard' },
                            { name: 'Minimal (Limited Features)', value: 'minimal' }
                        )
                )
        ),
    category: 'Utility',
    cooldown: 5,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'thisbot') {
            await this.addThisBot(interaction);
        } else if (subcommand === 'otherbot') {
            await this.addOtherBot(interaction);
        }
    },
    
    async addThisBot(interaction) {
        const permissionLevel = interaction.options.getString('permissions') || 'standard';
        const clientId = interaction.client.user.id;
        
        const permissionValues = {
            admin: '8', // Administrator (decimal for 1 << 3)
            standard: '2176183360', // Standard permissions for most features
            minimal: '274878221312' // Minimal permissions for basic functionality
        };
        
        const permissionDescriptions = {
            admin: 'Full administrator access (all permissions)',
            standard: 'Standard permissions for most features (recommended)',
            minimal: 'Minimal permissions for basic functionality (limited features)'
        };
        
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissionValues[permissionLevel]}&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🤖 Add Bot to Server')
            .setDescription('Click the button below to add this bot to your server!')
            .addFields(
                { name: '🔑 Permission Level', value: permissionDescriptions[permissionLevel], inline: false },
                { name: '🛠️ Features', value: 'Music, Economy, Moderation, Games, AI, and more!', inline: false },
                { name: '⚠️ Note', value: 'You must have the **Manage Server** permission in the target server to add this bot.', inline: false }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'World\'s Best Discord Bot v2.0' })
            .setTimestamp();

        const inviteButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Add to Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteUrl)
                    .setEmoji('➕'),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/support')
                    .setEmoji('❓')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [inviteButton],
            ephemeral: true
        });
    },
    
    async addOtherBot(interaction) {
        // Check if user has permission to manage server
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: '❌ You need the **Manage Server** permission to use this command!',
                ephemeral: true
            });
        }
        
        const clientId = interaction.options.getString('client_id');
        const permissionLevel = interaction.options.getString('permissions') || 'standard';
        
        // Validate client ID format
        if (!/^\d{17,20}$/.test(clientId)) {
            return interaction.reply({
                content: '❌ Invalid Client ID format! The Client ID should be a 17-20 digit number.',
                ephemeral: true
            });
        }
        
        const permissionValues = {
            admin: '8', // Administrator
            standard: '2176183360', // Standard permissions
            minimal: '274878221312' // Minimal permissions
        };
        
        const permissionDescriptions = {
            admin: 'Full administrator access (all permissions)',
            standard: 'Standard permissions for most features (recommended)',
            minimal: 'Minimal permissions for basic functionality (limited features)'
        };
        
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissionValues[permissionLevel]}&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('➕ Add Bot to Server')
            .setDescription(`You're about to add a bot with Client ID \`${clientId}\` to your server.`)
            .addFields(
                { name: '🔑 Permission Level', value: permissionDescriptions[permissionLevel], inline: false },
                { name: '⚠️ Security Warning', value: 'Only add bots you trust! Bots with Administrator permission have full control over your server.', inline: false }
            )
            .setFooter({ text: 'Make sure this is the correct Client ID before proceeding' })
            .setTimestamp();

        const inviteButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Add to Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteUrl)
                    .setEmoji('➕'),
                new ButtonBuilder()
                    .setLabel('Cancel')
                    .setCustomId('cancel_bot_invite')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [inviteButton],
            ephemeral: true
        });
    }
};