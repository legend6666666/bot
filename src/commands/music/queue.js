import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number to display')
                .setMinValue(1)
        ),
    cooldown: 3,
    async execute(interaction) {
        const queue = interaction.client.musicManager.getQueue(interaction.guild.id);
        const page = interaction.options.getInteger('page') || 1;
        const songsPerPage = 10;

        if (queue.songs.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ The queue is empty! Use `/play` to add songs.')
                ],
                ephemeral: true
            });
        }

        const totalPages = Math.ceil(queue.songs.length / songsPerPage);
        const startIndex = (page - 1) * songsPerPage;
        const endIndex = Math.min(startIndex + songsPerPage, queue.songs.length);

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🎵 Music Queue')
            .setDescription(`**${queue.songs.length}** songs in queue`)
            .addFields(
                { name: 'Volume', value: `${queue.volume}%`, inline: true },
                { name: 'Loop', value: queue.loop, inline: true },
                { name: 'Status', value: queue.playing ? '▶️ Playing' : '⏸️ Paused', inline: true }
            )
            .setFooter({ text: `Page ${page}/${totalPages}` })
            .setTimestamp();

        let queueText = '';
        for (let i = startIndex; i < endIndex; i++) {
            const song = queue.songs[i];
            const position = i + 1;
            const current = i === 0 ? '**[NOW PLAYING]** ' : `**${position}.** `;
            queueText += `${current}[${song.title}](${song.url}) \`${song.duration}\`\n`;
        }

        embed.addFields({ name: 'Songs', value: queueText || 'No songs to display' });

        await interaction.reply({ embeds: [embed] });
    },
};