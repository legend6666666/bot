import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Deploy slash commands to Discord (Owner only)')
        .addBooleanOption(option =>
            option.setName('global')
                .setDescription('Deploy commands globally (takes up to 1 hour)')
        ),
    category: 'Admin',
    cooldown: 30,
    async execute(interaction) {
        // Check if user is bot owner
        const owners = process.env.OWNER_ID?.split(',') || [];
        if (!owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Only bot owners can use this command!')
                ],
                ephemeral: true
            });
        }

        const global = interaction.options.getBoolean('global') || false;
        await interaction.deferReply();

        try {
            const commands = [];
            
            // Collect all commands
            for (const command of interaction.client.commands.values()) {
                commands.push(command.data.toJSON());
            }

            const rest = new REST().setToken(process.env.DISCORD_TOKEN);

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🚀 Deploying Commands')
                .setDescription(`Deploying ${commands.length} commands...`)
                .addFields(
                    { name: 'Scope', value: global ? 'Global' : 'Guild', inline: true },
                    { name: 'Commands', value: commands.length.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Deploy commands
            const data = await rest.put(
                global 
                    ? Routes.applicationCommands(process.env.CLIENT_ID)
                    : Routes.applicationGuildCommands(process.env.CLIENT_ID, interaction.guild.id),
                { body: commands }
            );

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Commands Deployed Successfully')
                .setDescription(`Successfully deployed ${data.length} commands!`)
                .addFields(
                    { name: 'Scope', value: global ? 'Global (up to 1 hour)' : 'Guild (instant)', inline: true },
                    { name: 'Commands Deployed', value: data.length.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Command deployment error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Deployment Failed')
                .setDescription('Failed to deploy commands!')
                .addFields({ name: 'Error', value: error.message.slice(0, 1024) })
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};