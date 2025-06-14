import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),
    cooldown: 1,
    async execute(interaction) {
        const member = interaction.member;
        
        // Check if user has permission to change volume
        if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You need the "Manage Messages" permission to change volume!')
                ],
                ephemeral: true
            });
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You need to be in a voice channel to change volume!')
                ],
                ephemeral: true
            });
        }

        const volume = interaction.options.getInteger('level');
        const newVolume = interaction.client.musicManager.setVolume(interaction.guild.id, volume);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to **${newVolume}%**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};