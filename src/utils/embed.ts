import { EmbedBuilder } from "discord.js";
import { InventoryItem, Case } from "../types";
import { getRarityColor, getRarityEmoji, getRarityGlow, formatCurrency } from "./rarity";


export function buildOpeningEmbed(
  caseData: Case,
  item: InventoryItem,
  username: string
): EmbedBuilder {
  const rarityColor = getRarityColor(item.rarity);
  const rarityEmoji = getRarityEmoji(item.rarity);
  const glowEffect = getRarityGlow(item.rarity);

  return new EmbedBuilder()
    .setColor(rarityColor)
    .setTitle(`🎰 Case Opened — ${caseData.name}`)
    .setDescription(
      `${glowEffect}\n` +
      `**${username}** received a **${item.rarity}** item!\n` +
      `${glowEffect}`
    )
    .setThumbnail(caseData.imageUrl)
    .setImage(item.imageUrl)
    .addFields(
      {
        name: `${rarityEmoji} Item`,
        value: `**${item.name}**`,
        inline: true,
      },
      {
        name: "🔫 Weapon",
        value: item.weapon,
        inline: true,
      },
      {
        name: "⭐ Rarity",
        value: item.rarity,
        inline: true,
      },
      {
        name: "🔧 Wear",
        value: item.wear,
        inline: true,
      },
      {
        name: "💰 Market Value",
        value: formatCurrency(item.value),
        inline: true,
      },
      {
        name: "🏷️ Type",
        value: item.skinType,
        inline: true,
      }
    )
    .setFooter({
      text: `Added to inventory • Use /sell to sell this item`,
    })
    .setTimestamp();
}

export function buildSpinningEmbed(caseData: Case): EmbedBuilder {
  const spinFrames = [
    "◀️ 🎰🎰🎰🎰🎰 ▶️",
    "◀️ 💫🎰🎰🎰💫 ▶️",
    "◀️ ✨💫🎰💫✨ ▶️",
  ];
  const frame =
    spinFrames[Math.floor(Math.random() * spinFrames.length)] ?? spinFrames[0];

  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle(`🎰 Opening ${caseData.name}...`)
    .setDescription(`${frame}\n\n**Rolling the wheel of fate...**`)
    .setThumbnail(caseData.imageUrl)
    .setFooter({ text: "Please wait..." });
}


export function buildBalanceEmbed(
  username: string,
  avatarUrl: string,
  balance: number,
  totalEarned: number,
  totalSpent: number
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("💰 Wallet")
    .setAuthor({ name: username, iconURL: avatarUrl })
    .addFields(
      {
        name: "Current Balance",
        value: formatCurrency(balance),
        inline: true,
      },
      {
        name: "Total Earned",
        value: formatCurrency(totalEarned),
        inline: true,
      },
      {
        name: "Total Spent",
        value: formatCurrency(totalSpent),
        inline: true,
      }
    )
    .setFooter({ text: "Use /daily to claim your daily reward!" })
    .setTimestamp();
}


export function buildErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle("❌ Error")
    .setDescription(message)
    .setTimestamp();
}


export function buildSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}


export function buildCooldownEmbed(remaining: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle("⏳ Cooldown Active")
    .setDescription(
      `You need to wait **${remaining}** before using this command again.`
    )
    .setTimestamp();
}


