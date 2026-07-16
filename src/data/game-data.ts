import { Compass, Cog, Shield, Swords, Zap, type LucideIcon } from 'lucide-react';

// ===== Class Data =====
export interface GameClass {
  id: string;
  nameKey: string;
  descKey: string;
  tier: string;
  type: string;
  typeKey: string;
  image: string;
  strengthsKey: string;
  buildKey: string;
  tipsKeys: string[];
}

export const gameClasses: GameClass[] = [
  { id: "gunslinger", nameKey: "class_gunslinger", descKey: "class_gunslinger_desc", tier: "S", type: "Ranged DPS", typeKey: "class_type_ranged", image: "/images/classes/gunslinger.png", strengthsKey: "class_gunslinger_strengths", buildKey: "class_gunslinger_build", tipsKeys: ["class_gunslinger_tip1", "class_gunslinger_tip2", "class_gunslinger_tip3"] },
  { id: "mage", nameKey: "class_mage", descKey: "class_mage_desc", tier: "S", type: "Ranged DPS", typeKey: "class_type_ranged", image: "/images/classes/mage.png", strengthsKey: "class_mage_strengths", buildKey: "class_mage_build", tipsKeys: ["class_mage_tip1", "class_mage_tip2", "class_mage_tip3"] },
  { id: "swordsman", nameKey: "class_swordsman", descKey: "class_swordsman_desc", tier: "A", type: "Melee Tank", typeKey: "class_type_melee", image: "/images/classes/swordsman.png", strengthsKey: "class_swordsman_strengths", buildKey: "class_swordsman_build", tipsKeys: ["class_swordsman_tip1", "class_swordsman_tip2", "class_swordsman_tip3"] },
  { id: "archer", nameKey: "class_archer", descKey: "class_archer_desc", tier: "A", type: "Ranged DPS", typeKey: "class_type_ranged", image: "/images/classes/archer.png", strengthsKey: "class_archer_strengths", buildKey: "class_archer_build", tipsKeys: ["class_archer_tip1", "class_archer_tip2", "class_archer_tip3"] },
  { id: "acolyte", nameKey: "class_acolyte", descKey: "class_acolyte_desc", tier: "A", type: "Support", typeKey: "class_type_support", image: "/images/classes/acolyte.png", strengthsKey: "class_acolyte_strengths", buildKey: "class_acolyte_build", tipsKeys: ["class_acolyte_tip1", "class_acolyte_tip2", "class_acolyte_tip3"] },
  { id: "druid", nameKey: "class_druid", descKey: "class_druid_desc", tier: "A", type: "Hybrid", typeKey: "class_type_hybrid", image: "/images/classes/druid.png", strengthsKey: "class_druid_strengths", buildKey: "class_druid_build", tipsKeys: ["class_druid_tip1", "class_druid_tip2", "class_druid_tip3"] },
  { id: "thief", nameKey: "class_thief", descKey: "class_thief_desc", tier: "B", type: "Melee DPS", typeKey: "class_type_melee", image: "/images/classes/thief.png", strengthsKey: "class_thief_strengths", buildKey: "class_thief_build", tipsKeys: ["class_thief_tip1", "class_thief_tip2", "class_thief_tip3"] },
  { id: "merchant", nameKey: "class_merchant", descKey: "class_merchant_desc", tier: "B", type: "Economy", typeKey: "class_type_economy", image: "/images/classes/merchant.png", strengthsKey: "class_merchant_strengths", buildKey: "class_merchant_build", tipsKeys: ["class_merchant_tip1", "class_merchant_tip2", "class_merchant_tip3"] },
];

// ===== Game Mode Data =====
export interface GameMode {
  id: string;
  nameKey: string;
  descKey: string;
  type: string;
  typeKey: string;
  rewards: string[];
}

export const gameModes: GameMode[] = [
  { id: "open-world", nameKey: "mode_openworld", descKey: "mode_openworld_desc", type: "PvE", typeKey: "mode_type_pve", rewards: ["Resources", "Experience", "Equipment", "Cards"] },
  { id: "time-corridor", nameKey: "mode_timecorridor", descKey: "mode_timecorridor_desc", type: "PvE", typeKey: "mode_type_pve", rewards: ["Refinement Materials", "Cards", "Equipment"] },
  { id: "mvp-hunting", nameKey: "mode_mvphunting", descKey: "mode_mvphunting_desc", type: "PvE", typeKey: "mode_type_pve", rewards: ["MVP Loot", "Mount Taming", "Rare Cards"] },
  { id: "pvp-arena", nameKey: "mode_pvparena", descKey: "mode_pvparena_desc", type: "PvP", typeKey: "mode_type_pvp", rewards: ["Rank Points", "Cosmetics", "Glory"] },
  { id: "war-of-emperium", nameKey: "mode_woe", descKey: "mode_woe_desc", type: "GvG", typeKey: "mode_type_gvg", rewards: ["Castle Ownership", "Guild Treasury", "Exclusive Gear"] },
];

// ===== Promo Code Data =====
export interface PromoCodeReward {
  item: string;
  itemKey: string;
  amount: number;
}

export interface PromoCode {
  id: string;
  code: string;
  rewards: PromoCodeReward[];
  status: "active" | "expired";
  levelReq: number;
}

