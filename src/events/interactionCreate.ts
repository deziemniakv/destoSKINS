import {
  Events,
  Interaction,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { BotClient } from "../types";
import { log } from "../utils/logger";

export default {
  name: Events.InteractionCreate,
  async execute(
    interaction: Interaction,
    client: BotClient
  ): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      log.warn(`Unknown command: ${interaction.commandName}`);
      await interaction.reply({
        content: "Unknown command!",
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction, client);
    } catch (error) {
      log.error(`Error executing /${interaction.commandName}`, error as Error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("❌ Command Error")
        .setDescription(
          "An unexpected error occurred while executing this command.\n" +
          "Please try again later."
        )
        .setTimestamp();

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] }).catch(() => null);
      } else {
        await interaction
          .reply({ embeds: [errorEmbed], ephemeral: true })
          .catch(() => null);
      }
    }
  },
};
