import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_URL } from '@/config/site';
import AdBanner from '@/components/AdBanner';
import CategoryArticleList from '@/components/CategoryArticleList';
import { getAllContent } from '@/lib/content';
import type { ContentType } from '@/config/navigation';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  return {
    title: `${t('nav_zenyFarming')} | ${t('site_title')}`,
    description: t('page_zenyFarming_description'),
    alternates: {
      canonical: `${SITE_URL}/zeny-farming`,
    },
  };
}

export default async function ZenyFarmingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const adKey = process.env.NEXT_PUBLIC_AD_BANNER_KEY;
  const articles = await getAllContent('zeny-farming' as ContentType, validLocale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('nav_zenyFarming')}</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">{t('section_zenyFarming_desc')}</p>
      <div className="glow-line mb-10" />
      <CategoryArticleList items={articles} title={t('category_articles_zeny-farming')} readMoreLabel={t('read_more')} emptyLabel={t('no_articles_yet')} />
      {adKey && (
        <div className="flex justify-center py-6">
          <AdBanner type="native-banner" />
        </div>
      )}
      <div className="mt-8">
        <Link href={'/'} className="btn-secondary">&larr; {t('nav_home')}</Link>
      </div>
    </div>
  );
}
