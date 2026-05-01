import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command, BotClient } from "../types";
import { UserRepository } from "../models/User";
import { buildCooldownEmbed, buildErrorEmbed } from "../utils/embed";
import { checkDailyCooldown, formatCooldown } from "../utils/cooldown";
import { formatCurrency } from "../utils/rarity";
import { log } from "../utils/logger";

const DAILY_BASE        = 500;
const DAILY_LEVEL_BONUS = 50;
const XP_REWARD         = 30;

const daily: Command = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily virtual currency reward"),

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

      const { canClaim, remaining } = checkDailyCooldown(user.lastDaily);

      if (!canClaim) {
        await interaction.editReply({
          embeds: [buildCooldownEmbed(formatCooldown(remaining))],
        });
        return;
      }

      // Calculate reward
      const reward = DAILY_BASE + (user.level - 1) * DAILY_LEVEL_BONUS;
      const newBalance     = user.balance + reward;
      const newTotalEarned = user.totalEarned + reward;

      // Persist changes
      UserRepository.updateBalance(
        interaction.user.id,
        newBalance,
        newTotalEarned
      );
      UserRepository.setLastDaily(interaction.user.id);

      // Grant XP
      const { leveledUp, newLevel } = UserRepository.addXP(
        interaction.user.id,
        XP_REWARD
      );

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("🎁 Daily Reward Claimed!")
        .setDescription(
          `You received **${formatCurrency(reward)}**!\n\n` +
          `> Base reward: ${formatCurrency(DAILY_BASE)}\n` +
          `> Level bonus: ${formatCurrency((user.level - 1) * DAILY_LEVEL_BONUS)}\n` +
          `> XP gained: **+${XP_REWARD} XP**` +
          (leveledUp
            ? `\n\n🎊 **LEVEL UP!** You are now **Level ${newLevel}**!`
            : "")
        )
        .addFields(
          {
            name: "💰 New Balance",
            value: formatCurrency(newBalance),
            inline: true,
          },
          {
            name: "⭐ Current Level",
            value: `Level ${leveledUp ? newLevel : user.level}`,
            inline: true,
          }
        )
        .setFooter({ text: "Come back in 24 hours for your next reward!" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      log.command(
        interaction.user.id,
        "daily",
        interaction.guildId ?? undefined
      );
    } catch (error) {
      log.error("Error in /daily command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("Failed to claim daily reward.")],
      });
    }
  },
};

export default daily;