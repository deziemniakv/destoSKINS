import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { log } from "../utils/logger";
import { InventoryItem } from "../types";


let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}


export function initDatabase(): void {
  const dbPath = process.env.DATABASE_PATH ?? "./data/cs2bot.db";
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  createTables();
  log.info(`✅ SQLite database initialized at ${dbPath}`);
}


function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      discord_id     TEXT PRIMARY KEY,
      username       TEXT NOT NULL,
      balance        INTEGER NOT NULL DEFAULT 1000,
      total_earned   INTEGER NOT NULL DEFAULT 1000,
      total_spent    INTEGER NOT NULL DEFAULT 0,
      cases_opened   INTEGER NOT NULL DEFAULT 0,
      items_sold     INTEGER NOT NULL DEFAULT 0,
      last_daily     TEXT DEFAULT NULL,
      xp             INTEGER NOT NULL DEFAULT 0,
      level          INTEGER NOT NULL DEFAULT 1,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory (
      unique_id      TEXT PRIMARY KEY,
      discord_id     TEXT NOT NULL,
      item_id        TEXT NOT NULL,
      name           TEXT NOT NULL,
      weapon         TEXT NOT NULL,
      skin_type      TEXT NOT NULL,
      rarity         TEXT NOT NULL,
      wear           TEXT NOT NULL,
      value          INTEGER NOT NULL,
      image_url      TEXT NOT NULL,
      obtained_at    TEXT NOT NULL DEFAULT (datetime('now')),
      case_id        TEXT NOT NULL,
      FOREIGN KEY (discord_id) REFERENCES users(discord_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_inventory_discord_id
      ON inventory(discord_id);

    CREATE INDEX IF NOT EXISTS idx_users_balance
      ON users(balance DESC);

    CREATE INDEX IF NOT EXISTS idx_users_level
      ON users(level DESC);
  `);
}


export function closeDatabase(): void {
  if (db) {
    db.close();
    log.info("SQLite database closed");
  }
}
