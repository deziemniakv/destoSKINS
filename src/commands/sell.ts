import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildErrorEmbed } from "../utils/embed";
import { formatCurrency, getRarityEmoji } from "../utils/rarity";
import { log } from "../utils/logger";

const sell: Command = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory by its unique ID")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The unique ID of the item (from /inventory)")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const uniqueId = interaction.options.getString("id", true).trim();

      const user = UserRepository.findOrCreate(
        interaction.user.id,
        interaction.user.username
      );

      const item = UserRepository.removeInventoryItem(
        interaction.user.id,
        uniqueId
      );

      if (!item) {
        await interaction.editReply({
          embeds: [
            buildErrorEmbed(
              `Item \`${uniqueId}\` not found.\nUse \`/inventory\` to see your item IDs.`
            ),
          ],
        });
        return;
      }

      const newBalance     = user.balance + item.value;
      const newTotalEarned = user.totalEarned + item.value;

      UserRepository.updateBalance(
        interaction.user.id,
        newBalance,
        newTotalEarned
      );
      UserRepository.incrementItemsSold(interaction.user.id);

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("💸 Item Sold!")
        .setThumbnail(item.imageUrl)
        .addFields(
          {
            name: "Item",
            value: `${getRarityEmoji(item.rarity)} **${item.name}**`,
            inline: true,
          },
          { name: "Wear",        value: item.wear,                    inline: true },
          { name: "Sold For",    value: formatCurrency(item.value),   inline: true },
          { name: "New Balance", value: formatCurrency(newBalance),   inline: true }
        )
        .setFooter({ text: "Use /inventory to view remaining items" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      log.command(
        interaction.user.id,
        "sell",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /sell command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to sell item.")],
      });
    }
  },
};

export default sell;