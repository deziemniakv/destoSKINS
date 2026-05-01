import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildErrorEmbed } from "../utils/embed";
import { getRarityColor, getRarityEmoji, formatCurrency } from "../utils/rarity";
import { log } from "../utils/logger";

const inspect: Command = {
  data: new SlashCommandBuilder()
    .setName("inspect")
    .setDescription("Inspect a specific item from your inventory")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The unique ID of the item")
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

      const item = user.inventory.find((i) => i.uniqueId === uniqueId);

      if (!item) {
        await interaction.editReply({
          embeds: [
            buildErrorEmbed(
              `Item \`${uniqueId}\` not found.\nUse \`/inventory\` to find item IDs.`
            ),
          ],
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(getRarityColor(item.rarity))
        .setTitle(`🔍 Inspecting: ${item.name}`)
        .setImage(item.imageUrl)
        .addFields(
          {
            name: `${getRarityEmoji(item.rarity)} Rarity`,
            value: item.rarity,
            inline: true,
          },
          { name: "🔫 Weapon", value: item.weapon,   inline: true },
          { name: "🏷️ Type",   value: item.skinType, inline: true },
          { name: "🔧 Wear",   value: item.wear,     inline: true },
          {
            name: "💰 Value",
            value: formatCurrency(item.value),
            inline: true,
          },
          {
            name: "📅 Obtained",
            value: `<t:${Math.floor(item.obtainedAt.getTime() / 1000)}:R>`,
            inline: true,
          },
          { name: "🆔 Unique ID", value: `\`${item.uniqueId}\``, inline: false }
        )
        .setFooter({ text: "Use /sell <id> to sell this item" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      log.command(
        interaction.user.id,
        "inspect",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /inspect command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to inspect item.")],
      });
    }
  },
};

export default inspect;