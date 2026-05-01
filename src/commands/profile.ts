import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildProfileEmbed, buildErrorEmbed } from "../utils/embed";
import { log } from "../utils/logger";

const profile: Command = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your player profile and statistics")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("View another user's profile")
        .setRequired(false)
    ) as SlashCommandBuilder,

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const targetUser =
        interaction.options.getUser("user") ?? interaction.user;

      const user = UserRepository.findOrCreate(
        targetUser.id,
        targetUser.username
      );

      const avatarUrl =
        targetUser.displayAvatarURL({ size: 256 }) ??
        "https://cdn.discordapp.com/embed/avatars/0.png";

      const inventoryValue = UserRepository.getInventoryValue(targetUser.id);

      const embed = buildProfileEmbed(
        targetUser.username,
        avatarUrl,
        user.level,
        user.xp,
        user.balance,
        user.casesOpened,
        user.itemsSold,
        inventoryValue
      );

      await interaction.editReply({ embeds: [embed] });

      log.command(
        interaction.user.id,
        "profile",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /profile command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to load profile.")],
      });
    }
  },
};

export default profile;