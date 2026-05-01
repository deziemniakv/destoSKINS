import { getDatabase } from "./Database";
import { InventoryItem } from "../types";


interface UserRow {
  discord_id: string;
  username: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  cases_opened: number;
  items_sold: number;
  last_daily: string | null;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

interface InventoryRow {
  unique_id: string;
  discord_id: string;
  item_id: string;
  name: string;
  weapon: string;
  skin_type: string;
  rarity: string;
  wear: string;
  value: number;
  image_url: string;
  obtained_at: string;
  case_id: string;
}


export interface UserDTO {
  discordId: string;
  username: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  casesOpened: number;
  itemsSold: number;
  lastDaily: Date | null;
  xp: number;
  level: number;
  inventory: InventoryItem[];
  createdAt: Date;
  updatedAt: Date;
}


function mapRowToUser(row: UserRow, inventory: InventoryItem[]): UserDTO {
  return {
    discordId: row.discord_id,
    username: row.username,
    balance: row.balance,
    totalEarned: row.total_earned,
    totalSpent: row.total_spent,
    casesOpened: row.cases_opened,
    itemsSold: row.items_sold,
    lastDaily: row.last_daily ? new Date(row.last_daily) : null,
    xp: row.xp,
    level: row.level,
    inventory,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapInventoryRow(row: InventoryRow): InventoryItem {
  return {
    uniqueId: row.unique_id,
    itemId: row.item_id,
    name: row.name,
    weapon: row.weapon,
    skinType: row.skin_type as InventoryItem["skinType"],
    rarity: row.rarity as InventoryItem["rarity"],
    wear: row.wear as InventoryItem["wear"],
    value: row.value,
    imageUrl: row.image_url,
    obtainedAt: new Date(row.obtained_at),
    caseId: row.case_id,
  };
}


export const UserRepository = {

  findOrCreate(discordId: string, username: string): UserDTO {
    const db = getDatabase();

    db.prepare(`
      INSERT INTO users (discord_id, username)
      VALUES (@discordId, @username)
      ON CONFLICT(discord_id) DO UPDATE SET
        username   = excluded.username,
        updated_at = datetime('now')
    `).run({ discordId, username });

    return UserRepository.findById(discordId)!;
  },


  findById(discordId: string): UserDTO | null {
    const db = getDatabase();

    const userRow = db.prepare(`
      SELECT * FROM users WHERE discord_id = ?
    `).get(discordId) as UserRow | undefined;

    if (!userRow) return null;

    const inventoryRows = db.prepare(`
      SELECT * FROM inventory
      WHERE discord_id = ?
      ORDER BY obtained_at DESC
    `).all(discordId) as InventoryRow[];

    return mapRowToUser(userRow, inventoryRows.map(mapInventoryRow));
  },


  updateBalance(
    discordId: string,
    balance: number,
    totalEarned?: number,
    totalSpent?: number
  ): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        balance      = @balance,
        total_earned = COALESCE(@totalEarned, total_earned),
        total_spent  = COALESCE(@totalSpent,  total_spent),
        updated_at   = datetime('now')
      WHERE discord_id = @discordId
    `).run({ balance, totalEarned: totalEarned ?? null, totalSpent: totalSpent ?? null, discordId });
  },


  setLastDaily(discordId: string): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        last_daily = datetime('now'),
        updated_at = datetime('now')
      WHERE discord_id = ?
    `).run(discordId);
  },


  incrementCasesOpened(discordId: string): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        cases_opened = cases_opened + 1,
        updated_at   = datetime('now')
      WHERE discord_id = ?
    `).run(discordId);
  },


  incrementItemsSold(discordId: string, count = 1): void {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET
        items_sold = items_sold + @count,
        updated_at = datetime('now')
      WHERE discord_id = @discordId
    `).run({ count, discordId });
  },


  addXP(discordId: string, amount: number): { leveledUp: boolean; newLevel: number } {
    const db = getDatabase();

    const row = db.prepare(`
      SELECT xp, level FROM users WHERE discord_id = ?
    `).get(discordId) as Pick<UserRow, "xp" | "level"> | undefined;

    if (!row) return { leveledUp: false, newLevel: 1 };

    const newXP = row.xp + amount;
    const xpForNextLevel = Math.floor(row.level * 100 * (1 + row.level * 0.5));

    let newLevel = row.level;
    let leveledUp = false;

    if (newXP >= xpForNextLevel) {
      newLevel = row.level + 1;
      leveledUp = true;
    }

    db.prepare(`
      UPDATE users SET
        xp         = @newXP,
        level      = @newLevel,
        updated_at = datetime('now')
      WHERE discord_id = @discordId
    `).run({ newXP, newLevel, discordId });

    return { leveledUp, newLevel };
  },


  addInventoryItem(discordId: string, item: InventoryItem): void {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO inventory (
        unique_id, discord_id, item_id, name, weapon,
        skin_type, rarity, wear, value, image_url,
        obtained_at, case_id
      ) VALUES (
        @uniqueId, @discordId, @itemId, @name, @weapon,
        @skinType, @rarity, @wear, @value, @imageUrl,
        @obtainedAt, @caseId
      )
    `).run({
      uniqueId:   item.uniqueId,
      discordId,
      itemId:     item.itemId,
      name:       item.name,
      weapon:     item.weapon,
      skinType:   item.skinType,
      rarity:     item.rarity,
      wear:       item.wear,
      value:      item.value,
      imageUrl:   item.imageUrl,
      obtainedAt: item.obtainedAt.toISOString(),
      caseId:     item.caseId,
    });
  },


  removeInventoryItem(discordId: string, uniqueId: string): InventoryItem | null {
    const db = getDatabase();

    const row = db.prepare(`
      SELECT * FROM inventory
      WHERE discord_id = ? AND unique_id = ?
    `).get(discordId, uniqueId) as InventoryRow | undefined;

    if (!row) return null;

    db.prepare(`
      DELETE FROM inventory WHERE unique_id = ?
    `).run(uniqueId);

    return mapInventoryRow(row);
  },

  removeItemsBelowRarity(
    discordId: string,
    rarityOrder: string[],
    belowIndex: number
  ): { items: InventoryItem[]; totalValue: number } {
    const db = getDatabase();

    const allowedRarities = rarityOrder.slice(0, belowIndex);

    if (allowedRarities.length === 0) {
      return { items: [], totalValue: 0 };
    }

    const placeholders = allowedRarities.map(() => "?").join(", ");

    const rows = db.prepare(`
      SELECT * FROM inventory
      WHERE discord_id = ?
        AND rarity IN (${placeholders})
    `).all(discordId, ...allowedRarities) as InventoryRow[];

    if (rows.length === 0) return { items: [], totalValue: 0 };

    const items = rows.map(mapInventoryRow);
    const totalValue = items.reduce((sum, i) => sum + i.value, 0);

    const uniqueIds = items.map((i) => i.uniqueId);
    const delPlaceholders = uniqueIds.map(() => "?").join(", ");

    db.prepare(`
      DELETE FROM inventory WHERE unique_id IN (${delPlaceholders})
    `).run(...uniqueIds);

    return { items, totalValue };
  },


  getLeaderboard(
    type: "balance" | "level",
    limit = 10
  ): Array<{ username: string; balance: number; level: number }> {
    const db = getDatabase();
    const col = type === "balance" ? "balance" : "level";

    return db.prepare(`
      SELECT username, balance, level
      FROM users
      ORDER BY ${col} DESC
      LIMIT ?
    `).all(limit) as Array<{ username: string; balance: number; level: number }>;
  },


  getInventoryValue(discordId: string): number {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT COALESCE(SUM(value), 0) as total
      FROM inventory
      WHERE discord_id = ?
    `).get(discordId) as { total: number };
    return result.total;
  },
};
