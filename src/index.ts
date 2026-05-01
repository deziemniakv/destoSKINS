import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { BotClient, Command } from "./types";
import { log } from "./utils/logger";
import { initDatabase, closeDatabase } from "./models/Database";


dotenv.config();

const { DISCORD_TOKEN } = process.env;

if (!DISCORD_TOKEN) {
  log.error("Missing DISCORD_TOKEN in environment variables");
  process.exit(1);
}


if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs", { recursive: true });
}


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
}) as BotClient;

client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, Collection<string, number>>();


async function loadCommands(): Promise<void> {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      const module = await import(filePath);
      const command: Command = module.default ?? module;

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        log.info(`✅ Loaded command: /${command.data.name}`);
      } else {
        log.warn(`⚠️  Skipped ${file} — missing 'data' or 'execute'`);
      }
    } catch (error) {
      log.error(`Failed to load command: ${file}`, error as Error);
    }
  }
}


async function loadEvents(): Promise<void> {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file);
      const module = await import(filePath);
      const event = module.default ?? module;

      if (event.once) {
        client.once(event.name, (...args: unknown[]) =>
          event.execute(...args, client)
        );
      } else {
        client.on(event.name, (...args: unknown[]) =>
          event.execute(...args, client)
        );
      }

      log.info(`✅ Loaded event: ${event.name}`);
    } catch (error) {
      log.error(`Failed to load event: ${file}`, error as Error);
    }
  }
}


function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    log.info(`Received ${signal} — shutting down gracefully...`);
    client.destroy();
    closeDatabase();
    log.info("Bot shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    log.error("Unhandled Promise Rejection", reason as Error);
  });

  process.on("uncaughtException", (error) => {
    log.error("Uncaught Exception", error);
    process.exit(1);
  });
}


async function bootstrap(): Promise<void> {
  log.info("🚀 Starting CS2 Case Bot...");

  setupGracefulShutdown();

  initDatabase();

  await loadCommands();
  await loadEvents();

  await client.login(DISCORD_TOKEN);
  log.info("🤖 Bot is connecting to Discord...");
}

bootstrap().catch((error) => {
  log.error("Fatal bootstrap error", error as Error);
  process.exit(1);
});
