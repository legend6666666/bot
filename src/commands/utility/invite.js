import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the bot invite link and support server information'),
    category: 'Utility',
    cooldown: 5,
    async execute(interaction) {
        const clientId = interaction.client.user.id;
        const permissions = '8'; // Administrator permission
        
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🤖 Invite World\'s Best Discord Bot')
            .setDescription('Add this amazing bot to your server and unlock 200+ premium features!')
            .addFields(
                { name: '🎵 Music System', value: 'High-quality streaming from multiple platforms', inline: true },
                { name: '💰 Economy', value: 'Complete virtual economy with jobs & shops', inline: true },
                { name: '🛡️ Security', value: 'Advanced protection and moderation tools', inline: true },
                { name: '🎮 Games', value: 'Interactive games and tournaments', inline: true },
                { name: '🤖 AI Features', value: 'GPT-4 powered smart assistance', inline: true },
                { name: '📈 Analytics', value: 'Real-time insights and statistics', inline: true }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'World\'s Best Discord Bot v2.0 | Premium Features Included' })
            .setTimestamp();

        const inviteButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🔗 Invite Bot')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteUrl),
                new ButtonBuilder()
                    .setLabel('📊 Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL('http://localhost:3000'),
                new ButtonBuilder()
                    .setLabel('💬 Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/support'),
                new ButtonBuilder()
                    .setLabel('📚 Documentation')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://docs.discordbot.pro')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [inviteButton] 
        });
    },
};