import { Events, ActivityType } from 'discord.js';
import chalk from 'chalk';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(chalk.green(`✅ ${client.user.tag} is online and ready!`));
        console.log(chalk.blue(`📊 Serving ${client.guilds.cache.size} servers`));
        console.log(chalk.blue(`👥 Watching ${client.users.cache.size} users`));
        
        // Set bot status
        const activities = [
            { name: 'music for everyone', type: ActivityType.Playing },
            { name: 'over the server', type: ActivityType.Watching },
            { name: 'to your commands', type: ActivityType.Listening },
            { name: 'with Discord API', type: ActivityType.Playing },
            { name: 'the economy system', type: ActivityType.Managing }
        ];

        let activityIndex = 0;
        const updateActivity = () => {
            client.user.setActivity(activities[activityIndex]);
            activityIndex = (activityIndex + 1) % activities.length;
        };

        updateActivity();
        setInterval(updateActivity, 30000); // Change every 30 seconds

        // Log startup time
        console.log(chalk.magenta(`🚀 Bot started at ${new Date().toLocaleString()}`));
    },
};