export const promoCodes: PromoCode[] = [
  { id: "row666", code: "ROW666", rewards: [{ item: "Kafra Blind Box", itemKey: "reward_kafra_blindbox", amount: 1 }, { item: "Adventure Coin", itemKey: "reward_adventure_coin", amount: 20000 }, { item: "Common Hair Dye", itemKey: "reward_hair_dye", amount: 1 }], status: "active", levelReq: 0 },
  { id: "row777", code: "ROW777", rewards: [{ item: "Kafra Blind Box", itemKey: "reward_kafra_blindbox", amount: 1 }, { item: "Adventure Coin", itemKey: "reward_adventure_coin", amount: 1 }, { item: "Cosmetic Items", itemKey: "reward_cosmetic", amount: 1 }], status: "active", levelReq: 0 },
  { id: "babymonster", code: "BABYMONSTER", rewards: [{ item: "Zeny", itemKey: "reward_zeny", amount: 1 }, { item: "Consumables", itemKey: "reward_consumables", amount: 1 }], status: "active", levelReq: 0 },
];

// ===== MVP Data =====
export interface MvpBoss {
  id: string;
  nameKey: string;
  level: number;
  element: string;
  elementKey: string;
  spawnKey: string;
  cardDrop: boolean;
  mountDrop: boolean;
}

export const mvpBosses: MvpBoss[] = [
  { id: "golden-thief-bug", nameKey: "mvp_golden_thief_bug", level: 69, element: "Fire", elementKey: "element_fire", spawnKey: "mvp_spawn_gtb", cardDrop: true, mountDrop: false },
  { id: "eddga", nameKey: "mvp_eddga", level: 74, element: "Fire", elementKey: "element_fire", spawnKey: "mvp_spawn_eddga", cardDrop: true, mountDrop: true },
  { id: "drake", nameKey: "mvp_drake", level: 78, element: "Water", elementKey: "element_water", spawnKey: "mvp_spawn_drake", cardDrop: true, mountDrop: false },
  { id: "maya", nameKey: "mvp_maya", level: 82, element: "Earth", elementKey: "element_earth", spawnKey: "mvp_spawn_maya", cardDrop: true, mountDrop: true },
  { id: "osiris", nameKey: "mvp_osiris", level: 85, element: "Undead", elementKey: "element_undead", spawnKey: "mvp_spawn_osiris", cardDrop: true, mountDrop: false },
  { id: "baphomet", nameKey: "mvp_baphomet", level: 88, element: "Dark", elementKey: "element_dark", spawnKey: "mvp_spawn_baphomet", cardDrop: true, mountDrop: true },
  { id: "dark-lord", nameKey: "mvp_dark_lord", level: 92, element: "Dark", elementKey: "element_dark", spawnKey: "mvp_spawn_dark_lord", cardDrop: true, mountDrop: false },
  { id: "stormy-knight", nameKey: "mvp_stormy_knight", level: 96, element: "Wind", elementKey: "element_wind", spawnKey: "mvp_spawn_stormy", cardDrop: true, mountDrop: true },
];

// ===== Refining Data =====
export interface RefineLevel {
  level: number;
  successRate: string;
  zenyCost: string;
  materialKey: string;
}

export const refineLevels: RefineLevel[] = [
  { level: 1, successRate: "100%", zenyCost: "10K", materialKey: "refine_material_1" },
  { level: 2, successRate: "100%", zenyCost: "20K", materialKey: "refine_material_2" },
  { level: 3, successRate: "100%", zenyCost: "30K", materialKey: "refine_material_3" },
  { level: 4, successRate: "100%", zenyCost: "50K", materialKey: "refine_material_4" },
  { level: 5, successRate: "100%", zenyCost: "80K", materialKey: "refine_material_5" },
  { level: 6, successRate: "90%", zenyCost: "120K", materialKey: "refine_material_6" },
  { level: 7, successRate: "70%", zenyCost: "200K", materialKey: "refine_material_7" },
  { level: 8, successRate: "50%", zenyCost: "350K", materialKey: "refine_material_8" },
  { level: 9, successRate: "35%", zenyCost: "500K", materialKey: "refine_material_9" },
  { level: 10, successRate: "25%", zenyCost: "750K", materialKey: "refine_material_10" },
];

// ===== Color Maps =====
export const TIER_COLOR_MAP: Record<string, string> = {
  S: 'var(--color-tier-s)',
  A: 'var(--color-tier-a)',
  B: 'var(--color-tier-b)',
  C: 'var(--color-tier-c)',
};
export const TIER_COLOR_DEFAULT = 'var(--color-tier-c)';

export const CLASS_TYPE_COLOR_MAP: Record<string, string> = {
  'Ranged DPS': 'var(--color-tier-s)',
  'Melee Tank': 'var(--color-tier-a)',
  'Melee DPS': 'var(--color-tier-a)',
  Support: 'var(--color-tier-a)',
  Hybrid: 'var(--color-tier-a)',
  Economy: 'var(--color-tier-b)',
};
export const CLASS_TYPE_COLOR_DEFAULT = 'var(--color-tier-b)';

export function tierColor(tier: string): string {
  return TIER_COLOR_MAP[tier] ?? TIER_COLOR_DEFAULT;
}

export function classTypeColor(type: string): string {
  return CLASS_TYPE_COLOR_MAP[type] ?? CLASS_TYPE_COLOR_DEFAULT;
}

// ===== GUIDE_STOP_WORDS =====
export const GUIDE_STOP_WORDS = [
  'ragnarok', 'the', 'new', 'world', 'row', 'ro3', 'midgard', 'mmorpg', 'open',
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'to',
  'was', 'were', 'will', 'with', 'you', 'your', 'how', 'what', 'when',
  'where', 'which', 'who', 'why', 'do', 'does', 'can', 'all', 'best',
  'guide', 'tips', 'wiki', 'list', 'top',
];
