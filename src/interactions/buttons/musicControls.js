import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    customId: 'music_control',
    async execute(interaction) {
        const action = interaction.customId.split('_')[2];
        const guildId = interaction.guild.id;
        const musicManager = interaction.client.music;
        const queue = musicManager.getQueue(guildId);

        switch (action) {
            case 'play':
            case 'resume':
                if (queue.paused) {
                    musicManager.resume(guildId);
                } else if (!queue.playing) {
                    musicManager.startPlaying(guildId);
                }
                break;

            case 'pause':
                musicManager.pause(guildId);
                break;

            case 'skip':
                if (queue.songs.length === 0) {
                    return interaction.reply({ content: '❌ No songs to skip!', ephemeral: true });
                }
                musicManager.skip(guildId);
                break;

            case 'previous':
                if (!musicManager.previous(guildId)) {
                    return interaction.reply({ content: '❌ No previous songs!', ephemeral: true });
                }
                break;

            case 'stop':
                musicManager.stop(guildId);
                break;

            case 'shuffle':
                if (!musicManager.shuffle(guildId)) {
                    return interaction.reply({ content: '❌ Not enough songs to shuffle!', ephemeral: true });
                }
                break;

            case 'loop':
                const newMode = queue.loop === 'off' ? 'song' : queue.loop === 'song' ? 'queue' : 'off';
                musicManager.setLoop(guildId, newMode);
                break;

            case 'volume':
                const direction = interaction.customId.split('_')[3];
                const currentVolume = queue.volume;
                const newVolume = direction === 'up' ? 
                    Math.min(100, currentVolume + 10) : 
                    Math.max(0, currentVolume - 10);
                musicManager.setVolume(guildId, newVolume);
                break;

            case 'queue':
                return this.showQueue(interaction, queue);
        }

        // Update the embed with new status
        const updatedQueue = musicManager.getQueue(guildId);
        const embed = this.createNowPlayingEmbed(updatedQueue);
        const controls = musicManager.createMusicControls(updatedQueue);
        
        await interaction.update({ embeds: [embed], components: controls });
    },

    createNowPlayingEmbed(queue) {
        if (!queue.currentSong) {
            return new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🎵 Music Player')
                .setDescription('No music currently playing')
                .setTimestamp();
        }

        return new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${queue.currentSong.title}](${queue.currentSong.url})**`)
            .addFields(
                { name: '👤 Artist', value: queue.currentSong.author || 'Unknown', inline: true },
                { name: '⏱️ Duration', value: queue.currentSong.duration, inline: true },
                { name: '🔊 Volume', value: `${queue.volume}%`, inline: true },
                { name: '🔄 Loop', value: queue.loop, inline: true },
                { name: '📋 Queue', value: `${queue.songs.length} songs`, inline: true },
                { name: '⏸️ Status', value: queue.paused ? 'Paused' : 'Playing', inline: true }
            )
            .setThumbnail(queue.currentSong.thumbnail)
            .setFooter({ text: `Requested by ${queue.currentSong.requestedBy?.username}` })
            .setTimestamp();
    },

    async showQueue(interaction, queue) {
        if (queue.songs.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ The queue is empty!')
                ],
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📋 Music Queue')
            .setDescription(`**${queue.songs.length}** songs in queue`)
            .setTimestamp();

        const queueList = queue.songs.slice(0, 10).map((song, index) => {
            const position = index + 1;
            const current = index === 0 ? '**[NOW PLAYING]** ' : `**${position}.** `;
            return `${current}[${song.title}](${song.url})\n` +
                   `👤 ${song.author} • ⏱️ ${song.duration} • 👤 ${song.requestedBy?.username}`;
        }).join('\n\n');

        embed.addFields({ name: 'Songs', value: queueList });

        if (queue.songs.length > 10) {
            embed.setFooter({ text: `And ${queue.songs.length - 10} more songs...` });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};