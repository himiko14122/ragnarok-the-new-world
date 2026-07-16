import {
  BookOpen, Code2, Coins, Gamepad2, Map, PawPrint, Shield,
  Sparkles, Swords, Target, Trophy, Users, Wand2,
  type LucideIcon,
} from 'lucide-react';

export interface StatConfig {
  val: string;
  labelKey: string;
}

export interface ModuleCardConfig {
  key: string;
  labelKey: string;
  titleKey: string;
  descKey: string;
  href: string;
  stats: StatConfig[];
  icon: LucideIcon;
  ctaKey?: string;
}

export interface GameFeatureConfig {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
}

export interface StartHereStepConfig {
  titleKey: string;
  descKey: string;
  href: string;
}

export interface HeroCtaConfig {
  labelKey: string;
  href: string;
  style: 'primary' | 'secondary';
}

export interface GameModesComparisonRowConfig {
  labelKey: string;
  values: Record<string, string>;
}

export const HOME_CONFIG = {
  hero: {
    videoId: 'KVHa83JkUV0',
    badgeKeys: [
      'home_hero_badge_released',
      'home_hero_badge_steam',
      'home_hero_badge_classes',
      'home_hero_badge_discord',
      'home_hero_badge_price',
      'home_hero_badge_platforms',
      'home_hero_badge_refine',
      'home_hero_badge_aspd',
    ],
    ctas: [
      { labelKey: 'home_hero_cta_guides', href: '/guides/beginners-guide', style: 'primary' as const },
      { labelKey: 'home_hero_cta_tierList', href: '/tier-list', style: 'secondary' as const },
      { labelKey: 'home_hero_cta_codes', href: '/codes', style: 'secondary' as const },
    ],
  },

  moduleCards: [
    { key: 'beginner', labelKey: 'home_module_beginner', titleKey: 'home_module_beginner_title', descKey: 'home_module_beginner_desc', href: '/guides', stats: [{ val: '__guideCount', labelKey: 'home_module_starter_pages' }, { val: '3', labelKey: 'home_module_core_systems' }], icon: BookOpen, ctaKey: 'home_module_beginner_cta' },
    { key: 'codes', labelKey: 'home_module_codes', titleKey: 'home_module_codes_title', descKey: 'home_module_codes_desc', href: '/codes', stats: [{ val: '__activeCodeCount', labelKey: 'home_module_active' }, { val: 'Free', labelKey: 'home_module_rewards' }], icon: Code2, ctaKey: 'home_module_codes_cta' },
    { key: 'tierlist', labelKey: 'home_module_tierlist', titleKey: 'home_module_tierlist_title', descKey: 'home_module_tierlist_desc', href: '/tier-list', stats: [{ val: 'S-A', labelKey: 'home_module_top_tiers' }, { val: '8', labelKey: 'home_module_class_total' }], icon: Trophy },
    { key: 'classes', labelKey: 'home_module_classes', titleKey: 'home_module_classes_title', descKey: 'home_module_classes_desc', href: '/classes', stats: [{ val: '8', labelKey: 'home_module_class_total' }, { val: '3', labelKey: 'home_module_forms' }], icon: Swords },
    { key: 'mvp', labelKey: 'home_module_mvp', titleKey: 'home_module_mvp_title', descKey: 'home_module_mvp_desc', href: '/mvp-hunting', stats: [{ val: '__mvpCount', labelKey: 'home_module_mvp' }, { val: 'Yes', labelKey: 'home_module_tameable' }], icon: Shield },
    { key: 'refining', labelKey: 'home_module_refining', titleKey: 'home_module_refining_title', descKey: 'home_module_refining_desc', href: '/refining', stats: [{ val: '+15', labelKey: 'home_module_safe_refine' }, { val: '0%', labelKey: 'home_module_break_rate' }], icon: Wand2 },
    { key: 'zeny', labelKey: 'home_module_zeny', titleKey: 'home_module_zeny_title', descKey: 'home_module_zeny_desc', href: '/zeny-farming', stats: [{ val: '1.5M+', labelKey: 'home_module_daily_zeny' }, { val: '5', labelKey: 'home_module_methods' }], icon: Coins },
    { key: 'pvp', labelKey: 'home_module_pvp', titleKey: 'home_module_pvp_title', descKey: 'home_module_pvp_desc', href: '/pvp', stats: [{ val: '3', labelKey: 'home_module_arena_modes' }, { val: 'GvG', labelKey: 'home_module_combat_type' }], icon: Gamepad2 },
    { key: 'dungeons', labelKey: 'home_module_dungeons', titleKey: 'home_module_dungeons_title', descKey: 'home_module_dungeons_desc', href: '/dungeons', stats: [{ val: 'Daily', labelKey: 'home_module_reset' }, { val: '2', labelKey: 'home_module_difficulty' }], icon: Map },
    { key: 'mounts', labelKey: 'home_module_mounts', titleKey: 'home_module_mounts_title', descKey: 'home_module_mounts_desc', href: '/mounts', stats: [{ val: 'Yes', labelKey: 'home_module_tameable' }, { val: 'Yes', labelKey: 'home_module_flight' }], icon: PawPrint },
    { key: 'druid', labelKey: 'home_module_druid', titleKey: 'home_module_druid_title', descKey: 'home_module_druid_desc', href: '/classes', stats: [{ val: '3', labelKey: 'home_module_forms' }, { val: 'A', labelKey: 'home_module_tier' }], icon: Sparkles },
    { key: 'romance', labelKey: 'home_module_romance', titleKey: 'home_module_romance_title', descKey: 'home_module_romance_desc', href: '/guides', stats: [{ val: 'Yes', labelKey: 'home_module_couple' }, { val: 'Yes', labelKey: 'home_module_duo_tp' }], icon: Users },
  ] as ModuleCardConfig[],

  gameFeatures: [
    { titleKey: 'home_feature_jobFreedom', descKey: 'home_feature_jobFreedom_desc', icon: Swords },
    { titleKey: 'home_feature_safeRefine', descKey: 'home_feature_safeRefine_desc', icon: Wand2 },
    { titleKey: 'home_feature_mvpMounts', descKey: 'home_feature_mvpMounts_desc', icon: Shield },
    { titleKey: 'home_feature_flyingMounts', descKey: 'home_feature_flyingMounts_desc', icon: PawPrint },
    { titleKey: 'feature_offline', descKey: 'feature_offline_desc', icon: Target },
    { titleKey: 'feature_crossPlatform', descKey: 'feature_crossPlatform_desc', icon: Users },
  ] as GameFeatureConfig[],

  startHereSteps: [
    { titleKey: 'home_start_1_title', descKey: 'home_start_1_desc', href: '/guides' },
    { titleKey: 'home_start_2_title', descKey: 'home_start_2_desc', href: '/tier-list' },
    { titleKey: 'home_start_3_title', descKey: 'home_start_3_desc', href: '/codes' },
    { titleKey: 'home_start_4_title', descKey: 'home_start_4_desc', href: '/refining' },
    { titleKey: 'home_start_5_title', descKey: 'home_start_5_desc', href: '/mvp-hunting' },
  ] as StartHereStepConfig[],

  gameOverview: {
    infoItems: ['developer', 'publisher', 'platform', 'genre', 'price', 'classes', 'safeRefine', 'aspdCap'],
    cta: {
      guideLabelKey: 'home_about_cta',
      guideHref: '/guides',
      externalLabelKey: 'home_cta_steam',
      externalLinkKey: 'steam',
    },
  },

  gameModesComparison: {
    columnModes: ['openworld', 'timecorridor', 'pvp_ranked', 'gvg_siege'],
    rows: [
      { labelKey: 'gameModes_combatType', values: { 'openworld': 'gameModes_pve', 'timecorridor': 'gameModes_pve_daily', 'pvp_ranked': 'gameModes_pvp_ranked', 'gvg_siege': 'gameModes_gvg_siege' } },
      { labelKey: 'gameModes_risk', values: { 'openworld': 'gameModes_risk_openworld', 'timecorridor': 'gameModes_risk_dungeon', 'pvp_ranked': 'gameModes_risk_pvp', 'gvg_siege': 'gameModes_risk_woe' } },
      { labelKey: 'gameModes_bestFor', values: { 'openworld': 'gameModes_bestFor_openworld', 'timecorridor': 'gameModes_bestFor_timecorridor', 'pvp_ranked': 'gameModes_bestFor_pvp', 'gvg_siege': 'gameModes_bestFor_woe' } },
      { labelKey: 'gameModes_reward', values: { 'openworld': 'gameModes_reward_openworld', 'timecorridor': 'gameModes_reward_timecorridor', 'pvp_ranked': 'gameModes_reward_pvp', 'gvg_siege': 'gameModes_reward_woe' } },
    ] as GameModesComparisonRowConfig[],
  },

  faq: {
    keys: ['bestClass', 'bestStarterClass', 'howToCodes', 'jobFreedom', 'safeRefine', 'p2w', 'mvpMounts', 'flyingMounts', 'offlineFarming', 'pvp', 'crossplay', 'zenyFarming', 'bestDpsBuild', 'druidForms', 'timeCorridor'],
  },

  bottomCta: {
    guideHref: '/guides',
    guideLabelKey: 'home_cta_guide',
    externalLinkKey: 'steam',
    externalLabelKey: 'home_cta_steam',
  },
};
