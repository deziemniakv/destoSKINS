import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Collection,
  Message,
} from "discord.js";
import { Command, BotClient, Case, InventoryItem } from "../types/index";
import { UserRepository } from "../models/User";
import { getCaseById, getAllCases, openCase } from "../utils/cases";
import {
  formatCurrency,
  getRarityEmoji,
  getRarityColor,
} from "../utils/rarity";
import { buildErrorEmbed } from "../utils/embed";
import { log } from "../utils/logger";

type BattleMode = "normal" | "underdog" | "terminal" | "crazy_terminal";
type BattleSize = 2 | 3 | 4;

interface RoundResult {
  roundNumber:  number;
  caseId:       string;
  caseName:     string;
  drops:        Map<string, InventoryItem>;
}

interface BattleParticipant {
  userId:        string;
  username:      string;
  avatarUrl:     string;
  isBot:         boolean;
  allItems:      InventoryItem[]; 
  totalValue:    number;          
  roundValues:   number[];        
}

interface ActiveBattle {
  hostId:       string;
  caseIds:      string[];         
  mode:         BattleMode;
  size:         BattleSize;
  participants: BattleParticipant[];
  roundResults: RoundResult[];
  status:       "waiting" | "running" | "finished";
  createdAt:    number;
}

const BOT_NAMES = [
  "CaseMaster_Bot",
  "SkinHunter_AI",
  "LuckyDrop_Bot",
  "RNG_Overlord",
  "CrateKing_Bot",
  "DropGod_Bot",
  "SkinSniper_AI",
  "VaultBreaker_Bot",
];

const MODE_INFO: Record<
  BattleMode,
  { label: string; emoji: string; description: string }
> = {
  normal: {
    label:       "Normal",
    emoji:       "🏆",
    description: "Highest **total value** across ALL cases wins.",
  },
  underdog: {
    label:       "Underdog",
    emoji:       "🐶",
    description: "Lowest **total value** across ALL cases wins.",
  },
  terminal: {
    label:       "Terminal",
    emoji:       "💀",
    description:
      "Only the **LAST case** decides the winner. Earlier cases are opened for fun — results don't matter until the final round.",
  },
  crazy_terminal: {
    label:       "Crazy Terminal",
    emoji:       "🌀",
    description:
      "The **FIRST case** decides the winner immediately. The battle continues for show, but the outcome is already sealed from round 1.",
  },
};

function randomBotName(): string {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] ?? "Bot_Player";
}

function makeBotParticipant(index: number): BattleParticipant {
  return {
    userId:      `bot_${Date.now()}_${index}`,
    username:    randomBotName(),
    avatarUrl:   "",
    isBot:       false,
    allItems:    [],
    totalValue:  0,
    roundValues: [],
  };
}

function fillWithBots(battle: ActiveBattle): void {
  const needed = battle.size - battle.participants.length;
  for (let i = 0; i < needed; i++) {
    battle.participants.push(makeBotParticipant(i));
  }
}

function refundParticipants(
  participants: BattleParticipant[],
  totalCost: number
): void {
  for (const p of participants) {
    if (!p.isBot) {
      const u = UserRepository.findOrCreate(p.userId, p.username);
      UserRepository.updateBalance(
        p.userId,
        u.balance + totalCost,
        u.totalEarned + totalCost
      );
    }
  }
}

function getTotalCost(battle: ActiveBattle): number {
  const allCases = getAllCases();
  return battle.caseIds.reduce((sum, id) => {
    const c = allCases.find((x) => x.id === id);
    return sum + (c?.price ?? 0);
  }, 0);
}

