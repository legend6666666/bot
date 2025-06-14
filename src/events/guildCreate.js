import { Events, EmbedBuilder } from 'discord.js';
import chalk from 'chalk';

export default {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(chalk.green(`✅ Joined new guild: ${guild.name} (${guild.id})`));
        console.log(chalk.blue(`👥 Members: ${guild.memberCount}`));

        // Initialize guild in database
        await guild.client.database.getGuild(guild.id);

        // Send welcome message to system channel or first available channel
        const channel = guild.systemChannel || 
                       guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));

        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎉 Thanks for adding me!')
                .setDescription(`Hello **${guild.name}**! I'm your new Discord bot with 150+ commands!`)
                .addFields(
                    { name: '🎵 Music', value: 'High-quality music streaming', inline: true },
                    { name: '🛡️ Moderation', value: 'Advanced moderation tools', inline: true },
                    { name: '💰 Economy', value: 'Complete economy system', inline: true },
                    { name: '🎮 Games', value: 'Fun games and activities', inline: true },
                    { name: '🤖 AI', value: 'AI-powered features', inline: true },
                    { name: '📈 Leveling', value: 'XP and ranking system', inline: true }
                )
                .addFields(
                    { name: 'Getting Started', value: 'Use `/help` to see all available commands!' },
                    { name: 'Support', value: 'Need help? Join our support server!' }
                )
                .setThumbnail(guild.client.user.displayAvatarURL())
                .setTimestamp();

            try {
                await channel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Could not send welcome message:', error);
            }
        }
    },
};