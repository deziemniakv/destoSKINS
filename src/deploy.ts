import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { log } from "./utils/logger";

dotenv.config();

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  log.error("Missing DISCORD_TOKEN or CLIENT_ID in .env");
  process.exit(1);
}

async function deployCommands(): Promise<void> {
  const commands: unknown[] = [];
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    const cmd = command.default ?? command;

    if ("data" in cmd && "execute" in cmd) {
      commands.push(cmd.data.toJSON());
      log.info(`Loaded command: ${cmd.data.name}`);
    }
  }

  const rest = new REST().setToken(DISCORD_TOKEN!);

  try {
    log.info(`Deploying ${commands.length} commands...`);

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID),
        { body: commands }
      );
      log.info(`✅ Deployed ${commands.length} guild commands to ${GUILD_ID}`);
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID!), {
        body: commands,
      });
      log.info(`✅ Deployed ${commands.length} global commands`);
    }
  } catch (error) {
    log.error("Failed to deploy commands", error as Error);
    process.exit(1);
  }
}

deployCommands();