function determineWinner(
  battle: ActiveBattle,
  mode: BattleMode
): BattleParticipant {
  let scored: BattleParticipant[];

  if (mode === "terminal") {
    scored = [...battle.participants].sort(
      (a, b) =>
        (b.roundValues[b.roundValues.length - 1] ?? 0) -
        (a.roundValues[a.roundValues.length - 1] ?? 0)
    );
  } else if (mode === "crazy_terminal") {
    scored = [...battle.participants].sort(
      (a, b) => (b.roundValues[0] ?? 0) - (a.roundValues[0] ?? 0)
    );
  } else if (mode === "underdog") {
    scored = [...battle.participants].sort(
      (a, b) => a.totalValue - b.totalValue
    );
  } else {
    scored = [...battle.participants].sort(
      (a, b) => b.totalValue - a.totalValue
    );
  }
  const topScore =
    mode === "terminal"
      ? (scored[0]?.roundValues[scored[0].roundValues.length - 1] ?? 0)
      : mode === "crazy_terminal"
      ? (scored[0]?.roundValues[0] ?? 0)
      : (scored[0]?.totalValue ?? 0);

  const tied = scored.filter((p) => {
    if (mode === "terminal") {
      return (p.roundValues[p.roundValues.length - 1] ?? 0) === topScore;
    }
    if (mode === "crazy_terminal") {
      return (p.roundValues[0] ?? 0) === topScore;
    }
    return p.totalValue === topScore;
  });

  return tied[Math.floor(Math.random() * tied.length)] ?? scored[0]!;
}
function buildWaitingEmbed(
  battle: ActiveBattle,
  cases: Case[]
): EmbedBuilder {
  const modeInfo  = MODE_INFO[battle.mode];
  const totalCost = cases.reduce((s, c) => s + c.price, 0);

  const sizeLabels: Record<BattleSize, string> = {
    2: "1v1",
    3: "1v1v1",
    4: "1v1v1v1",
  };

  const spotsLeft    = battle.size - battle.participants.length;
  const filledSlots  = battle.participants.map(
    (p, i) => `**Slot ${i + 1}:** ${p.isBot ? "🤖" : "👤"} ${p.username}`
  );
  const emptySlots   = Array.from({ length: spotsLeft }).map(
    (_, i) =>
      `**Slot ${battle.participants.length + i + 1}:** ⬜ Waiting...`
  );

  const caseList = cases
    .map((c, i) => `**Round ${i + 1}:** ${c.name} — ${formatCurrency(c.price)}`)
    .join("\n");

  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle("⚔️ Case Battle — Waiting Room")
    .setThumbnail(cases[0]?.imageUrl ?? null)
    .addFields(
      {
        name:   `${modeInfo.emoji} Mode: ${modeInfo.label}`,
        value:  modeInfo.description,
        inline: false,
      },
      {
        name:   "📦 Cases (in order)",
        value:  caseList,
        inline: false,
      },
      {
        name:   "💰 Total Entry Cost",
        value:  formatCurrency(totalCost),
        inline: true,
      },
      {
        name:   "👥 Format",
        value:  sizeLabels[battle.size],
        inline: true,
      },
      {
        name:   "🎮 Players",
        value:  [...filledSlots, ...emptySlots].join("\n"),
        inline: false,
      },
      {
        name:   "🏆 Prize",
        value:
          `Winner receives **ALL ${battle.size * cases.length} skins** dropped across all rounds!`,
        inline: false,
      }
    )
    .setFooter({
      text: `${spotsLeft} spot(s) left • Auto-cancels in 60s`,
    })
    .setTimestamp();
}

function buildRoundEmbed(
  battle: ActiveBattle,
  caseData: Case,
  roundNumber: number,
  totalRounds: number,
  deciderRound: number | null,
  isDecider: boolean
): EmbedBuilder {
  const modeInfo = MODE_INFO[battle.mode];
  let title      = `🎰 Round ${roundNumber}/${totalRounds} — ${caseData.name}`;
  let color      = 0xff6b35;
  let footerText = "Opening cases for all players...";

  if (isDecider && battle.mode === "terminal") {
    title      = `💀 FINAL ROUND — ${caseData.name} — THIS DECIDES EVERYTHING!`;
    color      = 0xed4245;
    footerText = "This is the Terminal round — winner determined here!";
  } else if (isDecider && battle.mode === "crazy_terminal") {
    title      = `🌀 OPENING ROUND — ${caseData.name} — WINNER DECIDED NOW!`;
    color      = 0x9b59b6;
    footerText = "Crazy Terminal: First case decides the winner!";
  }

  const lines = battle.participants.map(
    (p) => `${p.isBot ? "🤖" : "👤"} **${p.username}** — 🎰 Rolling...`
  );

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setThumbnail(caseData.imageUrl)
    .setDescription(lines.join("\n\n"))
    .addFields({
      name:   `${modeInfo.emoji} Mode`,
      value:  modeInfo.label,
      inline: true,
    })
    .setFooter({ text: footerText });
}

