import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildLeaderboardEmbed, buildErrorEmbed } from "../utils/embed";
import { log } from "../utils/logger";

const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top players leaderboard")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Leaderboard type")
        .setRequired(false)
        .addChoices(
          { name: "Richest Players", value: "balance" },
          { name: "Highest Level",   value: "level"   }
        )
    ) as SlashCommandBuilder,

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      let currentType =
        (interaction.options.getString("type") ?? "balance") as
          | "balance"
          | "level";

      const buildRow = (type: "balance" | "level") =>
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("lb_balance")
            .setLabel("💰 Richest")
            .setStyle(
              type === "balance" ? ButtonStyle.Primary : ButtonStyle.Secondary
            ),
          new ButtonBuilder()
            .setCustomId("lb_level")
            .setLabel("⭐ Level")
            .setStyle(
              type === "level" ? ButtonStyle.Primary : ButtonStyle.Secondary
            )
        );

      const entries = UserRepository.getLeaderboard(currentType);

      const message = await interaction.editReply({
        embeds: [buildLeaderboardEmbed(entries, currentType)],
        components: [buildRow(currentType)],
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      collector.on("collect", async (btn) => {
        currentType = btn.customId === "lb_balance" ? "balance" : "level";
        const newEntries = UserRepository.getLeaderboard(currentType);

        await btn.update({
          embeds: [buildLeaderboardEmbed(newEntries, currentType)],
          components: [buildRow(currentType)],
        });
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] }).catch(() => null);
      });

      log.command(
        interaction.user.id,
        "leaderboard",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /leaderboard command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to load leaderboard.")],
      });
    }
  },
};

export default leaderboard;