import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildErrorEmbed } from "../utils/embed";
import { formatCurrency } from "../utils/rarity";
import { Rarity } from "../types";
import { log } from "../utils/logger";

const RARITY_ORDER: Rarity[] = [
  "Consumer Grade",
  "Industrial Grade",
  "Mil-Spec",
  "Restricted",
  "Classified",
  "Covert",
  "Contraband",
];

const sellall: Command = {
  data: new SlashCommandBuilder()
    .setName("sellall")
    .setDescription("Sell all items below a chosen rarity")
    .addStringOption((option) =>
      option
        .setName("below")
        .setDescription("Sell everything below this rarity")
        .setRequired(false)
        .addChoices(
          ...RARITY_ORDER.map((r) => ({ name: r, value: r }))
        )
    ) as SlashCommandBuilder,

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const belowRarity =
        (interaction.options.getString("below") ?? "Classified") as Rarity;
      const belowIndex = RARITY_ORDER.indexOf(belowRarity);

      const user = UserRepository.findOrCreate(
        interaction.user.id,
        interaction.user.username
      );

      if (user.inventory.length === 0) {
        await interaction.editReply({
          embeds: [buildErrorEmbed("Your inventory is empty!")],
        });
        return;
      }

      // Preview what will be sold (read-only check)
      const preview = user.inventory.filter((item) => {
        const idx = RARITY_ORDER.indexOf(item.rarity as Rarity);
        return idx !== -1 && idx < belowIndex;
      });

      if (preview.length === 0) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xfee75c)
              .setTitle("⚠️ Nothing to Sell")
              .setDescription(
                `No items found below **${belowRarity}** in your inventory.`
              ),
          ],
        });
        return;
      }

      const previewValue = preview.reduce((s, i) => s + i.value, 0);

      // Confirmation
      const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("sellall_confirm")
          .setLabel(`Sell ${preview.length} items for ${formatCurrency(previewValue)}`)
          .setStyle(ButtonStyle.Danger)
          .setEmoji("💸"),
        new ButtonBuilder()
          .setCustomId("sellall_cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("❌")
      );

      const confirmEmbed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle("⚠️ Confirm Sell All")
        .setDescription(
          `Selling **${preview.length} items** below **${belowRarity}**.\n\n` +
          `**Total Value:** ${formatCurrency(previewValue)}\n\n` +
          `This action **cannot** be undone!`
        )
        .addFields({
          name: "Items to Sell",
          value:
            preview
              .slice(0, 10)
              .map(
                (i) =>
                  `• ${i.name} (${i.wear}) — ${formatCurrency(i.value)}`
              )
              .join("\n") +
            (preview.length > 10
              ? `\n...and ${preview.length - 10} more`
              : ""),
        })
        .setFooter({ text: "Confirmation expires in 30 seconds" });

      const confirmMsg = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [confirmRow],
      });

      try {
        const btn = await confirmMsg.awaitMessageComponent({
          componentType: ComponentType.Button,
          filter: (i) => i.user.id === interaction.user.id,
          time: 30_000,
        });

        if (btn.customId === "sellall_cancel") {
          await btn.update({
            embeds: [
              new EmbedBuilder()
                .setColor(0x99aab5)
                .setTitle("❌ Cancelled")
                .setDescription("Sell all cancelled."),
            ],
            components: [],
          });
          return;
        }

        // Execute the sell in SQLite
        const { items: sold, totalValue } =
          UserRepository.removeItemsBelowRarity(
            interaction.user.id,
            RARITY_ORDER,
            belowIndex
          );

        const newBalance     = user.balance + totalValue;
        const newTotalEarned = user.totalEarned + totalValue;

        UserRepository.updateBalance(
          interaction.user.id,
          newBalance,
          newTotalEarned
        );
        UserRepository.incrementItemsSold(interaction.user.id, sold.length);

        await btn.update({
          embeds: [
            new EmbedBuilder()
              .setColor(0x57f287)
              .setTitle("💸 Sold All Items!")
              .addFields(
                { name: "Items Sold",   value: `${sold.length}`,          inline: true },
                { name: "Total Earned", value: formatCurrency(totalValue), inline: true },
                { name: "New Balance",  value: formatCurrency(newBalance), inline: true }
              )
              .setTimestamp(),
          ],
          components: [],
        });
      } catch {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x99aab5)
              .setTitle("⏱️ Timed Out")
              .setDescription("Sell all cancelled due to inactivity."),
          ],
          components: [],
        });
      }

      log.command(
        interaction.user.id,
        "sellall",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /sellall command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to sell items.")],
        components: [],
      });
    }
  },
};

export default sellall;