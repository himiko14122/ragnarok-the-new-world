import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { translate } from '@/lib/i18n';
import { SITE_URL, EXTERNAL_LINKS } from '@/config/site';
import AdBanner from '@/components/AdBanner';
import CategoryArticleList from '@/components/CategoryArticleList';
import { getAllContent } from '@/lib/content';
import type { ContentType } from '@/config/navigation';
import type { Metadata } from 'next';

const CLASS_TIERS = [
  { id: 'gunslinger', nameKey: 'class_gunslinger', roleKey: 'class_type_ranged', tier: 'S' },
  { id: 'mage', nameKey: 'class_mage', roleKey: 'class_type_ranged', tier: 'S' },
  { id: 'swordsman', nameKey: 'class_swordsman', roleKey: 'class_type_melee', tier: 'A' },
  { id: 'archer', nameKey: 'class_archer', roleKey: 'class_type_ranged', tier: 'A' },
  { id: 'acolyte', nameKey: 'class_acolyte', roleKey: 'class_type_support', tier: 'A' },
  { id: 'druid', nameKey: 'class_druid', roleKey: 'class_type_hybrid', tier: 'A' },
  { id: 'thief', nameKey: 'class_thief', roleKey: 'class_type_melee', tier: 'B' },
  { id: 'merchant', nameKey: 'class_merchant', roleKey: 'class_type_economy', tier: 'B' },
];


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  return {
    title: `${t('nav_tierList')} | ${t('site_title')}`,
    description: t('page_tierList_description'),
    alternates: {
      canonical: `${SITE_URL}/tier-list`,
    },
    keywords: ['Ragnarok The New World tier list', 'Ragnarok class ranking', 'Ragnarok best class', 'ROW tier list', 'Ragnarok S tier'],
  };
}

export default async function TierListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const adKey = process.env.NEXT_PUBLIC_AD_BANNER_KEY;
  const articles = await getAllContent('tier-list' as ContentType, validLocale);

  const classTierGroups = ['S', 'A', 'B'].map(tier => ({
    tier,
    items: CLASS_TIERS.filter(c => c.tier === tier),
  }));

  const tierDescriptions: Record<string, { color: string; descKey: string }> = {
    S: { color: 'var(--color-tier-s)', descKey: 'tierList_tierS_desc' },
    A: { color: 'var(--color-tier-a)', descKey: 'tierList_tierA_desc' },
    B: { color: 'var(--color-tier-b)', descKey: 'tierList_tierB_desc' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Ragnarok: The New World Class Tier List',
            itemListElement: CLASS_TIERS.map((cls, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: translate(t, cls.nameKey) || cls.id,
            })),
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('nav_tierList')}</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">{t('tierList_intro')}</p>

      <div className="glow-line mb-10" />

      {/* Class Rankings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">{t('tierList_section_classRanking')}</h2>
        {classTierGroups.map(({ tier, items: tierClasses }) => {
          if (tierClasses.length === 0) return null;
          const info = tierDescriptions[tier];
          return (
            <div key={tier} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`badge badge-${tier.toLowerCase()} text-lg px-4 py-1`}>{tier} {t('tierList_tierLabel')}</span>
                <span className="text-sm text-[var(--color-text-muted)]">{translate(t, info.descKey)}</span>
              </div>
              <div className="overflow-x-auto mdx-table-wrap">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 px-4 text-sm font-semibold">{t('tierList_table_class')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">{t('tierList_table_role')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierClasses.map((cls) => (
                      <tr key={cls.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                        <td className="py-3 px-4 font-semibold">{translate(t, cls.nameKey) || cls.id}</td>
                        <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">{translate(t, cls.roleKey)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>

      <div className="glow-line mb-10" />

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          <div className="hidden md:block">
            <AdBanner type="banner-728x90" />          </div>
          <div className="block md:hidden">
            <AdBanner type="banner-468x60" />          </div>
        </div>
      )}

      {/* How We Rank */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">{t('tierList_howWeRank')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-3 text-[var(--color-accent)]">{t('tierList_rankingCriteria')}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><strong>{t('tierList_criteria_combat')}:</strong> {t('tierList_criteria_combat_desc')}</li>
              <li><strong>{t('tierList_criteria_versatility')}:</strong> {t('tierList_criteria_versatility_desc')}</li>
              <li><strong>{t('tierList_criteria_survivability')}:</strong> {t('tierList_criteria_survivability_desc')}</li>
              <li><strong>{t('tierList_criteria_build')}:</strong> {t('tierList_criteria_build_desc')}</li>
              <li><strong>{t('tierList_criteria_synergy')}:</strong> {t('tierList_criteria_synergy_desc')}</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="text-lg font-bold mb-3 text-[var(--color-accent)]">{t('tierList_communitySources')}</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>{t('tierList_community_1')}</li>
              <li>{t('tierList_community_2')}</li>
              <li>{t('tierList_community_3')}</li>
              <li>{t('tierList_community_4')} <a href={EXTERNAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">official Discord</a></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="glow-line mb-10" />

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">{t('section_faq')}</h2>
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <details key={i} className="group rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors">
                {t(`tierList_faq_${i}`)}
                <span className="text-[var(--color-accent)] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
                {t(`tierList_faq_${i}_answer`)}
              </div>
            </details>
          ))}
        </div>
      </section>

      <CategoryArticleList items={articles} title={t('category_articles_tier-list')} readMoreLabel={t('read_more')} emptyLabel={t('no_articles_yet')} />

      {adKey && (
        <div className="flex justify-center py-6 mt-6">
          <AdBanner type="native-banner" />
        </div>
      )}

      <div className="mt-8">
        <Link href={'/'} className="btn-secondary">&larr; {t('nav_home')}</Link>
      </div>
    </div>
  );
}
