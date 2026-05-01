import { Events, Client, ActivityType } from "discord.js";
import { log } from "../utils/logger";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client): void {
    if (!client.user) return;

    log.info(`✅ Bot is online as ${client.user.tag}`);
    log.info(`📊 Serving ${client.guilds.cache.size} guilds`);

    // Set bot activity
    client.user.setPresence({
      activities: [
        {
          name: "CS2 Cases | /cases",
          type: ActivityType.Playing,
        },
      ],
      status: "online",
    });

    // Rotate status every 5 minutes
    setInterval(() => {
      const statuses = [
        { name: "CS2 Cases | /cases", type: ActivityType.Playing },
        { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
        { name: "/opencase to try your luck!", type: ActivityType.Playing },
        { name: "/daily for free coins", type: ActivityType.Playing },
      ];

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      if (status) {
        client.user?.setActivity(status.name, { type: status.type });
      }
    }, 5 * 60 * 1000);
  },
};