function buildRoundResultEmbed(
  battle: ActiveBattle,
  caseData: Case,
  roundResult: RoundResult,
  roundNumber: number,
  totalRounds: number,
  provisionalWinner: BattleParticipant | null,
  mode: BattleMode
): EmbedBuilder {
  const modeInfo = MODE_INFO[mode];
  const isLast   = roundNumber === totalRounds;
  const isFirst  = roundNumber === 1;

  let color = 0x5865f2;
  let title = `📊 Round ${roundNumber}/${totalRounds} Results — ${caseData.name}`;

  if (mode === "terminal" && isLast) {
    title = `💀 Terminal Round Results — ${caseData.name}`;
    color = 0xed4245;
  } else if (mode === "crazy_terminal" && isFirst) {
    title = `🌀 Crazy Terminal — Winner Already Decided!`;
    color = 0x9b59b6;
  }

  const lines = battle.participants.map((p) => {
    const item    = roundResult.drops.get(p.userId);
    const emoji   = item ? getRarityEmoji(item.rarity) : "❓";
    const valStr  = item ? formatCurrency(item.value) : "No drop";
    const nameStr = item ? `**${item.name}** (${item.wear})` : "No item";
    const isWinner =
      provisionalWinner !== null && p.userId === provisionalWinner.userId;

    return (
      `${p.isBot ? "🤖" : "👤"} ${isWinner ? "**" : ""}${p.username}${isWinner ? " 👑**" : ""}\n` +
      `  ${emoji} ${nameStr}\n` +
      `  └ ${valStr}`
    );
  });

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(lines.join("\n\n"))
    .addFields({
      name:   `${modeInfo.emoji} Mode`,
      value:  modeInfo.label,
      inline: true,
    });

  if (provisionalWinner && mode === "crazy_terminal" && isFirst) {
    embed.addFields({
      name:   "🌀 Winner Sealed",
      value:
        `**${provisionalWinner.username}** won in the first round!\n` +
        `The battle continues — but the outcome is already decided.`,
      inline: false,
    });
  }

  if (mode === "terminal" && !isLast) {
    embed.addFields({
      name:   "💀 Terminal Notice",
      value:  `This round's results **do not count** yet.\nOnly the **final round** (Round ${totalRounds}) decides the winner!`,
      inline: false,
    });
  }

  if (!isLast) {
    embed.setFooter({ text: `Next round starting in 3 seconds...` });
  }

  return embed;
}

