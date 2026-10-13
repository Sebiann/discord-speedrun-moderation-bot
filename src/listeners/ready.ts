import { Client } from 'discord.js';
import { checkForNewRuns } from '../speedrun';

export default (client: Client): void => {
  client.on('clientReady', async () => {
    if (!client.user) return;

    console.log(`${client.user.username} is online`);

    const poll = async () => {
      const runs = await checkForNewRuns(process.env.SPEEDRUN_GAME_ID!);
      if (runs.length === 0) return;

      const channel = await client.channels.fetch(process.env.CHANNEL_ID!);
      if (!channel?.isSendable()) return console.error('CHANNEL_ID is not a sendable channel');

      const rawRoles = process.env.PING_ROLES as string;
      const rawUsers = process.env.PING_USERS as string;

      if (rawRoles !== '') {
        const roles = rawRoles.split(',');
        for (const role of roles) await channel.send(`<@&${role}>`);
      }
      if (rawUsers !== '') {
        const users = rawUsers.split(',');
        for (const user of users) await channel.send(`<@${user}>`);
      }

      for (const run of runs) {
        console.log(`New run to verify: ${run.weblink}`);
        await channel.send(`New run to verify: ${run.weblink}`);
      }
    };

    await poll();
    setInterval(poll, 15 * 60 * 1000);
  });
};
