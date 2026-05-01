import { Rarity, WearLevel } from "../types";

export const RARITY_COLORS: Record<Rarity, number> = {
  "Consumer Grade": 0xb0c3d9,   // Light gray-blue
  "Industrial Grade": 0x5e98d9, // Blue
  "Mil-Spec": 0x4b69ff,         // Medium blue
  "Restricted": 0x8847ff,       // Purple
  "Classified": 0xd32ce6,       // Pink/Magenta
  "Covert": 0xeb4b4b,           // Red
  "Contraband": 0xe4ae39,       // Gold/Orange
};


export const RARITY_EMOJIS: Record<Rarity, string> = {
  "Consumer Grade": "⬜",
  "Industrial Grade": "🟦",
  "Mil-Spec": "🔵",
  "Restricted": "🟣",
  "Classified": "🩷",
  "Covert": "🔴",
  "Contraband": "🌟",
};


export const RARITY_ORDER: Rarity[] = [
  "Consumer Grade",
  "Industrial Grade",
  "Mil-Spec",
  "Restricted",
  "Classified",
  "Covert",
  "Contraband",
];

export const WEAR_MULTIPLIERS: Record<WearLevel, number> = {
  "Factory New": 1.0,
  "Minimal Wear": 0.85,
  "Field-Tested": 0.70,
  "Well-Worn": 0.55,
  "Battle-Scarred": 0.45,
};

export const WEAR_CHANCES: { wear: WearLevel; chance: number }[] = [
  { wear: "Factory New", chance: 3 },
  { wear: "Minimal Wear", chance: 24 },
  { wear: "Field-Tested", chance: 33 },
  { wear: "Well-Worn", chance: 24 },
  { wear: "Battle-Scarred", chance: 16 },
];


export function getRarityColor(rarity: Rarity): number {
  return RARITY_COLORS[rarity] ?? 0x99aab5;
}

export function getRarityEmoji(rarity: Rarity): string {
  return RARITY_EMOJIS[rarity] ?? "❓";
}

export function rollWear(): WearLevel {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const { wear, chance } of WEAR_CHANCES) {
    cumulative += chance;
    if (roll <= cumulative) return wear;
  }

  return "Field-Tested";
}

export function calculateItemValue(baseValue: number, wear: WearLevel): number {
  const multiplier = WEAR_MULTIPLIERS[wear];
  const value = Math.floor(baseValue * multiplier);
  return Math.max(1, value);
}

export function formatCurrency(amount: number): string {
  return `🪙 ${amount.toLocaleString()} coins`;
}

export function getRarityGlow(rarity: Rarity): string {
  const glowMap: Record<Rarity, string> = {
    "Consumer Grade": "▫️▫️▫️",
    "Industrial Grade": "🔹🔹🔹",
    "Mil-Spec": "💠💠💠",
    "Restricted": "🔮🔮🔮",
    "Classified": "💜💜💜",
    "Covert": "❤️‍🔥❤️‍🔥❤️‍🔥",
    "Contraband": "⭐⭐⭐",
  };
  return glowMap[rarity] ?? "▫️▫️▫️";
}
