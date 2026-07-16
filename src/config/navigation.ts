import { BookOpen, Code2, Coins, Gamepad2, Home, Info, Map, PawPrint, ScrollText, Shield, Swords, Trophy, Wand2, type LucideIcon } from 'lucide-react';

export const NAVIGATION_CONFIG = [
  { key: 'home', labelKey: 'nav_home', path: '/', icon: Home, showInHeader: false, showInSidebar: true, showInFooter: false, sitemap: true, priority: 1, changeFrequency: 'daily' },
  { key: 'codes', labelKey: 'nav_codes', path: '/codes', icon: Code2, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'daily' },
  { key: 'tier-list', labelKey: 'nav_tierList', path: '/tier-list', icon: Trophy, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'guides', labelKey: 'nav_guides', path: '/guides', icon: BookOpen, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.8, changeFrequency: 'weekly' },
  { key: 'classes', labelKey: 'nav_classes', path: '/classes', icon: Swords, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.9, changeFrequency: 'weekly' },
  { key: 'mvp-hunting', labelKey: 'nav_mvpHunting', path: '/mvp-hunting', icon: Shield, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.8, changeFrequency: 'weekly' },
  { key: 'refining', labelKey: 'nav_refining', path: '/refining', icon: Wand2, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.8, changeFrequency: 'weekly' },
  { key: 'zeny-farming', labelKey: 'nav_zenyFarming', path: '/zeny-farming', icon: Coins, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.8, changeFrequency: 'weekly' },
  { key: 'pvp', labelKey: 'nav_pvp', path: '/pvp', icon: Gamepad2, isContentType: true, showInHeader: true, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.8, changeFrequency: 'weekly' },
  { key: 'dungeons', labelKey: 'nav_dungeons', path: '/dungeons', icon: Map, isContentType: true, showInHeader: false, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.7, changeFrequency: 'weekly' },
  { key: 'mounts', labelKey: 'nav_mounts', path: '/mounts', icon: PawPrint, isContentType: true, showInHeader: false, showInSidebar: true, showInFooter: true, sitemap: true, priority: 0.7, changeFrequency: 'monthly' },
  { key: 'about', labelKey: 'nav_about', path: '/about', icon: Info, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: true, priority: 0.7, changeFrequency: 'monthly' },
  { key: 'sitemap', labelKey: 'nav_sitemap', path: '/sitemap', icon: Map, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: false, priority: 0.5, changeFrequency: 'monthly' },
  { key: 'privacy-policy', labelKey: 'nav_privacyPolicy', path: '/privacy-policy', icon: ScrollText, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: true, priority: 0.4, changeFrequency: 'yearly' },
  { key: 'terms-of-service', labelKey: 'nav_termsOfService', path: '/terms-of-service', icon: ScrollText, showInHeader: false, showInSidebar: false, showInFooter: true, sitemap: true, priority: 0.4, changeFrequency: 'yearly' },
] as const;

export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => 'isContentType' in item && item.isContentType).map((item) => item.key);

export type NavigationItem = (typeof NAVIGATION_CONFIG)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.includes(value as ContentType);
}

export function getNavigationItem(path: string) {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return NAVIGATION_CONFIG.find((item) => item.path === normalized || item.key === path);
}

export const CONTENT_DIR_NAMES: Record<ContentType | string, string> = {
  codes: 'codes',
  'tier-list': 'tier-list',
  guides: 'guides',
  classes: 'classes',
  'mvp-hunting': 'mvp-hunting',
  refining: 'refining',
  'zeny-farming': 'zeny-farming',
  pvp: 'pvp',
  dungeons: 'dungeons',
  mounts: 'mounts',
} as Record<ContentType, string>;

export function getContentDir(contentType: ContentType): string {
  return CONTENT_DIR_NAMES[contentType] || contentType;
}

export const GUIDE_CATEGORIES: Record<string, { emoji: string; order: number }> = {
  general:      { emoji: '🚀', order: 1 },
  classes:      { emoji: '⚔️', order: 2 },
  combat:       { emoji: '⚡', order: 3 },
  progression:  { emoji: '⏳', order: 4 },
  strategy:     { emoji: '🎯', order: 5 },
  economy:      { emoji: '💰', order: 6 },
  refining:     { emoji: '🔧', order: 7 },
  codes:        { emoji: '🎁', order: 8 },
  'tier-list':  { emoji: '🏆', order: 9 },
  'mvp-hunting':{ emoji: '👹', order: 10 },
  'zeny-farming':{ emoji: '💎', order: 11 },
  pvp:          { emoji: '⚔️', order: 12 },
  dungeons:     { emoji: '🏰', order: 13 },
  mounts:       { emoji: '🦅', order: 14 },
};

export const CATEGORY_ORDER = Object.entries(GUIDE_CATEGORIES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key]) => key);

export const CATEGORY_AFFINITY: Record<string, string[]> = {
  general: ['classes', 'progression'],
  classes: ['combat', 'strategy'],
  combat: ['classes', 'strategy'],
  strategy: ['combat', 'economy'],
  economy: ['strategy', 'zeny-farming'],
  progression: ['economy', 'general'],
  refining: ['progression', 'economy'],
  codes: ['general'],
  'tier-list': ['classes', 'combat'],
  'mvp-hunting': ['combat', 'classes'],
  'zeny-farming': ['economy', 'progression'],
  pvp: ['combat', 'classes'],
  dungeons: ['combat', 'progression'],
  mounts: ['mvp-hunting', 'progression'],
};

export const CONTENT_TYPES_WITH_DEDICATED_PAGES: ContentType[] = ['codes', 'tier-list', 'guides', 'classes', 'mvp-hunting', 'refining', 'zeny-farming', 'pvp', 'dungeons', 'mounts'];
