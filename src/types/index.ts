import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  Collection,
} from "discord.js";


export type Rarity =
  | "Consumer Grade"
  | "Industrial Grade"
  | "Mil-Spec"
  | "Restricted"
  | "Classified"
  | "Covert"
  | "Contraband";

export type SkinType =
  | "Rifle"
  | "Pistol"
  | "SMG"
  | "Shotgun"
  | "Sniper"
  | "Knife"
  | "Gloves"
  | "Heavy";

export type WearLevel =
  | "Factory New"
  | "Minimal Wear"
  | "Field-Tested"
  | "Well-Worn"
  | "Battle-Scarred";


export interface CaseItem {
  id: string;
  name: string;
  weapon: string;
  skinType: SkinType;
  rarity: Rarity;
  baseValue: number;
  imageUrl: string;
  description?: string;
}

export interface DroppedItem extends CaseItem {
  wear: WearLevel;
  value: number;
  droppedAt: Date;
}


export interface RarityPool {
  rarity: Rarity;
  chance: number;
  items: CaseItem[];
}

export interface Case {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rarityPools: RarityPool[];
  color: number;
}


export interface InventoryItem {
  itemId: string;
  name: string;
  weapon: string;
  skinType: SkinType;
  rarity: Rarity;
  wear: WearLevel;
  value: number;
  imageUrl: string;
  obtainedAt: Date;
  caseId: string;
  uniqueId: string;
}


export interface IUser {
  discordId: string;
  username: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  casesOpened: number;
  itemsSold: number;
  inventory: InventoryItem[];
  lastDaily: Date | null;
  xp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}


export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  cooldown?: number; // seconds
  execute: (
    interaction: ChatInputCommandInteraction,
    client: BotClient
  ) => Promise<void>;
}


export interface BotClient extends Client {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
}


export type LogLevel = "error" | "warn" | "info" | "debug";
