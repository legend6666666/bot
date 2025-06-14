import { Events, EmbedBuilder } from 'discord.js';
import chalk from 'chalk';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            // Cooldown handling
            const { cooldowns } = interaction.client;
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Map());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`⏰ Please wait, you are on cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`);
                    
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                console.log(chalk.cyan(`🔧 ${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild?.name || 'DM'}`));
                await command.execute(interaction);
            } catch (error) {
                console.error(chalk.red(`❌ Error executing ${interaction.commandName}:`), error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Command Error')
                    .setDescription('There was an error while executing this command!')
                    .setTimestamp();

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }

        // Handle button interactions
        else if (interaction.isButton()) {
            const buttonId = interaction.customId.split('_')[0];
            const button = interaction.client.buttons.get(buttonId);

            if (button) {
                try {
                    await button.execute(interaction);
                } catch (error) {
                    console.error('Button interaction error:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
                    }
                }
            }
        }

        // Handle select menu interactions
        else if (interaction.isStringSelectMenu()) {
            const selectMenu = interaction.client.selectMenus.get(interaction.customId);

            if (selectMenu) {
                try {
                    await selectMenu.execute(interaction);
                } catch (error) {
                    console.error('Select menu interaction error:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
                    }
                }
            }
        }

        // Handle modal interactions
        else if (interaction.isModalSubmit()) {
            const modalId = interaction.customId.split('_')[0];
            const modal = interaction.client.modals.get(modalId);

            if (modal) {
                try {
                    await modal.execute(interaction);
                } catch (error) {
                    console.error('Modal interaction error:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
                    }
                }
            }
        }

        // Handle autocomplete interactions
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error('Autocomplete error:', error);
            }
        }
    },
};