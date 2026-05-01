import { Case, CaseItem, RarityPool, InventoryItem } from "../types";
import { rollWear, calculateItemValue } from "./rarity";
import crypto from "crypto";


function uuid(): string {
  return crypto.randomUUID();
}


export const CASES: Case[] = [
  // ═══════════════════════════════════════════════════
  //   CASE 1 — Phantom Arsenal Case
  // ═══════════════════════════════════════════════════
  {
    id: "phantom_arsenal",
    name: "Phantom Arsenal Case",
    description: "Contains elite military-grade weapon finishes from the shadows.",
    price: 250,
    imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492202031580971048/new_desert-eagle.png?ex=69da78f0&is=69d92770&hm=743fe5543de3d723172a2776942348ccd8b2930cfa9b82ce79998895d00d1ac8&=&format=webp&quality=lossless",
    color: 0x4b69ff,
    rarityPools: [
      {
        rarity: "Consumer Grade",
        chance: 40,
        items: [
          {
            id: "ak47_sandstorm",
            name: "AK-47 | VariCamo Grey",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Consumer Grade",
            baseValue: 15,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491842655682957534/AK-47_VariCamo_Grey.png?ex=69d92a3e&is=69d7d8be&hm=0a04a386d928b621d0faa08f6332a50744c72da767921d5cad7ba1ad3cae067b&=&format=webp&quality=lossless",
            description: "A dusty finish that blends into the desert terrain.",
          },
          {
            id: "m4a4_basalt",
            name: "M4A4 | Mainframe",
            weapon: "M4A4",
            skinType: "Rifle",
            rarity: "Consumer Grade",
            baseValue: 12,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491842923808165991/M4A4_Mainframe.png?ex=69d92a7e&is=69d7d8fe&hm=09a40412ca20358f7d31751642cbe31e486977834d7b06e2e42574a2296eca83&=&format=webp&quality=lossless",
            description: "Dark volcanic rock pattern coating.",
          },
          {
            id: "glock_ironwood",
            name: "Glock-18 | Death Rattle",
            weapon: "Glock-18",
            skinType: "Pistol",
            rarity: "Consumer Grade",
            baseValue: 10,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491843334015156234/Glock-18_Death_Rattle.png?ex=69d92adf&is=69d7d95f&hm=bb8015e6bc4cc899752a120381dd242e9e62abcd20f0a33c8adfd4f22cc76661&=&format=webp&quality=lossless",
            description: "Classic wood-grain finish on a modern pistol.",
          },
        ],
      },
      {
        rarity: "Industrial Grade",
        chance: 25,
        items: [
          {
            id: "awp_arctic_fox",
            name: "AWP | Sun in Leo",
            weapon: "AWP",
            skinType: "Sniper",
            rarity: "Industrial Grade",
            baseValue: 55,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491843612118355968/AWP_Sun_in_Leo.png?ex=69d92b22&is=69d7d9a2&hm=4ad5afcb2a395055fedb08f40dc1d0832f193b7a8ff12de62fd2c01fee95eee9&=&format=webp&quality=lossless",
            description: "Blue arctic camouflage for cold environments.",
          },
          {
            id: "mp5_crimson_tide",
            name: "MP5-SD | Neon Squeezer",
            weapon: "MP5-SD",
            skinType: "SMG",
            rarity: "Industrial Grade",
            baseValue: 45,
            imageUrl: "https://cdn.discordapp.com/attachments/1233480912814080211/1491843867476103412/MP5-SD_Neon_Squeezer.png?ex=69d92b5f&is=69d7d9df&hm=26e2f83ae17170ada9650eb26d6df1a259a13789f333412eafa7d6affda35023&",
            description: "Deep snake oceanic finish.",
          },
        ],
      },
      {
        rarity: "Mil-Spec",
        chance: 20,
        items: [
          {
            id: "ak47_phantom_force",
            name: "AK-47 | Elite Build",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Mil-Spec",
            baseValue: 150,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491844190206689280/AK-47_Elite_Build.png?ex=69d92bac&is=69d7da2c&hm=96ecaccc75c4bbb346a6f0e0e6a8c9a8fd008e917153f39da6c01af3195b495d&=&format=webp&quality=lossless",
            description: "Ghost-like translucent blue finish with tactical markings.",
          },
          {
            id: "deagle_obsidian",
            name: "Desert Eagle | Oxide Blaze",
            weapon: "Desert Eagle",
            skinType: "Pistol",
            rarity: "Mil-Spec",
            baseValue: 135,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491844484772663296/Desert_Eagle_Oxide_Blaze.png?ex=69d92bf2&is=69d7da72&hm=154d27f98b4b991759a35978f9e8d7e658e18ca1e6f54f52237923b7e14d33fb&=&format=webp&quality=lossless",
            description: "Black mirror finish with ghostly etchings.",
          },
        ],
      },
      {
        rarity: "Restricted",
        chance: 10,
        items: [
          {
            id: "m4a1s_neon_specter",
            name: "M4A1-S | Emphorosaur-S",
            weapon: "M4A1-S",
            skinType: "Rifle",
            rarity: "Restricted",
            baseValue: 450,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491844652142297219/M4A1-S_Emphorosaur-S.png?ex=69d92c1a&is=69d7da9a&hm=eaf3fdb727130eca584aee2834f3719b5fcf2cf0b9c3296162cdd8185b94f931&=&format=webp&quality=lossless",
            description: "Vivid neon ghost design glowing against dark metal.",
          },
          {
            id: "usp_phantom_rush",
            name: "USP-S | Road Rash",
            weapon: "USP-S",
            skinType: "Pistol",
            rarity: "Restricted",
            baseValue: 380,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491845632346947594/USP-S_Road_Rash.png?ex=69d92d03&is=69d7db83&hm=42f05fa8006feaae81626a3c14a3a5333a1b85b3a5ed631c2ce1beddd6f7eb8d&=&format=webp&quality=lossless",
            description: "Speed lines and phantom imagery across the slide.",
          },
        ],
      },
      {
        rarity: "Classified",
        chance: 4,
        items: [
          {
            id: "awp_dragon_shadow",
            name: "AWP | Worm God",
            weapon: "AWP",
            skinType: "Sniper",
            rarity: "Classified",
            baseValue: 1800,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491845765541269524/AWP_Worm_God.png?ex=69d92d23&is=69d7dba3&hm=6df2092987e9dc5a4a7e0635677fa5bc4e686961dd4f6b36f57836bd62fde223&=&format=webp&quality=lossless",
            description: "A fierce dragon coiled around the barrel in crimson ink.",
          },
        ],
      },
      {
        rarity: "Covert",
        chance: 0.9,
        items: [
          {
            id: "ak47_hellfire",
            name: "AK-47 | Legion of Anubis",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Covert",
            baseValue: 8500,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491845969707536597/AK-47_Legion_of_Anubis.png?ex=69d92d54&is=69d7dbd4&hm=8a73d9982242fe1475b14a26824ab163df1a89fd3311d01d762c813e9460429f&=&format=webp&quality=lossless",
            description: "Engulfed in eternal flames — a weapon forged in the underworld.",
          },
        ],
      },
      {
        rarity: "Contraband",
        chance: 0.1,
        items: [
          {
            id: "knife_phantom_dagger",
            name: "★ Gut Knife | Crimson Web",
            weapon: "Phantom Dagger",
            skinType: "Knife",
            rarity: "Contraband",
            baseValue: 45000,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491846355587432519/Gut_Knife_Crimson_Web.png?ex=69d92db0&is=69d7dc30&hm=e0ca7c9667538d95bc31387c70fc8bb50e5ceb947e7bc647ec8289d7e4f06179&=&format=webp&quality=lossless",
            description: "An ultra-rare blade wrapped in blood-red webbing.",
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  //   CASE 2 — Neon Pulse Case
  // ═══════════════════════════════════════════════════
  {
    id: "neon_pulse",
    name: "Neon Pulse Case",
    description: "Cyberpunk-inspired skins glowing with electric energy.",
    price: 350,
    imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492202196148949153/cyrex.png?ex=69da7917&is=69d92797&hm=e17b621a120cdd9819e948ebbc9a1ac621cfe45a76a13fc7c84d4e1fcf15b566&=&format=webp&quality=lossless",
    color: 0xd32ce6,
    rarityPools: [
      {
        rarity: "Consumer Grade",
        chance: 40,
        items: [
          {
            id: "famas_circuit_board",
            name: "FAMAS | Contrast Spray",
            weapon: "FAMAS",
            skinType: "Rifle",
            rarity: "Consumer Grade",
            baseValue: 18,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491839160758309035/FAMAS_Contrast_Spray.png?ex=69d926fc&is=69d7d57c&hm=51a59ea62792083cd6b7b29e14e84de87ed23456e9d8db983eb52aef9973ee31&=&format=webp&quality=lossless",
            description: "PCB trace patterns across a dark chassis.",
          },
          {
            id: "p250_static_shock",
            name: "P250 | Boreal Forest",
            weapon: "P250",
            skinType: "Pistol",
            rarity: "Consumer Grade",
            baseValue: 14,
            imageUrl: "https://cdn.discordapp.com/attachments/1233480912814080211/1491839406972211240/P250_Boreal_Forest.png?ex=69d92737&is=69d7d5b7&hm=e83c129d033ecbb65f162f23868ed4d3a2f0b37d472409d415cd4fd5038b0323&",
            description: "Electric bolt patterns crackling across the body.",
          },
          {
            id: "nova_gridlock",
            name: "Nova | Sand Dune",
            weapon: "Nova",
            skinType: "Shotgun",
            rarity: "Consumer Grade",
            baseValue: 11,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491839853757726861/Nova_Sand_Dune.png?ex=69d927a2&is=69d7d622&hm=7d8bced2ba29f999e1c672b92744b01dcd8a5191855a10ff793df7e8cf98cfe1&=&format=webp&quality=lossless",
            description: "Digital grid overlay on matte black surface.",
          },
        ],
      },
      {
        rarity: "Industrial Grade",
        chance: 25,
        items: [
          {
            id: "sg553_laser_grid",
            name: "SG 553 | Fallout Warning",
            weapon: "SG 553",
            skinType: "Rifle",
            rarity: "Industrial Grade",
            baseValue: 60,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491840080556589248/SG_553_Fallout_Warning.png?ex=69d927d8&is=69d7d658&hm=2634d081912f4e69e7c3b2773c88868d4d7f078092810b609df9df6311f0880c&=&format=webp&quality=lossless",
            description: "Laser grid projection mapped to the weapon surface.",
          },
          {
            id: "mac10_electric_blue",
            name: "MAC-10 | Silver",
            weapon: "MAC-10",
            skinType: "SMG",
            rarity: "Industrial Grade",
            baseValue: 48,
            imageUrl: "https://cdn.discordapp.com/attachments/1233480912814080211/1491840317635166258/MAC-10_Silver.png?ex=69d92810&is=69d7d690&hm=8d633f6894d6114b9e9ea64eb4b261cd25b1b9e32d5998c5ad500dccb8a97480&",
            description: "Bright electric blue with animated-style linework.",
          },
        ],
      },
      {
        rarity: "Mil-Spec",
        chance: 20,
        items: [
          {
            id: "m4a4_cyber_punk",
            name: "M4A4 | Faded Zebra",
            weapon: "M4A4",
            skinType: "Rifle",
            rarity: "Mil-Spec",
            baseValue: 180,
            imageUrl: "https://cdn.discordapp.com/attachments/1233480912814080211/1491840560929964112/M4A4_Faded_Zebra.png?ex=69d9284a&is=69d7d6ca&hm=fa5d35120fc737163254bad19292deb058dc9655e7c6b99b53cce30fa9f957ae&",
            description: "Neon city skyline etched along the barrel.",
          },
          {
            id: "glock_ultraviolet",
            name: "Glock-18 | Wraiths",
            weapon: "Glock-18",
            skinType: "Pistol",
            rarity: "Mil-Spec",
            baseValue: 155,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491840956201304304/Glock-18_Wraiths.png?ex=69d928a9&is=69d7d729&hm=43eb65893f8eda4692cc5d5683e0eb8910d888e63571c8cfbb404495be3af2f8&=&format=webp&quality=lossless",
            description: "UV reactive paint that glows under black light.",
          },
        ],
      },
      {
        rarity: "Restricted",
        chance: 10,
        items: [
          {
            id: "awp_neon_rider",
            name: "AWP | POP AWP",
            weapon: "AWP",
            skinType: "Sniper",
            rarity: "Restricted",
            baseValue: 520,
            imageUrl: "https://cdn.discordapp.com/attachments/1233480912814080211/1491841230617972997/AWP_POP_AWP.png?ex=69d928ea&is=69d7d76a&hm=9b0f5b2fea822775f86a6bf7a165cb09d78f082e3c96395230dfe0d8b0ad4ee2&",
            description: "A motorbike racer silhouette glowing in neon light trails.",
          },
          {
            id: "ak47_pulse_wave",
            name: "AK-47 | Slate",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Restricted",
            baseValue: 490,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491841494774976654/AK-47_Slate.png?ex=69d92929&is=69d7d7a9&hm=628baad1954c8d561507b67a33202937b946081b5f14d0d5a7fc7457670ed78b&=&format=webp&quality=lossless",
            description: "Audio waveform visualization painted across the receiver.",
          },
        ],
      },
      {
        rarity: "Classified",
        chance: 4,
        items: [
          {
            id: "m4a1s_hologram",
            name: "M4A1-S | Black Lotus",
            weapon: "M4A1-S",
            skinType: "Rifle",
            rarity: "Classified",
            baseValue: 2200,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491841744197910720/M4A1-S_Black_Lotus.png?ex=69d92964&is=69d7d7e4&hm=1664b7b02c2c78f36c6a42c2f8bffab51ea5c4f7c3963933e6aa959d15c59fd1&=&format=webp&quality=lossless",
            description: "Holographic rainbow sheen shifts with viewing angle.",
          },
        ],
      },
      {
        rarity: "Covert",
        chance: 0.9,
        items: [
          {
            id: "awp_neon_abyss",
            name: "AWP | Printstream",
            weapon: "AWP",
            skinType: "Sniper",
            rarity: "Covert",
            baseValue: 12000,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491842016001396807/AWP_Printstream.png?ex=69d929a5&is=69d7d825&hm=3ffaa5b3b8632aad20beb2c08755c68303923e3d7486233d4e37b52c3e7b7384&=&format=webp&quality=lossless",
            description: "The void stares back, glowing with forbidden light.",
          },
        ],
      },
      {
        rarity: "Contraband",
        chance: 0.1,
        items: [
          {
            id: "gloves_neon_surge",
            name: "★ Sport Gloves | Hedge Maze",
            weapon: "Sport Gloves",
            skinType: "Gloves",
            rarity: "Contraband",
            baseValue: 55000,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491842286089408522/Sport_Gloves_Hedge_Maze.png?ex=69d929e6&is=69d7d866&hm=8714a086da484b0850e3e2a4b66cb71ac9d1207529777bd98da790f40be7ce10&=&format=webp&quality=lossless",
            description: "Ultra-rare sport gloves electrified with neon circuitry.",
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  //   CASE 3 — Ancient Relic Case
  // ═══════════════════════════════════════════════════
  {
    id: "ancient_relic",
    name: "Ancient Relic Case",
    description: "Weapons adorned with ancient civilizations' artwork and symbols.",
    price: 500,
    imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492202390445625444/new_m4a4.png?ex=69da7945&is=69d927c5&hm=671d609d630740b35fc17f1de2051e7fbc883db67d87b617755fb9ff159aaa1a&=&format=webp&quality=lossless",
    color: 0xe4ae39,
    rarityPools: [
      {
        rarity: "Consumer Grade",
        chance: 40,
        items: [
          {
            id: "ak47_clay_pot",
            name: "AK-47 | Predator",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Consumer Grade",
            baseValue: 20,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491846593073254492/AK-47_Predator.png?ex=69d92de8&is=69d7dc68&hm=0b20f3f9066546bcb56116f31a54c6e1ea9444b16f5c89d2f6f17e6f54ace9df&=&format=webp&quality=lossless",
            description: "Terracotta clay patterns across the wooden stock.",
          },
          {
            id: "p90_hieroglyph",
            name: "P90 | Storm",
            weapon: "P90",
            skinType: "SMG",
            rarity: "Consumer Grade",
            baseValue: 16,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491846755359395850/P90_Storm.png?ex=69d92e0f&is=69d7dc8f&hm=330d4f54337b73683cd0b369988e464a514c9001e1b54e28d4ea52b426b66d27&=&format=webp&quality=lossless",
            description: "Ancient Egyptian hieroglyphs etched into the body.",
          },
        ],
      },
      {
        rarity: "Industrial Grade",
        chance: 25,
        items: [
          {
            id: "awp_stone_carving",
            name: "AWP | Arsenic Spill",
            weapon: "AWP",
            skinType: "Sniper",
            rarity: "Industrial Grade",
            baseValue: 70,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491846946468397107/AWP_Arsenic_Spill.png?ex=69d92e3d&is=69d7dcbd&hm=84facf8133a20259b2131633876d7fe8fa8a50fc9143b35ce02e910fb0235da2&=&format=webp&quality=lossless",
            description: "Detailed stone relief carvings covering the stock.",
          },
          {
            id: "usp_bronze_age",
            name: "USP-S | Business Class",
            weapon: "USP-S",
            skinType: "Pistol",
            rarity: "Industrial Grade",
            baseValue: 58,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491847189540901104/USP-S_Business_Class.png?ex=69d92e77&is=69d7dcf7&hm=9674f8aaeb2059b05845cd312ef37a267ebd3083e21824b8e391ba6f1806eafa&=&format=webp&quality=lossless",
            description: "Oxidized bronze finish with ancient warrior motifs.",
          },
        ],
      },
      {
        rarity: "Mil-Spec",
        chance: 20,
        items: [
          {
            id: "m4a4_golden_pharaoh",
            name: "M4A4 | Hellish",
            weapon: "M4A4",
            skinType: "Rifle",
            rarity: "Mil-Spec",
            baseValue: 220,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491847315307364492/M4A4_Hellish.png?ex=69d92e95&is=69d7dd15&hm=fb3624e8c4666da2c2e847d3babe0391772c81916be1958e1adaa837d0277b06&=&format=webp&quality=lossless",
            description: "Gilded pharaoh portrait with Ankh symbols inlaid.",
          },
          {
            id: "deagle_anubis",
            name: "Desert Eagle | Urban Rubble",
            weapon: "Desert Eagle",
            skinType: "Pistol",
            rarity: "Mil-Spec",
            baseValue: 200,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491847581230436563/Desert_Eagle_Urban_Rubble.png?ex=69d92ed4&is=69d7dd54&hm=ad4ef411cad09dba56dcbf2334e2871a9950705006c29269ae3b8a254594bcb4&=&format=webp&quality=lossless",
            description: "The god of the dead watches over every shot.",
          },
        ],
      },
      {
        rarity: "Restricted",
        chance: 10,
        items: [
          {
            id: "ak47_maya_serpent",
            name: "AK-47 | Blue Laminate",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Restricted",
            baseValue: 650,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491847936139853834/AK-47_Blue_Laminate.png?ex=69d92f29&is=69d7dda9&hm=6b62202a58b898d85c378becafaab4842f158367c1695a632306d3b1d56a2b57&=&format=webp&quality=lossless",
            description: "A feathered serpent deity wraps around the barrel.",
          },
          {
            id: "awp_medusa",
            name: "AWP | Medusa",
            weapon: "AWP",
            skinType: "Sniper",
            rarity: "Restricted",
            baseValue: 700,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491848115739689040/AWP_Medusa.png?ex=69d92f53&is=69d7ddd3&hm=2052b91a909afee39aad0deaca4e9b68f4ee84977ebb6c0ede24934aee6d34e3&=&format=webp&quality=lossless",
            description: "The gorgon's gaze is painted across the scope.",
          },
        ],
      },
      {
        rarity: "Classified",
        chance: 4,
        items: [
          {
            id: "m4a1s_poseidon",
            name: "M4A1-S | Master Piece",
            weapon: "M4A1-S",
            skinType: "Rifle",
            rarity: "Classified",
            baseValue: 3500,
            imageUrl: "https://cdn.discordapp.com/attachments/1233480912814080211/1491848302377832448/M4A1-S_Master_Piece.png?ex=69d92f80&is=69d7de00&hm=e3c0c04cf2015cc532c501eb92f7835802c9abb0fa90e0aa9496ac03db0e2f94&",
            description: "The ocean god commands storms from your barrel.",
          },
        ],
      },
      {
        rarity: "Covert",
        chance: 0.9,
        items: [
          {
            id: "ak47_fire_serpent",
            name: "AK-47 | Fire Serpent",
            weapon: "AK-47",
            skinType: "Rifle",
            rarity: "Covert",
            baseValue: 25000,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491848482057617489/AK-47_Fire_Serpent.png?ex=69d92fab&is=69d7de2b&hm=b1a7ddb41f745a98b7a9b5ead31e2ad0ab8f1c1d1ffa5d8184fa0da7ea51feed&=&format=webp&quality=lossless",
            description: "Legendary AK skin with a fire-breathing serpent of myth.",
          },
        ],
      },
      {
        rarity: "Contraband",
        chance: 0.1,
        items: [
          {
            id: "knife_golden_karambit",
            name: "★ Karambit | Lore",
            weapon: "Karambit",
            skinType: "Knife",
            rarity: "Contraband",
            baseValue: 75000,
            imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1491848672365904114/Karambit_Lore.png?ex=69d92fd8&is=69d7de58&hm=85c1d05de1070517c73294554a162acae5be43ea879df0bc723135b7bf986d9d&=&format=webp&quality=lossless",
            description: "A sacred golden karambit recovered from an ancient temple vault.",
          },
        ],
      },
    ],
  },
// ═══════════════════════════════════════════════════
//   CASE 0 — Test Your Luck Case
// ═══════════════════════════════════════════════════
{
  id: "test_your_luck",
  name: "Test Your Luck Case",
  description:
    "99.984% chance of a single weapon worth 1 coin. " +
    "A miraculous 0.016% chance to land one of 6 ultra-rare Contraband items worth thousands.",
  price: 1,
  imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492201788030320671/fade-mining.png?ex=69da78b6&is=69d92736&hm=16e7b6d608b8a939dacf5035008ae82357a49d40ad1ad86e6a72683910f98911&=&format=webp&quality=lossless",
  color: 0x2ecc71,
  rarityPools: [
    {
      rarity: "Consumer Grade",
      chance: 99.984,
      items: [
        {
          id: "luck_p250_worn",
          name: "P250 | Boreal Forest",
          weapon: "P250",
          skinType: "Pistol",
          rarity: "Consumer Grade",
          baseValue: 1,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492202739042746389/d4f6c4e82ea21593b9a75a2b3426432a.png?ex=69da7998&is=69d92818&hm=b6562059d8ce37ed11c7bd5254a741636535de3d3b1213b7eefc973d9a1ee7f7&=&format=webp&quality=lossless",
          description: "A plain pistol worth exactly 1 coin. Better luck next time.",
        },
      ],
    },

    {
      rarity: "Contraband",
      chance: 0.016,
      items: [
        {
          id: "luck_karambit_doppler",
          name: "★ Karambit | Doppler",
          weapon: "Karambit",
          skinType: "Knife",
          rarity: "Contraband",
          baseValue: 80000,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492202863005536286/bde86cbbe92dc9a7671a61764d6d82dd.png?ex=69da79b6&is=69d92836&hm=0f61954d99742105293d08548f17b196a1cd8169e6236bbab58874a8edea81c5&=&format=webp&quality=lossless",
          description:
            "A legendary Karambit with a mesmerising phase-shift Doppler finish.",
        },
        {
          id: "luck_butterfly_fade",
          name: "★ Butterfly Knife | Fade",
          weapon: "Butterfly Knife",
          skinType: "Knife",
          rarity: "Contraband",
          baseValue: 95000,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492202969095995392/16227332956da24f362782cc6ffdc95d.png?ex=69da79cf&is=69d9284f&hm=031746a0fddc58e9b122d514baf106dfc68f26edfbbff1323ee7d86dc7e873f5&=&format=webp&quality=lossless",
          description:
            "The rarest butterfly knife finish. A full fade from gold to pink to purple.",
        },
        {
          id: "luck_m9_crimson",
          name: "★ M9 Bayonet | Crimson Web",
          weapon: "M9 Bayonet",
          skinType: "Knife",
          rarity: "Contraband",
          baseValue: 72000,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492203083542040616/4c5007b9c3519048ad15e06bf42fac51.png?ex=69da79ea&is=69d9286a&hm=2d735a200115a7552cb7fbf772e08898045d135eaf1b1da274beeb9b3a8b9e4b&=&format=webp&quality=lossless",
          description:
            "Blood-red webbing across a deadly M9 blade. Extremely coveted.",
        },
        {
          id: "luck_gloves_pandoras",
          name: "★ Specialist Gloves | Blackbook",
          weapon: "Specialist Gloves",
          skinType: "Gloves",
          rarity: "Contraband",
          baseValue: 68000,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492203313909989648/db5fa4751982b5f8f250b1d0aecddd09.png?ex=69da7a21&is=69d928a1&hm=1665b9d542fd7955d83b46989be289846fea983804bd6a45c5f9cd708fadae94&=&format=webp&quality=lossless",
          description:
            "Deep iridescent blue gloves that shimmer like a forbidden treasure.",
        },
        {
          id: "luck_gloves_superconductor",
          name: "★ Sport Gloves | Superconductor",
          weapon: "Sport Gloves",
          skinType: "Gloves",
          rarity: "Contraband",
          baseValue: 62000,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492203515957870793/7fd68bfe558f76aa19c59a1c2a288ef4.png?ex=69da7a52&is=69d928d2&hm=8c5b748fcee5fe97754bdd4aa142b2fc50083e1671b96488524de64c89b216ce&=&format=webp&quality=lossless",
          description:
            "Electric circuit patterns run across premium sport gloves.",
        },
        {
          id: "luck_bayonet_sapphire",
          name: "★ Bayonet | Sapphire",
          weapon: "Bayonet",
          skinType: "Knife",
          rarity: "Contraband",
          baseValue: 110000,
          imageUrl: "https://media.discordapp.net/attachments/1233480912814080211/1492203633385930933/0a1f49937e026f5b54c456017f541d98.png?ex=69da7a6e&is=69d928ee&hm=fdba78b5f33f649060d47199074e13caed04f18cfc35f316ef9afc671215610d&=&format=webp&quality=lossless",
          description:
            "Pure sapphire gem finish on a full-tang bayonet. The rarest of the rare.",
        },
      ],
    },
  ],
},
];


export function getCaseById(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

export function getAllCases(): Case[] {
  return CASES;
}


export function rollRarityPool(caseData: Case): RarityPool | null {
  const roll = Math.random() * 100;
  let cumulative = 0;

  const sorted = [...caseData.rarityPools].sort((a, b) => b.chance - a.chance);

  for (const pool of sorted) {
    cumulative += pool.chance;
    if (roll <= cumulative) return pool;
  }

  return sorted[0] ?? null;
}

export function rollItemFromPool(pool: RarityPool): CaseItem | null {
  if (pool.items.length === 0) return null;
  const index = Math.floor(Math.random() * pool.items.length);
  return pool.items[index] ?? null;
}

export function openCase(caseData: Case): InventoryItem | null {
  const pool = rollRarityPool(caseData);
  if (!pool) return null;

  const item = rollItemFromPool(pool);
  if (!item) return null;

  const wear = rollWear();
  const value = calculateItemValue(item.baseValue, wear);

  const inventoryItem: InventoryItem = {
    itemId: item.id,
    name: item.name,
    weapon: item.weapon,
    skinType: item.skinType,
    rarity: item.rarity,
    wear,
    value,
    imageUrl: item.imageUrl,
    obtainedAt: new Date(),
    caseId: caseData.id,
    uniqueId: uuid(),
  };

  return inventoryItem;
}
