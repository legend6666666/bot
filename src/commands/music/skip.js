import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of songs to skip')
                .setMinValue(1)
                .setMaxValue(10)
        ),
    cooldown: 1,
    async execute(interaction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You need to be in a voice channel to skip songs!')
                ],
                ephemeral: true
            });
        }

        const queue = interaction.client.musicManager.getQueue(interaction.guild.id);
        if (queue.songs.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ There are no songs in the queue!')
                ],
                ephemeral: true
            });
        }

        const amount = interaction.options.getInteger('amount') || 1;
        const skipped = Math.min(amount, queue.songs.length);

        // Skip multiple songs if requested
        for (let i = 0; i < skipped - 1; i++) {
            queue.songs.shift();
        }

        const success = interaction.client.musicManager.skip(interaction.guild.id);
        
        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('⏭️ Song Skipped')
                .setDescription(`Skipped ${skipped} song${skipped > 1 ? 's' : ''}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Failed to skip the song!')
                ],
                ephemeral: true
            });
        }
    },
};