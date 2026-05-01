import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildBalanceEmbed, buildErrorEmbed } from "../utils/embed";
import { log } from "../utils/logger";

const balance: Command = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your virtual currency balance"),

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const user = UserRepository.findOrCreate(
        interaction.user.id,
        interaction.user.username
      );

      const avatarUrl =
        interaction.user.displayAvatarURL({ size: 128 }) ??
        "https://cdn.discordapp.com/embed/avatars/0.png";

      const embed = buildBalanceEmbed(
        interaction.user.username,
        avatarUrl,
        user.balance,
        user.totalEarned,
        user.totalSpent
      );

      await interaction.editReply({ embeds: [embed] });

      log.command(
        interaction.user.id,
        "balance",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /balance command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to fetch balance. Please try again.")],
      });
    }
  },
};

export default balance;
