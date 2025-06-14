export default {
    customId: 'cancel_bot_invite',
    async execute(interaction) {
        await interaction.update({
            content: '✅ Bot invitation cancelled.',
            embeds: [],
            components: [],
            ephemeral: true
        });
    }
};