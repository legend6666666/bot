import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing song')
        .addBooleanOption(option =>
            option.setName('detailed')
                .setDescription('Show detailed information about the song')
        ),
    category: 'Music',
    cooldown: 3,
    async execute(interaction) {
        const queue = interaction.client.music.getQueue(interaction.guild.id);
        const detailed = interaction.options.getBoolean('detailed') || false;

        if (!queue.playing || !queue.currentSong) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ No music is currently playing!')
                ],
                ephemeral: true
            });
        }

        const song = queue.currentSong;
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${song.title}](${song.url})**`)
            .setThumbnail(song.thumbnail)
            .setTimestamp();

        if (detailed) {
            embed.addFields(
                { name: '👤 Artist/Channel', value: song.author || 'Unknown', inline: true },
                { name: '⏱️ Duration', value: song.duration, inline: true },
                { name: '👁️ Views', value: song.views || 'Unknown', inline: true },
                { name: '📅 Upload Date', value: song.uploadDate || 'Unknown', inline: true },
                { name: '👤 Requested by', value: song.requestedBy?.toString() || 'Unknown', inline: true },
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔄 Loop Mode', value: queue.loop, inline: true },
                { name: '📋 Queue Position', value: `1 of ${queue.songs.length}`, inline: true },
                { name: '⏸️ Status', value: queue.paused ? 'Paused' : 'Playing', inline: true }
            );

            if (song.description) {
                embed.addFields({ name: '📝 Description', value: song.description });
            }
        } else {
            embed.addFields(
                { name: '👤 Artist', value: song.author || 'Unknown', inline: true },
                { name: '⏱️ Duration', value: song.duration, inline: true },
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔄 Loop', value: queue.loop, inline: true },
                { name: '📋 Queue', value: `${queue.songs.length} songs`, inline: true },
                { name: '⏸️ Status', value: queue.paused ? 'Paused' : 'Playing', inline: true }
            );
        }

        embed.setFooter({ text: `Requested by ${song.requestedBy?.username || 'Unknown'}` });

        // Create enhanced music controls
        const controls = interaction.client.music.createMusicControls(queue);

        await interaction.reply({ embeds: [embed], components: controls });
    },
};