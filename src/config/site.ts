import { routing, type Locale } from '@/i18n/routing';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ragnarok-the-new-world.wiki';
export const SITE_NAME = 'Ragnarok The New World Wiki';
export const HERO_IMAGE = '/images/hero.webp';
export const LOGO_IMAGE = '/favicon.svg';
export const TWITTER_HANDLE = '@RagnarokTheNewWorld';
export const GA_TRACKING_ID = 'G-ECRGKCQ8GG';

export const SLUG_PREFIX = 'Ragnarok-The-New-World-';

export const EXTERNAL_LINKS = {
  steam: 'https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/',
  discord: 'https://discord.com/invite/ragnarokthenewworld',
  youtube: 'https://www.youtube.com/@RagnarokTheNewWorld',
  facebook: 'https://www.facebook.com/RagnarokTheNewWorld.Gravity/',
} as const;

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function localizedPath(locale: Locale | string, path = '/') {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized === '/' ? '/' : normalized;
  }
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}