function buildFinalResultEmbed(
  battle: ActiveBattle,
  cases: Case[],
  winner: BattleParticipant,
  allItems: InventoryItem[]
): EmbedBuilder {
  const modeInfo    = MODE_INFO[battle.mode];
  const totalRounds = cases.length;
  const standings = battle.participants
    .map((p) => {
      const roundBreakdown = p.roundValues
        .map((v, i) => {
          const item    = p.allItems[i];
          const emoji   = item ? getRarityEmoji(item.rarity) : "❓";
          const isDecider =
            (battle.mode === "terminal"   && i === totalRounds - 1) ||
            (battle.mode === "crazy_terminal" && i === 0);

          return (
            `  R${i + 1}${isDecider ? "⭐" : ""}: ` +
            `${emoji} ${item?.name ?? "No item"} — ${formatCurrency(v)}`
          );
        })
        .join("\n");

      const isWinner  = p.userId === winner.userId;
      const totalStr  = formatCurrency(p.totalValue);

      return (
        `${isWinner ? "👑 **" : ""}` +
        `${p.isBot ? "🤖" : "👤"} ${p.username}` +
        `${isWinner ? "**" : ""}\n` +
        roundBreakdown + "\n" +
        `  📊 Total: **${totalStr}**`
      );
    })
    .join("\n\n");
  const prizeLines = allItems
    .map(
      (item) =>
        `${getRarityEmoji(item.rarity)} **${item.name}** (${item.wear}) — ${formatCurrency(item.value)}`
    )
    .join("\n");

  const totalPrizeValue = allItems.reduce((s, i) => s + i.value, 0);
  const bestItem = allItems.reduce(
    (best, item) => (item.value > (best?.value ?? 0) ? item : best),
    allItems[0]
  );
  let winReason = "";
  if (battle.mode === "terminal") {
    const lastVal =
      winner.roundValues[winner.roundValues.length - 1] ?? 0;
    winReason = `Won via **Terminal** — Final round drop: ${formatCurrency(lastVal)}`;
  } else if (battle.mode === "crazy_terminal") {
    const firstVal = winner.roundValues[0] ?? 0;
    winReason = `Won via **Crazy Terminal** — First round drop: ${formatCurrency(firstVal)}`;
  } else if (battle.mode === "underdog") {
    winReason = `Won via **Underdog** — Lowest total: ${formatCurrency(winner.totalValue)}`;
  } else {
    winReason = `Won via **Normal** — Highest total: ${formatCurrency(winner.totalValue)}`;
  }

  return new EmbedBuilder()
    .setColor(bestItem ? getRarityColor(bestItem.rarity) : 0xffd700)
    .setTitle("⚔️ Case Battle — Final Results!")
    .setImage(bestItem?.imageUrl ?? null)
    .addFields(
      {
        name:   `${modeInfo.emoji} Mode: ${modeInfo.label}`,
        value:  modeInfo.description,
        inline: false,
      },
      {
        name:   "🎉 Winner",
        value:  `${winner.isBot ? "🤖" : "👤"} **${winner.username}**\n${winReason}`,
        inline: false,
      },
      {
        name:   "📊 Full Standings",
        value:  standings || "No data",
        inline: false,
      },
      {
        name:
          `🎁 Prize Pool — All ${allItems.length} Skins → ${winner.username}`,
        value:
          (prizeLines || "No items") +
          `\n\n💰 **Total Prize Value: ${formatCurrency(totalPrizeValue)}**`,
        inline: false,
      }
    )
    .setFooter({
      text: winner.isBot
        ? "The bot claimed all skins. Better luck next time!"
        : `${winner.username} received all ${allItems.length} skins! Check /inventory.`,
    })
    .setTimestamp();
}
async function runBattle(
  battle: ActiveBattle,
  cases: Case[],
  interaction: ChatInputCommandInteraction,
  editTarget: Message
): Promise<void> {
  battle.status       = "running";
  const totalRounds   = cases.length;
  const allDroppedItems: InventoryItem[] = [];

  let crazyTerminalWinner: BattleParticipant | null = null;
  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const caseData    = cases[roundIndex]!;
    const roundNumber = roundIndex + 1;
    const isDecider   =
      (battle.mode === "terminal"       && roundNumber === totalRounds) ||
      (battle.mode === "crazy_terminal" && roundNumber === 1);

    await editTarget.edit({
      embeds: [
        buildRoundEmbed(
          battle,
          caseData,
          roundNumber,
          totalRounds,
          isDecider ? roundNumber : null,
          isDecider
        ),
      ],
      components: [],
    });

    await new Promise((res) => setTimeout(res, 2500));

    const roundResult: RoundResult = {
      roundNumber,
      caseId:   caseData.id,
      caseName: caseData.name,
      drops:    new Map(),
    };

    for (const participant of battle.participants) {
      const item = openCase(caseData);

      if (item) {
        roundResult.drops.set(participant.userId, item);
        participant.allItems.push(item);
        participant.totalValue  += item.value;
        participant.roundValues.push(item.value);
        allDroppedItems.push(item);
      } else {
        participant.roundValues.push(0);
      }
    }

    battle.roundResults.push(roundResult);

    if (battle.mode === "crazy_terminal" && roundNumber === 1) {
      crazyTerminalWinner = determineWinner(battle, "crazy_terminal");
    }

    await editTarget.edit({
      embeds: [
        buildRoundResultEmbed(
          battle,
          caseData,
          roundResult,
          roundNumber,
          totalRounds,
          crazyTerminalWinner,
          battle.mode
        ),
      ],
    });

    if (roundIndex < totalRounds - 1) {
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  await new Promise((res) => setTimeout(res, 2000));

  const winner = determineWinner(battle, battle.mode);

  if (!winner.isBot && allDroppedItems.length > 0) {
    for (const item of allDroppedItems) {
      UserRepository.addInventoryItem(winner.userId, item);
    }

    UserRepository.addXP(winner.userId, 25 * battle.size * totalRounds);

    log.info(
      `[BATTLE] Winner: ${winner.username} received ` +
      `${allDroppedItems.length} skins worth ` +
      `${formatCurrency(allDroppedItems.reduce((s, i) => s + i.value, 0))} ` +
      `(${battle.mode} mode, ${totalRounds} round(s))`
    );
  }

  await editTarget.edit({
    embeds:     [buildFinalResultEmbed(battle, cases, winner, allDroppedItems)],
    components: [],
  });

  activeBattles.delete(battle.hostId);
  battle.status = "finished";
}

function buildWaitingButtons(
  hostId: string,
  totalCost: number,
  battle: ActiveBattle
): ActionRowBuilder<ButtonBuilder> {
  const spotsLeft = battle.size - battle.participants.length;

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`battle_join_${hostId}`)
      .setLabel(`⚔️ Join — ${formatCurrency(totalCost)}`)
      .setStyle(ButtonStyle.Success)
      .setDisabled(spotsLeft === 0),
    new ButtonBuilder()
      .setCustomId(`battle_bots_${hostId}`)
      .setLabel("🤖 Fill Bots & Start")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`battle_cancel_${hostId}`)
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Danger)
  );
}

