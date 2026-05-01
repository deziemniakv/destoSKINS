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
import { buildInventoryEmbed, buildErrorEmbed } from "../utils/embed";
import { log } from "../utils/logger";

const ITEMS_PER_PAGE = 5;

const inventory: Command = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your item inventory"),

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

      const items      = user.inventory;
      const totalValue = items.reduce((sum, i) => sum + i.value, 0);
      const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
      let   currentPage = 1;

      const avatarUrl =
        interaction.user.displayAvatarURL({ size: 128 }) ??
        "https://cdn.discordapp.com/embed/avatars/0.png";

      const getPageItems = (page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(start, start + ITEMS_PER_PAGE);
      };

      const buildNavRow = (page: number) =>
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("inv_prev")
            .setLabel("◀ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page <= 1),
          new ButtonBuilder()
            .setCustomId("inv_page")
            .setLabel(`${page} / ${totalPages}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("inv_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages)
        );

      const message = await interaction.editReply({
        embeds: [
          buildInventoryEmbed(
            interaction.user.username,
            avatarUrl,
            getPageItems(currentPage),
            currentPage,
            totalPages,
            totalValue
          ),
        ],
        components:
          items.length > ITEMS_PER_PAGE ? [buildNavRow(currentPage)] : [],
      });

      if (items.length <= ITEMS_PER_PAGE) return;

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id,
        time: 120_000,
      });

      collector.on("collect", async (btn) => {
        if (btn.customId === "inv_next") {
          currentPage = Math.min(currentPage + 1, totalPages);
        } else if (btn.customId === "inv_prev") {
          currentPage = Math.max(currentPage - 1, 1);
        }

        await btn.update({
          embeds: [
            buildInventoryEmbed(
              interaction.user.username,
              avatarUrl,
              getPageItems(currentPage),
              currentPage,
              totalPages,
              totalValue
            ),
          ],
          components: [buildNavRow(currentPage)],
        });
      });

      collector.on("end", async () => {
        await interaction.editReply({ components: [] }).catch(() => null);
      });

      log.command(
        interaction.user.id,
        "inventory",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /inventory command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to load inventory.")],
      });
    }
  },
};

export default inventory;