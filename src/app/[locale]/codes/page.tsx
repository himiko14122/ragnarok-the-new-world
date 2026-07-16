import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { translate } from '@/lib/i18n';
import { SITE_URL } from '@/config/site';
import AdBanner from '@/components/AdBanner';
import CategoryArticleList from '@/components/CategoryArticleList';
import { getAllContent } from '@/lib/content';
import type { ContentType } from '@/config/navigation';
import type { Metadata } from 'next';

const CODES_DATA: Array<{ id: string; code: string; status: string; levelReq: number; rewards: Array<{ amount: number; item: string; itemKey: string }> }> = [
  { id: 'row666', code: 'ROW666', status: 'active', levelReq: 1, rewards: [{ amount: 1, item: 'Kafra Blind Box', itemKey: 'reward_kafra_blindbox' }, { amount: 20000, item: 'Adventure Coin', itemKey: 'reward_adventure_coin' }, { amount: 1, item: 'Common Hair Dye', itemKey: 'reward_hair_dye' }] },
  { id: 'row777', code: 'ROW777', status: 'active', levelReq: 1, rewards: [{ amount: 1, item: 'Kafra Blind Box', itemKey: 'reward_kafra_blindbox' }, { amount: 10000, item: 'Adventure Coin', itemKey: 'reward_adventure_coin' }, { amount: 1, item: 'Cosmetic Items', itemKey: 'reward_cosmetic' }] },
  { id: 'babymonster', code: 'BABYMONSTER', status: 'active', levelReq: 1, rewards: [{ amount: 50000, item: 'Zeny', itemKey: 'reward_zeny' }, { amount: 1, item: 'Consumables', itemKey: 'reward_consumables' }] },
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
    title: `${t('nav_codes')} | ${t('site_title')}`,
    description: t('page_codes_description'),
    alternates: {
      canonical: `${SITE_URL}/codes`,
    },
    keywords: ['Ragnarok The New World codes', 'Ragnarok The New World redeem codes', 'ROW codes', 'Ragnarok promo codes', 'Ragnarok free rewards', 'ROW666 code'],
  };
}

export default async function CodesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const adKey = process.env.NEXT_PUBLIC_AD_BANNER_KEY;
  const articles = await getAllContent('codes' as ContentType, validLocale);

  const activeCodes = CODES_DATA.filter(c => c.status === 'active');
  const expiredCodes = CODES_DATA.filter(c => c.status === 'expired');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Redeem Ragnarok: The New World Codes',
            description: 'Step-by-step guide to redeem codes in Ragnarok: The New World.',
            step: [
              { '@type': 'HowToStep', position: 1, name: 'Open Game', text: 'Open Ragnarok: The New World and go to the login screen' },
              { '@type': 'HowToStep', position: 2, name: 'Tap Poring', text: 'Tap the Poring icon in the upper-left corner' },
              { '@type': 'HowToStep', position: 3, name: 'Enter Details', text: 'Enter your server, character name, and the code' },
              { '@type': 'HowToStep', position: 4, name: 'Captcha', text: 'Complete the captcha verification' },
              { '@type': 'HowToStep', position: 5, name: 'Redeem', text: 'Tap Redeem and check your inventory for rewards!' },
            ],
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('nav_codes')}</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">{t('codes_intro')}</p>

      <div className="glow-line mb-10" />

      {/* Active Codes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)] text-[var(--color-tier-s)]">{t('codes_activeTitle')}</h2>
        {activeCodes.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-sm text-center">
            <p className="text-[var(--color-text-secondary)] mb-2 text-lg">{t('codes_noActiveTitle')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{t('codes_noActiveDesc')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCodes.map((code) => (
              <div key={code.id} className="card group hover:border-[var(--color-accent)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <code className="px-3 py-1.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-accent)] font-mono text-sm font-bold border border-[var(--color-border)]">
                    {code.code}
                  </code>
                  {code.levelReq > 1 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Lv.{code.levelReq}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {code.rewards.map((r, i) => (
                    <p key={i} className="text-sm text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-accent)] font-semibold">{r.amount}x</span> {translate(t, r.itemKey) || r.item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          <div className="hidden md:block">
            <AdBanner type="banner-728x90" />          </div>
          <div className="block md:hidden">
            <AdBanner type="banner-468x60" />          </div>
        </div>
      )}

      {/* Expired Codes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)] text-[var(--color-text-muted)]">{t('codes_expiredTitle')}</h2>
        {expiredCodes.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">{t('codes_noExpired')}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {expiredCodes.map((code) => (
              <div key={code.id} className="card">
                <code className="px-3 py-1.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-mono text-sm line-through border border-[var(--color-border)]">
                  {code.code}
                </code>
                <div className="mt-2 space-y-1">
                  {code.rewards.map((r, i) => (
                    <p key={i} className="text-xs text-[var(--color-text-muted)]">
                      {r.amount}x {translate(t, r.itemKey) || r.item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <CategoryArticleList items={articles} title={t('category_articles_codes')} readMoreLabel={t('read_more')} emptyLabel={t('no_articles_yet')} />

      {adKey && (
        <div className="flex justify-center py-6">
          <AdBanner type="native-banner" />
        </div>
      )}

      {/* How to Redeem */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 font-[var(--font-heading)]">{t('codes_howTo')}</h2>
        <div className="card">
          <ol className="space-y-3">
            {[
              t('codes_step_1'),
              t('codes_step_2'),
              t('codes_step_3'),
              t('codes_step_4'),
              t('codes_step_5'),
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-sm text-[var(--color-text-secondary)]">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-[var(--color-text-muted)] italic">
            {t('codes_note')}
          </p>
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
                {t(`codes_faq_${i}`)}
                <span className="text-[var(--color-accent)] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
                {t(`codes_faq_${i}_answer`)}
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href={'/'} className="btn-secondary">&larr; {t('nav_home')}</Link>
      </div>
    </div>
  );
}