const activeBattles = new Collection<string, ActiveBattle>();

const casebattle: Command = {
  data: new SlashCommandBuilder()
    .setName("casebattle")
    .setDescription(
      "Start a multi-round case battle. Winner takes ALL skins!"
    )
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription(
          "Normal=total | Underdog=lowest | Terminal=last round only | CrazyTerminal=first round only"
        )
        .setRequired(true)
        .addChoices(
          { name: "🏆 Normal — Highest total value wins",             value: "normal"         },
          { name: "🐶 Underdog — Lowest total value wins",            value: "underdog"       },
          { name: "💀 Terminal — Only the LAST case decides",         value: "terminal"       },
          { name: "🌀 Crazy Terminal — Only the FIRST case decides",  value: "crazy_terminal" }
        )
    )
    .addIntegerOption((opt) =>
      opt
        .setName("size")
        .setDescription("Number of players")
        .setRequired(true)
        .addChoices(
          { name: "1v1       (2 players)", value: 2 },
          { name: "1v1v1     (3 players)", value: 3 },
          { name: "1v1v1v1   (4 players)", value: 4 }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("case1")
        .setDescription("Round 1 case (required)")
        .setRequired(true)
        .addChoices(
          ...getAllCases().map((c) => ({
            name:  `${c.name} — ${c.price} coins`,
            value: c.id,
          }))
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("case2")
        .setDescription("Round 2 case (optional)")
        .setRequired(false)
        .addChoices(
          ...getAllCases().map((c) => ({
            name:  `${c.name} — ${c.price} coins`,
            value: c.id,
          }))
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("case3")
        .setDescription("Round 3 case (optional)")
        .setRequired(false)
        .addChoices(
          ...getAllCases().map((c) => ({
            name:  `${c.name} — ${c.price} coins`,
            value: c.id,
          }))
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("case4")
        .setDescription("Round 4 case (optional)")
        .setRequired(false)
        .addChoices(
          ...getAllCases().map((c) => ({
            name:  `${c.name} — ${c.price} coins`,
            value: c.id,
          }))
        )
    )
    .addStringOption((opt) =>
      opt
        .setName("case5")
        .setDescription("Round 5 case (optional)")
        .setRequired(false)
        .addChoices(
          ...getAllCases().map((c) => ({
            name:  `${c.name} — ${c.price} coins`,
            value: c.id,
          }))
        )
    ) as SlashCommandBuilder,

  async execute(
    interaction: ChatInputCommandInteraction,
    _client: BotClient
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const hostId = interaction.user.id;
      const mode   = interaction.options.getString("mode", true) as BattleMode;
      const size   = interaction.options.getInteger("size", true) as BattleSize;
      const rawCaseIds = [
        interaction.options.getString("case1", true),
        interaction.options.getString("case2"),
        interaction.options.getString("case3"),
        interaction.options.getString("case4"),
        interaction.options.getString("case5"),
      ].filter((id): id is string => id !== null);

      const resolvedCases: Case[] = [];
      for (const id of rawCaseIds) {
        const c = getCaseById(id);
        if (!c) {
          await interaction.editReply({
            embeds: [buildErrorEmbed(`Case \`${id}\` not found!`)],
          });
          return;
        }
        resolvedCases.push(c);
      }

      if (
        (mode === "terminal" || mode === "crazy_terminal") &&
        resolvedCases.length < 2
      ) {
        await interaction.editReply({
          embeds: [
            buildErrorEmbed(
              `**${MODE_INFO[mode].label}** mode requires at least **2 cases**.\n` +
              `Add a second case using the \`case2\` option.`
            ),
          ],
        });
        return;
      }

      if (activeBattles.has(hostId)) {
        await interaction.editReply({
          embeds: [buildErrorEmbed("You already have an active battle!")],
        });
        return;
      }

      const totalCost = resolvedCases.reduce((s, c) => s + c.price, 0);

      const hostUser = UserRepository.findOrCreate(
        hostId,
        interaction.user.username
      );

      if (hostUser.balance < totalCost) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xed4245)
              .setTitle("❌ Insufficient Funds")
              .setDescription(
                `You need **${formatCurrency(totalCost)}** to start this battle ` +
                `(${resolvedCases.length} case(s) × entry).\n` +
                `Your balance: **${formatCurrency(hostUser.balance)}**`
              ),
          ],
        });
        return;
      }

      UserRepository.updateBalance(
        hostId,
        hostUser.balance - totalCost,
        undefined,
        hostUser.totalSpent + totalCost
      );

      const battle: ActiveBattle = {
        hostId,
        caseIds:      resolvedCases.map((c) => c.id),
        mode,
        size,
        participants: [
          {
            userId:      hostId,
            username:    interaction.user.username,
            avatarUrl:   interaction.user.displayAvatarURL({ size: 64 }),
            isBot:       false,
            allItems:    [],
            totalValue:  0,
            roundValues: [],
          },
        ],
        roundResults: [],
        status:       "waiting",
        createdAt:    Date.now(),
      };

      activeBattles.set(hostId, battle);

      const waitMsg = await interaction.editReply({
        embeds:     [buildWaitingEmbed(battle, resolvedCases)],
        components: [buildWaitingButtons(hostId, totalCost, battle)],
      });

      const collector = waitMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time:          60_000,
      });

      collector.on("collect", async (btn) => {
        const current = activeBattles.get(hostId);
        if (!current || current.status !== "waiting") {
          await btn.reply({
            content:   "This battle is no longer active.",
            ephemeral: true,
          });
          return;
        }

        if (btn.customId === `battle_cancel_${hostId}`) {
          if (btn.user.id !== hostId) {
            await btn.reply({
              content:   "Only the host can cancel.",
              ephemeral: true,
            });
            return;
          }

          refundParticipants(current.participants, totalCost);
          activeBattles.delete(hostId);
          collector.stop("cancelled");

          await btn.update({
            embeds: [
              new EmbedBuilder()
                .setColor(0x99aab5)
                .setTitle("❌ Battle Cancelled")
                .setDescription("All entry fees have been **refunded**."),
            ],
            components: [],
          });
          return;
        }

        if (btn.customId === `battle_bots_${hostId}`) {
          if (btn.user.id !== hostId) {
            await btn.reply({
              content:   "Only the host can fill with bots.",
              ephemeral: true,
            });
            return;
          }

          fillWithBots(current);
          collector.stop("bots_filled");

          await btn.update({
            embeds:     [buildWaitingEmbed(current, resolvedCases)],
            components: [],
          });

          await runBattle(current, resolvedCases, interaction, waitMsg);
          return;
        }

        if (btn.customId === `battle_join_${hostId}`) {
          if (btn.user.id === hostId) {
            await btn.reply({
              content:   "You can't join your own battle!",
              ephemeral: true,
            });
            return;
          }

          if (current.participants.some((p) => p.userId === btn.user.id)) {
            await btn.reply({
              content:   "You are already in this battle!",
              ephemeral: true,
            });
            return;
          }

          const joiner = UserRepository.findOrCreate(
            btn.user.id,
            btn.user.username
          );

          if (joiner.balance < totalCost) {
            await btn.reply({
              content:
                `You need **${formatCurrency(totalCost)}** to join.\n` +
                `Your balance: **${formatCurrency(joiner.balance)}**`,
              ephemeral: true,
            });
            return;
          }

          UserRepository.updateBalance(
            btn.user.id,
            joiner.balance - totalCost,
            undefined,
            joiner.totalSpent + totalCost
          );

          current.participants.push({
            userId:      btn.user.id,
            username:    btn.user.username,
            avatarUrl:   btn.user.displayAvatarURL({ size: 64 }),
            isBot:       false,
            allItems:    [],
            totalValue:  0,
            roundValues: [],
          });

          if (current.participants.length >= current.size) {
            collector.stop("full");

            await btn.update({
              embeds:     [buildWaitingEmbed(current, resolvedCases)],
              components: [],
            });

            await runBattle(current, resolvedCases, interaction, waitMsg);
            return;
          }

          await btn.update({
            embeds: [buildWaitingEmbed(current, resolvedCases)],
            components: [buildWaitingButtons(hostId, totalCost, current)],
          });
          return;
        }
      });

      collector.on("end", async (_, reason) => {
        if (["cancelled", "full", "bots_filled"].includes(reason)) return;

        const current = activeBattles.get(hostId);
        if (!current || current.status !== "waiting") return;

        const timeoutRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`tbots_${hostId}`)
            .setLabel("🤖 Play with Bots")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`tcancel_${hostId}`)
            .setLabel("❌ Cancel & Refund")
            .setStyle(ButtonStyle.Danger)
        );

        const timeoutMsg = await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xfee75c)
              .setTitle("⏰ Battle Timed Out")
              .setDescription(
                `Only **${current.participants.length}/${current.size}** players joined.\n\n` +
                `**Play with Bots** — fill remaining slots and battle now.\n` +
                `**Cancel & Refund** — get your entry fee back.\n\n` +
                `⚠️ Auto-cancels in **30 seconds**.`
              ),
          ],
          components: [timeoutRow],
        });

        try {
          const choice = await timeoutMsg.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter:        (i) => i.user.id === hostId,
            time:          30_000,
          });

          if (choice.customId === `tcancel_${hostId}`) {
            refundParticipants(current.participants, totalCost);
            activeBattles.delete(hostId);

            await choice.update({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x99aab5)
                  .setTitle("❌ Battle Cancelled")
                  .setDescription("All entry fees have been **refunded**."),
              ],
              components: [],
            });
          } else {
            fillWithBots(current);

            await choice.update({
              embeds:     [buildWaitingEmbed(current, resolvedCases)],
              components: [],
            });

            await runBattle(current, resolvedCases, interaction, timeoutMsg);
          }
        } catch {
          const stale = activeBattles.get(hostId);
          if (stale) {
            refundParticipants(stale.participants, totalCost);
            activeBattles.delete(hostId);
          }

          await interaction
            .editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(0x99aab5)
                  .setTitle("❌ Battle Expired")
                  .setDescription("Battle expired. All entry fees **refunded**."),
              ],
              components: [],
            })
            .catch(() => null);
        }
      });

      log.command(hostId, "casebattle", interaction.guildId ?? undefined);
    } catch (error) {
      log.error("Error in /casebattle", error as Error);
      await interaction.editReply({
        embeds:     [buildErrorEmbed("An unexpected error occurred.")],
        components: [],
      });
    }
  },
};

export default casebattle;