export function buildInventoryEmbed(
  username: string,
  avatarUrl: string,
  items: InventoryItem[],
  page: number,
  totalPages: number,
  totalValue: number
): EmbedBuilder {
  if (items.length === 0) {
    return new EmbedBuilder()
      .setColor(0x99aab5)
      .setTitle("🎒 Inventory")
      .setAuthor({ name: username, iconURL: avatarUrl })
      .setDescription(
        "Your inventory is empty! Open some cases with `/opencase`."
      )
      .setTimestamp();
  }

  const itemList = items
    .map((item, index) => {
      const emoji = getRarityEmoji(item.rarity);
      return (
        `**${index + 1}.** ${emoji} **${item.name}**\n` +
        `   └ ${item.wear} • ${formatCurrency(item.value)} • ID: \`${item.uniqueId}\``
      );
    })
    .join("\n\n");

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎒 Inventory")
    .setAuthor({ name: username, iconURL: avatarUrl })
    .setDescription(itemList)
    .addFields({
      name: "📊 Inventory Value",
      value: formatCurrency(totalValue),
      inline: true,
    })
    .setFooter({
      text: `Page ${page}/${totalPages} • Use /inspect <id> for item details`,
    })
    .setTimestamp();
}


export function buildProfileEmbed(
  username: string,
  avatarUrl: string,
  level: number,
  xp: number,
  balance: number,
  casesOpened: number,
  itemsSold: number,
  inventoryValue: number
): EmbedBuilder {
  const xpForNext = Math.floor(level * 100 * (1 + level * 0.5));
  const progressBar = buildXPBar(xp, xpForNext);

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📋 Player Profile")
    .setAuthor({ name: username, iconURL: avatarUrl })
    .setThumbnail(avatarUrl)
    .addFields(
      {
        name: "🏆 Level",
        value: `**${level}**`,
        inline: true,
      },
      {
        name: "⭐ XP",
        value: `${xp} / ${xpForNext}\n${progressBar}`,
        inline: false,
      },
      {
        name: "💰 Balance",
        value: formatCurrency(balance),
        inline: true,
      },
      {
        name: "📦 Cases Opened",
        value: `${casesOpened}`,
        inline: true,
      },
      {
        name: "💸 Items Sold",
        value: `${itemsSold}`,
        inline: true,
      },
      {
        name: "🎒 Inventory Value",
        value: formatCurrency(inventoryValue),
        inline: true,
      }
    )
    .setTimestamp();
}


function buildXPBar(current: number, max: number): string {
  const safeMax = Math.max(max, 1);
  const filled = Math.min(10, Math.round((current / safeMax) * 10));
  const empty = 10 - filled;
  const percent = Math.min(100, Math.round((current / safeMax) * 100));
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
}


export function buildLeaderboardEmbed(
  entries: Array<{ username: string; balance: number; level: number }>,
  type: "balance" | "level"
): EmbedBuilder {
  const medals = ["🥇", "🥈", "🥉"];

  const description =
    entries
      .map((entry, i) => {
        const medal = medals[i] ?? `**${i + 1}.**`;
        const value =
          type === "balance"
            ? formatCurrency(entry.balance)
            : `Level ${entry.level}`;
        return `${medal} **${entry.username}** — ${value}`;
      })
      .join("\n") || "No data yet!";

  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle(
      type === "balance" ? "💰 Richest Players" : "⭐ Top Level Players"
    )
    .setDescription(description)
    .setFooter({ text: "Updated in real-time" })
    .setTimestamp();
}


export function buildCaseEmbed(caseData: Case): EmbedBuilder {
  const rarityInfo = caseData.rarityPools
    .map((pool) => {
      const emoji = getRarityEmoji(pool.rarity);
      return `${emoji} **${pool.rarity}** — ${pool.chance}% (${pool.items.length} items)`;
    })
    .join("\n");

  return new EmbedBuilder()
    .setColor(caseData.color)
    .setTitle(`📦 ${caseData.name}`)
    .setDescription(caseData.description)
    .setThumbnail(caseData.imageUrl)
    .addFields(
      {
        name: "💰 Price",
        value: formatCurrency(caseData.price),
        inline: true,
      },
      {
        name: "🆔 Case ID",
        value: `\`${caseData.id}\``,
        inline: true,
      },
      {
        name: "📊 Drop Chances",
        value: rarityInfo,
        inline: false,
      }
    )
    .setFooter({
      text: `Use /opencase ${caseData.id} to open this case!`,
    });
}
