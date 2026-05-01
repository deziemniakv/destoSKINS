import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { Command, BotClient } from "../types";
import { getAllCases } from "../utils/cases";
import { buildCaseEmbed, buildErrorEmbed } from "../utils/embed";
import { log } from "../utils/logger";

const cases: Command = {
  data: new SlashCommandBuilder()
    .setName("cases")
    .setDescription("Browse all available cases"),

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const allCases = getAllCases();
      let currentPage = 0;

      const buildComponents = (page: number) => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("cases_prev")
            .setLabel("◀ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("cases_page")
            .setLabel(`${page + 1} / ${allCases.length}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("cases_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= allCases.length - 1)
        );
        return [row];
      };

      const currentCase = allCases[currentPage];
      if (!currentCase) {
        await interaction.editReply({
          embeds: [buildErrorEmbed("No cases available!")],
        });
        return;
      }

      const message = await interaction.editReply({
        embeds: [buildCaseEmbed(currentCase)],
        components: buildComponents(currentPage),
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      collector.on("collect", async (btnInteraction) => {
        if (btnInteraction.customId === "cases_next") {
          currentPage = Math.min(currentPage + 1, allCases.length - 1);
        } else if (btnInteraction.customId === "cases_prev") {
          currentPage = Math.max(currentPage - 1, 0);
        }

        const updatedCase = allCases[currentPage];
        if (!updatedCase) return;

        await btnInteraction.update({
          embeds: [buildCaseEmbed(updatedCase)],
          components: buildComponents(currentPage),
        });
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] }).catch(() => null);
      });

      log.command(interaction.user.id, "cases", interaction.guildId ?? undefined);
    } catch (error) {
      log.error("Error in /cases command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to load cases.")],
      });
    }
  },
};

export default cases;