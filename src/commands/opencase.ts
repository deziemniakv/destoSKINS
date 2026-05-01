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
import { getCaseById, getAllCases, openCase } from "../utils/cases";
import {
  buildOpeningEmbed,
  buildSpinningEmbed,
  buildErrorEmbed,
} from "../utils/embed";
import { checkCooldown, formatCooldown } from "../utils/cooldown";
import { formatCurrency } from "../utils/rarity";
import { log } from "../utils/logger";

const OPEN_COOLDOWN_SECONDS = 5;
const XP_PER_OPEN           = 15;

const opencase: Command = {
  data: new SlashCommandBuilder()
    .setName("opencase")
    .setDescription("Open a CS2-style case with virtual currency")
    .addStringOption((option) =>
      option
        .setName("case")
        .setDescription("The case to open")
        .setRequired(true)
        .addChoices(
          ...getAllCases().map((c) => ({ name: c.name, value: c.id }))
        )
    ) as SlashCommandBuilder,

  cooldown: OPEN_COOLDOWN_SECONDS,

  async execute(
    interaction: ChatInputCommandInteraction,
    client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const { onCooldown, remaining } = checkCooldown(
        client,
        interaction.user.id,
        "opencase",
        OPEN_COOLDOWN_SECONDS
      );

      if (onCooldown) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xfee75c)
              .setTitle("⏳ Slow down!")
              .setDescription(
                `You can open another case in **${formatCooldown(remaining)}**.`
              ),
          ],
        });
        return;
      }

      const caseId   = interaction.options.getString("case", true);
      const caseData = getCaseById(caseId);

      if (!caseData) {
        await interaction.editReply({
          embeds: [buildErrorEmbed(`Case \`${caseId}\` not found!`)],
        });
        return;
      }

      const user = UserRepository.findOrCreate(
        interaction.user.id,
        interaction.user.username
      );

      if (user.balance < caseData.price) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xed4245)
              .setTitle("❌ Insufficient Funds")
              .setDescription(
                `You need **${formatCurrency(caseData.price)}** to open this case.\n` +
                `Your balance: **${formatCurrency(user.balance)}**\n` +
                `Missing: **${formatCurrency(caseData.price - user.balance)}**\n\n` +
                `Use \`/daily\` to earn more coins!`
              ),
          ],
        });
        return;
      }

      const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_open")
          .setLabel(`Open for ${formatCurrency(caseData.price)}`)
          .setStyle(ButtonStyle.Success)
          .setEmoji("🎰"),
        new ButtonBuilder()
          .setCustomId("cancel_open")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("❌")
      );

      const confirmEmbed = new EmbedBuilder()
        .setColor(caseData.color)
        .setTitle(`📦 Open ${caseData.name}?`)
        .setDescription(
          `Spend **${formatCurrency(caseData.price)}**?\n\n` +
          `**Your Balance:** ${formatCurrency(user.balance)}\n` +
          `**After Opening:** ${formatCurrency(user.balance - caseData.price)}`
        )
        .setThumbnail(caseData.imageUrl)
        .setFooter({ text: "Expires in 30 seconds" });

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

        if (btn.customId === "cancel_open") {
          await btn.update({
            embeds: [
              new EmbedBuilder()
                .setColor(0x99aab5)
                .setTitle("❌ Cancelled")
                .setDescription("Case opening cancelled."),
            ],
            components: [],
          });
          return;
        }

        await btn.deferUpdate();
      } catch {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x99aab5)
              .setTitle("⏱️ Timed Out")
              .setDescription("Case opening cancelled due to inactivity."),
          ],
          components: [],
        });
        return;
      }

      await interaction.editReply({
        embeds: [buildSpinningEmbed(caseData)],
        components: [],
      });
      await new Promise((res) => setTimeout(res, 2000));

      const newBalance   = user.balance - caseData.price;
      const newTotalSpent = user.totalSpent + caseData.price;

      UserRepository.updateBalance(
        interaction.user.id,
        newBalance,
        undefined,
        newTotalSpent
      );
      UserRepository.incrementCasesOpened(interaction.user.id);

      const droppedItem = openCase(caseData);

      if (!droppedItem) {
        UserRepository.updateBalance(
          interaction.user.id,
          user.balance,
          undefined,
          user.totalSpent
        );
        await interaction.editReply({
          embeds: [buildErrorEmbed("Case opening failed. Coins refunded.")],
        });
        return;
      }

      UserRepository.addInventoryItem(interaction.user.id, droppedItem);

      UserRepository.addXP(interaction.user.id, XP_PER_OPEN);

      const resultEmbed = buildOpeningEmbed(
        caseData,
        droppedItem,
        interaction.user.username
      );

      const sellRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`quick_sell_${droppedItem.uniqueId}`)
          .setLabel(`Sell for ${formatCurrency(droppedItem.value)}`)
          .setStyle(ButtonStyle.Danger)
          .setEmoji("💸"),
        new ButtonBuilder()
          .setCustomId("keep_item")
          .setLabel("Keep Item")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🎒")
      );

      await interaction.editReply({
        embeds: [resultEmbed],
        components: [sellRow],
      });

      log.info(
        `[CASE] ${interaction.user.username} opened ${caseData.name} → ${droppedItem.name} (${droppedItem.rarity})`
      );

      try {
        const sellBtn = await (
          await interaction.fetchReply()
        ).awaitMessageComponent({
          componentType: ComponentType.Button,
          filter: (i) => i.user.id === interaction.user.id,
          time: 30_000,
        });

        if (sellBtn.customId === `quick_sell_${droppedItem.uniqueId}`) {
          const removed = UserRepository.removeInventoryItem(
            interaction.user.id,
            droppedItem.uniqueId
          );

          if (removed) {
            const afterSell = newBalance + droppedItem.value;
            UserRepository.updateBalance(
              interaction.user.id,
              afterSell,
              user.totalEarned + droppedItem.value
            );
            UserRepository.incrementItemsSold(interaction.user.id);

            await sellBtn.update({
              embeds: [
                resultEmbed,
                new EmbedBuilder()
                  .setColor(0x57f287)
                  .setTitle("💸 Item Sold!")
                  .setDescription(
                    `Sold **${droppedItem.name}** for **${formatCurrency(droppedItem.value)}**\n` +
                    `New balance: **${formatCurrency(afterSell)}**`
                  ),
              ],
              components: [],
            });
          }
        } else {
          await sellBtn.update({ components: [] });
        }
      } catch {
        await interaction.editReply({ components: [] }).catch(() => null);
      }
    } catch (error) {
      log.error("Error in /opencase command", error as Error);
      await interaction.editReply({
        embeds: [buildErrorEmbed("An error occurred during case opening.")],
        components: [],
      });
    }
  },
};

export default opencase;
