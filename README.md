# destoSKINS - Full Guide

<div align="center">

<img src="https://i.imgur.com/e0d9G1L.png" alt="CS2 Case Bot Banner" width="800"/>

# 🎰 destoSKINS

**A fully-featured CS2-style case opening Discord bot built with TypeScript.**
Virtual currency • Case battles • Inventory system • Leaderboards

[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) •
[Commands](#-commands) •
[Installation](#-installation) •
[Configuration](#-configuration) •
[Cases](#-cases) •
[Battle Modes](#-case-battle-modes) •
[Project Structure](#-project-structure) •
[Contributing](#-contributing)

</div>

---

## ⚠️ Disclaimer

> This bot is a **purely virtual simulation** inspired by CS2 case mechanics.
> It does **not** involve real money, real gambling, or any real-world transactions.
> All currency and items exist only within the bot's virtual economy.
> This project is intended for entertainment purposes only.

---

## ✨ Features

### 🎰 Case Opening System
- Open CS2-style cases with **weighted probability drops**
- Animated opening sequence with confirmation flow
- **Quick-sell** button directly after opening
- Items have realistic **wear levels** (Factory New → Battle-Scarred)
- Rarity-coded embeds with item images

### ⚔️ Case Battle System
- Challenge other players to **multi-round case battles**
- Up to **5 rounds** per battle (one case per round)
- Supports **1v1**, **1v1v1**, and **1v1v1v1** formats
- **4 unique battle modes** (see below)
- Winner receives **every skin** dropped by all participants
- Bot fill system if players don't join in time
- Full **refund system** on cancellation or timeout

### 💰 Virtual Economy
- Start with **1,000 coins** for free
- Earn coins via daily rewards (scales with level)
- Sell items individually or in bulk
- Full balance tracking (earned / spent)

### 🎒 Inventory System
- Paginated inventory viewer
- Inspect any item with full details and image
- Sell individual items by unique ID
- Sell all items below a chosen rarity threshold

### 📊 Progression System
- XP and level system
- XP earned from opening cases, winning battles, selling
- Daily reward scales with your current level
- Visual XP progress bar in profile

### 🏆 Leaderboard
- Richest players ranking
- Highest level ranking
- Live toggle between leaderboard types

### 🛡️ Safety & UX
- Per-command cooldowns
- Anti-spam monitoring
- Confirmation prompts before spending
- Graceful shutdown handling
- Winston logging (console + file)

---

## 🎮 Commands

| Command | Description |
|---|---|
| `/balance` | Check your current virtual coin balance |
| `/daily` | Claim your daily reward (24h cooldown, scales with level) |
| `/cases` | Browse all available cases with drop chances |
| `/opencase` | Open a case and receive a random skin |
| `/inventory` | View your full item inventory (paginated) |
| `/inspect` | Inspect a specific item by its unique ID |
| `/sell` | Sell one item from your inventory by ID |
| `/sellall` | Sell all items below a chosen rarity threshold |
| `/profile` | View your stats, level, XP, and inventory value |
| `/leaderboard` | View top players by balance or level |
| `/casebattle` | Start a multi-round case battle against other players |

---

## 📦 Cases

### Test Your Luck Case — 💰 1 coin
> The ultimate gamble. One coin, two possible outcomes.

| Rarity | Chance | Item |
|---|---|---|
| Consumer Grade | **99.984%** | P250 \| Worn Finish — 1 coin |
| Contraband | **0.016%** | One of **6 ultra-rare** knives & gloves |

**Contraband pool (0.016% total, equal split):**
| Item | Value |
|---|---|
| ★ Karambit \| Doppler | 80,000 coins |
| ★ Butterfly Knife \| Fade | 95,000 coins |
| ★ M9 Bayonet \| Crimson Web | 72,000 coins |
| ★ Specialist Gloves \| Pandora's Box | 68,000 coins |
| ★ Sport Gloves \| Superconductor | 62,000 coins |
| ★ Bayonet \| Sapphire | 110,000 coins |

---

### Phantom Arsenal Case — 🪙 250 coins
> Elite military-grade weapon finishes from the shadows.

| Rarity | Chance | Items |
|---|---|---|
| Consumer Grade | 40% | AK-47 \| Sandstorm, M4A4 \| Basalt, Glock-18 \| Ironwood |
| Industrial Grade | 25% | AWP \| Arctic Fox, MP5-SD \| Crimson Tide |
| Mil-Spec | 20% | AK-47 \| Phantom Force, Desert Eagle \| Obsidian Wraith |
| Restricted | 10% | M4A1-S \| Neon Specter, USP-S \| Phantom Rush |
| Classified | 4% | AWP \| Dragon Shadow |
| Covert | 0.9% | AK-47 \| Hellfire |
| Contraband | 0.1% | ★ Phantom Dagger \| Crimson Web |

---

### Neon Pulse Case — 🪙 350 coins
> Cyberpunk-inspired skins glowing with electric energy.

| Rarity | Chance | Items |
|---|---|---|
| Consumer Grade | 40% | FAMAS \| Circuit Board, P250 \| Static Shock, Nova \| Gridlock |
| Industrial Grade | 25% | SG 553 \| Laser Grid, MAC-10 \| Electric Blue |
| Mil-Spec | 20% | M4A4 \| Cyber Punk, Glock-18 \| Ultraviolet |
| Restricted | 10% | AWP \| Neon Rider, AK-47 \| Pulse Wave |
| Classified | 4% | M4A1-S \| Hologram |
| Covert | 0.9% | AWP \| Neon Abyss |
| Contraband | 0.1% | ★ Sport Gloves \| Neon Surge |

---

### Ancient Relic Case — 🪙 500 coins
> Weapons adorned with ancient civilizations' artwork.

| Rarity | Chance | Items |
|---|---|---|
| Consumer Grade | 40% | AK-47 \| Clay Pot, P90 \| Hieroglyph |
| Industrial Grade | 25% | AWP \| Stone Carving, USP-S \| Bronze Age |
| Mil-Spec | 20% | M4A4 \| Golden Pharaoh, Desert Eagle \| Anubis |
| Restricted | 10% | AK-47 \| Maya Serpent, AWP \| Medusa |
| Classified | 4% | M4A1-S \| Poseidon |
| Covert | 0.9% | AK-47 \| Fire Serpent |
| Contraband | 0.1% | ★ Karambit \| Golden Idol |

---

## ⚔️ Case Battle Modes

Case battles support **1 to 5 rounds** (one case per round).
Every participant opens one case per round.
**The winner receives every skin dropped by all players across all rounds.**

### 🏆 Normal
> The player with the **highest total item value** across all rounds wins.

```
Round 1: Player A gets 450 coins   Player B gets 120 coins
Round 2: Player A gets 80 coins    Player B gets 1200 coins
Round 3: Player A gets 300 coins   Player B gets 50 coins
─────────────────────────────────────────────────────────
Total:   Player A = 830 coins      Player B = 1370 coins
Winner:  Player B 🏆
```

### 🐶 Underdog
> The player with the **lowest total item value** across all rounds wins.

```
Same scores as above →  Player A = 830 coins (lower total)
Winner: Player A 🐶
```

### 💀 Terminal
> **Only the last round counts.** Earlier rounds are opened for fun
> and their values are ignored. The final case decides everything.

```
Round 1: Player A gets 8500    Player B gets 45000   ← ignored
Round 2: Player A gets 200     Player B gets 150     ← ignored
Round 3: Player A gets 1800    Player B gets 380     ← THIS DECIDES
─────────────────────────────────────────────────────────────────
Winner:  Player A (1800 > 380 in final round) 💀
```

### 🌀 Crazy Terminal
> **Only the first round counts.** The winner is decided immediately
> after round 1. The battle continues to completion for show,
> but the outcome is already sealed.

```
Round 1: Player A gets 8500    Player B gets 380     ← DECIDES NOW
          Winner announced: Player A 👑
Round 2: Player A gets 200     Player B gets 1800    ← for fun only
Round 3: Player A gets 50      Player B gets 12000   ← for fun only
─────────────────────────────────────────────────────────────────
Winner:  Player A (won in round 1) 🌀
All skins from all rounds still go to Player A.
```

> **Note:** Terminal and Crazy Terminal modes require **at least 2 cases**.

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org) **v18 or higher** (v23 supported)
- A [Discord Developer Account](https://discord.com/developers/applications)
- Git

### Step 1 — Clone the repository

```bash
git clone https://github.com/deziemniakv/destoSKINS.git
cd destoSKINS
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id
GUILD_ID=your_server_id_for_testing
DATABASE_PATH=./data/cs2bot.db
NODE_ENV=development
LOG_LEVEL=info
```

### Step 4 — Build the project

```bash
npm run build
```

### Step 5 — Deploy slash commands

```bash
# Deploy to a specific guild (instant, for testing)
npm run deploy

# To deploy globally (takes up to 1 hour to propagate)
# Remove GUILD_ID from .env first, then:
npm run deploy
```

### Step 6 — Start the bot

```bash
# Production
npm start

# Development (ts-node, no build needed)
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DISCORD_TOKEN` | ✅ Yes | — | Your Discord bot token |
| `CLIENT_ID` | ✅ Yes | — | Your Discord application client ID |
| `GUILD_ID` | ⚡ Dev only | — | Guild ID for instant command deploy |
| `DATABASE_PATH` | ❌ No | `./data/cs2bot.db` | Path to SQLite database file |
| `NODE_ENV` | ❌ No | `development` | `development` or `production` |
| `LOG_LEVEL` | ❌ No | `info` | `error` \| `warn` \| `info` \| `debug` |

### Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Add Bot**
4. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy the **Token** → paste into `DISCORD_TOKEN` in `.env`
6. Go to **OAuth2** → **URL Generator**:
   - Scopes: `bot` + `applications.commands`
   - Permissions: `Send Messages`, `Embed Links`, `Read Message History`, `Use Slash Commands`
7. Open the generated URL to invite the bot to your server

### Finding IDs

Enable **Developer Mode** in Discord:
> Settings → Advanced → Developer Mode ✅

Then:
- **Client ID**: Developer Portal → Your Application → General Information → Application ID
- **Guild ID**: Right-click your server icon → Copy Server ID

---

## 📁 Project Structure

```
cs2-case-bot/
├── src/
│   ├── commands/
│   │   ├── balance.ts          # Check balance
│   │   ├── cases.ts            # Browse cases
│   │   ├── casebattle.ts       # Multi-round case battles
│   │   ├── daily.ts            # Daily reward
│   │   ├── inspect.ts          # Inspect inventory item
│   │   ├── inventory.ts        # View inventory
│   │   ├── leaderboard.ts      # Top players
│   │   ├── opencase.ts         # Open a case
│   │   ├── profile.ts          # Player profile
│   │   ├── sell.ts             # Sell one item
│   │   └── sellall.ts          # Sell items in bulk
│   ├── events/
│   │   ├── interactionCreate.ts  # Handle slash commands
│   │   ├── messageCreate.ts      # Anti-spam monitoring
│   │   └── ready.ts              # Bot startup
│   ├── models/
│   │   ├── Database.ts           # SQLite init & connection
│   │   └── User.ts               # User repository (all DB ops)
│   ├── utils/
│   │   ├── cases.ts              # Case data & roll logic
│   │   ├── cooldown.ts           # Cooldown management
│   │   ├── embed.ts              # Shared embed builders
│   │   ├── logger.ts             # Winston logger
│   │   └── rarity.ts             # Rarity colors, wear, values
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces
│   ├── deploy.ts                 # Slash command deployer
│   └── index.ts                  # Bot entry point
├── data/
│   └── cs2bot.db                 # SQLite database (auto-created)
├── logs/
│   ├── combined.log              # All logs
│   ├── error.log                 # Error logs only
│   └── exceptions.log            # Uncaught exceptions
├── dist/                         # Compiled JavaScript (git-ignored)
├── .env                          # Your secrets (git-ignored)
├── .env.example                  # Template for .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database

The bot uses **better-sqlite3** — a fast, synchronous SQLite library.
The database file is created automatically on first start.

### Schema

**`users` table**
| Column | Type | Description |
|---|---|---|
| `discord_id` | TEXT PK | Discord user ID |
| `username` | TEXT | Discord username |
| `balance` | INTEGER | Current coin balance |
| `total_earned` | INTEGER | Lifetime coins earned |
| `total_spent` | INTEGER | Lifetime coins spent |
| `cases_opened` | INTEGER | Total cases opened |
| `items_sold` | INTEGER | Total items sold |
| `last_daily` | TEXT | Last daily claim timestamp |
| `xp` | INTEGER | Current XP |
| `level` | INTEGER | Current level |
| `created_at` | TEXT | Account creation date |
| `updated_at` | TEXT | Last update date |

**`inventory` table**
| Column | Type | Description |
|---|---|---|
| `unique_id` | TEXT PK | Unique item instance ID |
| `discord_id` | TEXT FK | Owner's Discord ID |
| `item_id` | TEXT | Base item definition ID |
| `name` | TEXT | Full item name |
| `weapon` | TEXT | Weapon type |
| `skin_type` | TEXT | Rifle / Pistol / Knife / Gloves etc. |
| `rarity` | TEXT | Item rarity tier |
| `wear` | TEXT | Wear level |
| `value` | INTEGER | Current sell value |
| `image_url` | TEXT | Item image URL |
| `obtained_at` | TEXT | When the item was obtained |
| `case_id` | TEXT | Which case it came from |

---

## 🎨 Rarity System

| Rarity | Color | Typical Drop Chance |
|---|---|---|
| Consumer Grade | ⬜ `#B0C3D9` | ~40% |
| Industrial Grade | 🟦 `#5E98D9` | ~25% |
| Mil-Spec | 🔵 `#4B69FF` | ~20% |
| Restricted | 🟣 `#8847FF` | ~10% |
| Classified | (pink color) `#D32CE6` | ~4% |
| Covert | 🔴 `#EB4B4B` | ~0.9% |
| Contraband | 🌟 `#E4AE39` | ~0.1% |

### Wear Levels

| Wear | Multiplier | Chance |
|---|---|---|
| Factory New | 1.00× | 3% |
| Minimal Wear | 0.85× | 24% |
| Field-Tested | 0.70× | 33% |
| Well-Worn | 0.55× | 24% |
| Battle-Scarred | 0.45× | 16% |

---

## 🖥️ Hosting on Pterodactyl

If you're hosting on a Pterodactyl panel:

1. Set **Main File** to `dist/index.js` in the Startup tab
2. Move `typescript` to `dependencies` (not devDependencies) in `package.json`
3. Add `"prestart": "tsc"` to scripts so it compiles on every start
4. Upload all `src/` files and `package.json` / `tsconfig.json`
5. The panel will run `npm install` then `npm start` automatically

```json
"scripts": {
  "build":    "tsc",
  "prestart": "tsc",
  "start":    "node dist/index.js",
  "dev":      "ts-node src/index.ts",
  "deploy":   "ts-node src/deploy.ts"
},
"dependencies": {
  "typescript": "^5.4.2"
}
```

---

## 🔧 Adding New Cases

Open `src/utils/cases.ts` and add a new entry to the `CASES` array:

```typescript
{
  id: "my_case",                          // unique snake_case ID
  name: "My Custom Case",
  description: "Description here",
  price: 300,                             // cost in virtual coins
  imageUrl: "https://example.com/img.png",
  color: 0xffd700,                        // embed hex color
  rarityPools: [
    {
      rarity: "Consumer Grade",
      chance: 79.9,                       // must all add up to 100
      items: [
        {
          id: "my_item_id",               // unique item ID
          name: "AK-47 | My Skin",
          weapon: "AK-47",
          skinType: "Rifle",
          rarity: "Consumer Grade",
          baseValue: 50,
          imageUrl: "https://example.com/skin.png",
          description: "My custom skin description",
        },
      ],
    },
    {
      rarity: "Contraband",
      chance: 0.1,
      items: [ /* ... */ ],
    },
    // All chances must sum to exactly 100
  ],
}
```

Then rebuild and redeploy:

```bash
npm run build
npm run deploy
npm start
```

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| Build | `npm run build` | Compile TypeScript → `dist/` |
| Start | `npm start` | Compile + run the bot |
| Dev | `npm run dev` | Run directly with ts-node |
| Deploy | `npm run deploy` | Register slash commands |

---

## 📦 Dependencies

### Runtime
| Package | Version | Purpose |
|---|---|---|
| `discord.js` | ^14.14.1 | Discord bot framework |
| `better-sqlite3` | ^9.4.3 | SQLite database |
| `dotenv` | ^16.4.5 | Environment variables |
| `winston` | ^3.12.0 | Logging |
| `typescript` | ^5.4.2 | TypeScript compiler |

### Development
| Package | Version | Purpose |
|---|---|---|
| `ts-node` | ^10.9.2 | Run TS without compiling |
| `@types/node` | ^20.11.25 | Node.js type definitions |
| `@types/better-sqlite3` | ^7.6.8 | SQLite type definitions |
| `@typescript-eslint/*` | ^7.2.0 | TypeScript linting |
| `eslint` | ^8.57.0 | Code linting |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation update
refactor: Code refactor (no feature change)
chore:    Build / config changes
```

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Inspired by the CS2 (Counter-Strike 2) case opening system
- Built with [Discord.js v14](https://discord.js.org)
- Database powered by [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- Logging by [Winston](https://github.com/winstonjs/winston)

---

<div align="center">

Made with ❤️ for the Discord community

**⭐ Star this repo if you found it useful!**

</div>
