import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getBaseMetadata, websiteJsonLd, itemListJsonLd } from '@/lib/seo';
import { promoCodes, gameClasses, gameModes, mvpBosses, refineLevels, tierColor, classTypeColor } from '@/data/game-data';
import { getAllContent, getAllContentByDate } from '@/lib/content';
import { translate } from '@/lib/i18n';
import { EXTERNAL_LINKS } from '@/config/site';
import { HOME_CONFIG } from '@/config/home';
import AdBanner from '@/components/AdBanner';
import AutoScrollCarousel from '@/components/AutoScrollCarousel';
import YouTubePlayer from '@/components/YouTubePlayer';
import { ArrowRight, ChevronRight, Gamepad2, Shield } from 'lucide-react';


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return getBaseMetadata('/', locale, t('page_home'), t('page_home_description'));
}

function resolveDynamic(val: string, ctx: Record<string, string>): string {
  return val.startsWith('__') ? (ctx[val] ?? val) : val;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as Locale) ? (locale as Locale) : routing.defaultLocale;
  setRequestLocale(validLocale);
  const t = await getTranslations();
  const activeCodes = promoCodes.filter((code) => code.status === 'active');
  const allGuides = await getAllContent('guides', validLocale);
  const latestContent = await getAllContentByDate(validLocale);
  const firstGuidePath = allGuides.length > 0 ? allGuides[0].path : '/guides';

  const dynCtx: Record<string, string> = {
    '__firstGuide': firstGuidePath,
    '__guideCount': String(allGuides.length),
    '__classCount': String(gameClasses.length),
    '__activeCodeCount': String(activeCodes.length),
    '__gameModeCount': '5',
  };

  const heroBadgeKeys = HOME_CONFIG.hero.badgeKeys;
  const faqKeys = HOME_CONFIG.faq.keys;
  const infoItems = HOME_CONFIG.gameOverview.infoItems;
  const moduleCards = HOME_CONFIG.moduleCards.map((card) => ({
    ...card,
    label: t(card.labelKey),
    title: t(card.titleKey),
    desc: t(card.descKey),
    href: resolveDynamic(card.href, dynCtx),
    stats: card.stats.map((s) => ({ val: resolveDynamic(s.val, dynCtx), label: t(s.labelKey) })),
  }));

  const gameFeatures = HOME_CONFIG.gameFeatures.map((feat) => ({
    ...feat,
    title: t(feat.titleKey),
    desc: t(feat.descKey),
  }));

  const startHereSteps = HOME_CONFIG.startHereSteps.map((step) => ({
    title: t(step.titleKey),
    desc: t(step.descKey),
    href: resolveDynamic(step.href, dynCtx),
  }));

  const adKey = process.env.NEXT_PUBLIC_AD_BANNER_KEY;

  return (
    <div>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={itemListJsonLd(
        gameClasses.map((cls) => ({ name: translate(t, cls.nameKey) || cls.id, path: '/classes' })),
        validLocale
      )} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-16 md:py-24 full-width-bg">
        <div className="absolute inset-0 opacity-40 hero-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/70 via-transparent to-[var(--color-bg-primary)]/40" />
        <div className="absolute top-1/4 left-[20%] -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent)]/8 rounded-full blur-[120px] pointer-events-none hero-glow" />
        <div className="absolute bottom-1/3 right-[15%] w-[300px] h-[300px] bg-[var(--color-accent-secondary)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-widest">{t('home_hero_tagline')}</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] gradient-text leading-[1.1] tracking-tight">{t('site_title')}</h1>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed">{t('home_hero_description')}</p>
              <div className="flex flex-wrap gap-3">
                {HOME_CONFIG.hero.ctas.map((cta) => (
                  <Link key={cta.labelKey} href={resolveDynamic(cta.href, dynCtx)} className={cta.style === 'primary' ? 'btn-primary btn-hero-primary' : 'btn-secondary btn-hero-secondary'}>
                    {cta.style === 'primary' && <ArrowRight className="w-4 h-4 mr-0.5" />}
                    {t(cta.labelKey)}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadgeKeys.slice(0, 2).map((key) => (
                  <span key={key} className="hero-badge-primary">{t(key)}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadgeKeys.slice(2, 8).map((key) => (
                  <span key={key} className="hero-badge-secondary">{t(key)}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {heroBadgeKeys.slice(8).map((key) => (
                  <span key={key} className="hero-badge-tertiary">{t(key)}</span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--color-accent)]/20 via-transparent to-[var(--color-accent-secondary)]/10 rounded-2xl opacity-50 blur-sm group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <YouTubePlayer videoId={HOME_CONFIG.hero.videoId} />
              </div>
              <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">{t('home_hero_trailer')}</p>
            </div>
          </div>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdBanner type="native-banner" />
        </div>
      )}

      <div className="glow-line full-width-bg" />

      {/* ===== LATEST UPDATES ===== */}
      {latestContent.length > 0 && (
        <section className="py-12">
          <AutoScrollCarousel
            items={latestContent.slice(0, 10).map((item, i) => ({
              slug: item.slug,
              title: item.metadata.title || item.slug,
              description: item.metadata.description,
              image: item.metadata.image,
              path: item.path,
              isNew: i < 5,
            }))}
            readMoreText={t('read_more')}
            title={t('latest_updates')}
            priorityCount={3}
          />
        </section>
      )}

      {/* ===== FEATURED GUIDES ===== */}
      {allGuides.length > 0 && (
        <section className="py-12">
          <AutoScrollCarousel
            items={allGuides.slice(0, 20).map((guide) => ({
              slug: guide.slug,
              title: guide.metadata.title || guide.slug,
              description: guide.metadata.description,
              image: guide.metadata.image,
              path: guide.path,
            }))}
            readMoreText={t('read_more')}
            title={t('featured_guides')}
            autoScroll={false}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center">
            <Link href="/guides" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">{t('explore_all_guides')} →</Link>
          </div>
        </section>
      )}

      {/* ===== START HERE ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="section-label">{t('home_start_label')}</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_start_title')}</h2>
        <p className="text-[var(--color-text-secondary)] mb-10 max-w-2xl leading-relaxed text-[0.9375rem]">{t('home_start_subtitle')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {startHereSteps.map((step, idx) => (
            <Link key={idx} href={step.href} className="module-card group block relative overflow-hidden">
              <div className="absolute top-3 right-3 text-4xl font-extrabold font-[var(--font-heading)] text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] opacity-30 group-hover:opacity-60 transition-opacity">{String(idx + 1).padStart(2, '0')}</div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white font-bold text-sm mb-4">{idx + 1}</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{step.desc}</p>
              <span className="text-xs text-[var(--color-accent)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {t('read_more')} <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== MODULE CARDS ===== */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] full-width-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="section-label">{t('home_modules_label')}</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_modules_title')}</h2>
          <p className="text-[var(--color-text-secondary)] mb-10 max-w-2xl leading-relaxed text-[0.9375rem]">{t('home_modules_subtitle')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {moduleCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.key} href={card.href} className="group block rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] transition-all duration-300 backdrop-blur-sm card-accent-bar">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent-secondary)]/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{card.label}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">{card.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">{card.desc}</p>
                  <div className="flex gap-4 mb-4">
                    {card.stats.map((stat, i) => (
                      <div key={i} className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold font-[var(--font-heading)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)]">{stat.val}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
                    {t(card.ctaKey ?? 'home_module_default_cta')}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GAME OVERVIEW ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="section-label">{t('home_about_label')}</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_about_title')}</h2>
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-3xl leading-relaxed text-[0.9375rem]">{t('home_about_p1')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {gameFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm hover:border-[var(--color-accent)]/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/15 to-[var(--color-accent-secondary)]/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-sm font-bold mb-2">{feat.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{t('home_about_p2')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={resolveDynamic(HOME_CONFIG.gameOverview.cta.guideHref, dynCtx)} className="btn-primary">
                {t(HOME_CONFIG.gameOverview.cta.guideLabelKey)}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <a href={EXTERNAL_LINKS[HOME_CONFIG.gameOverview.cta.externalLinkKey as keyof typeof EXTERNAL_LINKS]} target="_blank" rel="noopener noreferrer" className="btn-secondary">{t(HOME_CONFIG.gameOverview.cta.externalLabelKey)}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {infoItems.map((item) => (
              <div key={item} className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <p className="text-xs text-[var(--color-text-muted)]">{t(`home_info_${item}`)}</p>
                <p className="font-bold text-sm text-[var(--color-text-primary)]">{t(`home_info_${item}_value`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          <AdBanner type="banner-728x90" />        </div>
      )}

      <div className="glow-line full-width-bg" />

      {/* ===== CLASS TIER TABLE ===== */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] full-width-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-label">{t('home_module_tierlist')}</div>
              <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_module_tierlist_title')}</h2>
            </div>
            <Link href="/tier-list" className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[2rem_1fr_5rem_5rem] sm:grid-cols-[2.5rem_1fr_6rem_6rem] gap-0 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] px-4 py-3">
              <span></span><span>{t('tierList_table_class')}</span><span>{t('tierList_table_role')}</span><span>{t('tierList_table_tier')}</span>
            </div>
            {gameClasses.map((cls, idx) => {
              const typeColor = classTypeColor(cls.type);
              const tc = tierColor(cls.tier);
              return (
                <Link key={cls.id} href="/classes" className="grid grid-cols-[2rem_1fr_5rem_5rem] sm:grid-cols-[2.5rem_1fr_6rem_6rem] items-center gap-0 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-[var(--color-accent)]/5 transition-colors group">
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">{idx + 1}</span>
                  <span className="font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">{translate(t, cls.nameKey) || cls.id}</span>
                  <span><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border" style={{ color: typeColor, borderColor: typeColor, background: `${typeColor}15` }}>{translate(t, cls.typeKey) || cls.type}</span></span>
                  <span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: tc, background: `${tc}15` }}>{cls.tier}</span></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GAME MODES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="section-label">{t('home_module_modes')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_module_modes_title')}</h2>
          </div>
          <Link href="/guides" className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('home_module_default_cta')} <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {gameModes.map((mode) => (
            <Link key={mode.id} href="/guides" className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 backdrop-blur-sm hover:border-[var(--color-accent)]/30 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent-secondary)]/20 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-[var(--color-accent)] transition-colors">{translate(t, mode.nameKey) || mode.id}</h3>
                  <span className="text-xs text-[var(--color-text-muted)]">{translate(t, mode.typeKey) || mode.type}</span>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-3">{translate(t, mode.descKey)}</p>
              {mode.rewards.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mode.rewards.map((reward, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">{translate(t, reward) || reward}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase"></th>
                {HOME_CONFIG.gameModesComparison.columnModes.map((modeId, mi) => {
                  const mode = gameModes.find((m) => m.id === modeId);
                  return (
                    <th key={modeId} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: mi === 0 ? 'var(--color-accent)' : 'var(--color-accent-secondary)' }}>
                      {mode ? (translate(t, mode.nameKey) || mode.id) : modeId}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOME_CONFIG.gameModesComparison.rows.map((row) => (
                <tr key={row.labelKey} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs">{t(row.labelKey)}</td>
                  {HOME_CONFIG.gameModesComparison.columnModes.map((modeId) => (
                    <td key={modeId} className="px-4 py-3 text-xs">{t(row.values[modeId] || '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          <div className="hidden md:block">
            <AdBanner type="banner-728x90" />          </div>
          <div className="block md:hidden">
            <AdBanner type="banner-468x60" />          </div>
        </div>
      )}

      <div className="glow-line full-width-bg" />

      {/* ===== MVP SPAWN TABLE ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="section-label">{t('home_module_mvp')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_mvp_title')}</h2>
          </div>
          <Link href="/mvp-hunting" className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-3xl leading-relaxed text-[0.9375rem]">{t('home_mvp_subtitle')}</p>
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
          <div className="grid grid-cols-[2rem_1fr_4rem_5rem_5rem_4rem_4rem] sm:grid-cols-[2.5rem_1fr_5rem_6rem_6rem_5rem_5rem] gap-0 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] px-4 py-3">
            <span></span><span>{t('home_mvp_col_name')}</span><span>{t('home_mvp_col_level')}</span><span>{t('home_mvp_col_element')}</span><span>{t('home_mvp_col_spawn')}</span><span>{t('home_mvp_col_card')}</span><span>{t('home_mvp_col_mount')}</span>
          </div>
          {mvpBosses.map((boss, idx) => (
            <Link key={boss.id} href="/mvp-hunting" className="grid grid-cols-[2rem_1fr_4rem_5rem_5rem_4rem_4rem] sm:grid-cols-[2.5rem_1fr_5rem_6rem_6rem_5rem_5rem] items-center gap-0 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-[var(--color-accent)]/5 transition-colors group">
              <span className="text-xs font-mono text-[var(--color-text-muted)]">{idx + 1}</span>
              <span className="font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">{t(boss.nameKey)}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{boss.level}</span>
              <span className="text-xs">{t(boss.elementKey)}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{t(boss.spawnKey)}</span>
              <span>{boss.cardDrop ? <span className="badge-active badge text-[10px]">✓</span> : <span className="text-[var(--color-text-muted)] text-xs">—</span>}</span>
              <span>{boss.mountDrop ? <span className="badge-epic badge text-[10px]">✓</span> : <span className="text-[var(--color-text-muted)] text-xs">—</span>}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== ACTIVE CODES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="section-label">{t('home_codes_label')}</div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_codes_title')}</h2>
          </div>
          <Link href="/codes" className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('home_codes_viewAll')} <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {activeCodes.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-sm text-center">
            <p className="text-[var(--color-text-secondary)] mb-2">{t('home_codes_noActive')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{t('home_codes_justLaunched')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCodes.slice(0, 6).map((code) => (
              <Link key={code.id} href="/codes" className="block rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm hover:border-[var(--color-accent)]/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-lg font-bold text-[var(--color-accent)]">{code.code}</code>
                  <span className="badge-active badge text-[10px]">{t('common_active')}</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {code.rewards.map((reward) => `${reward.amount}x ${translate(t, reward.itemKey)}`).join(', ')}
                </p>
                {code.levelReq > 1 && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">{t('codes_levelReq')}: {code.levelReq}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== REFINE COST TABLE ===== */}
      <section className="bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] full-width-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-label">{t('home_module_refining')}</div>
              <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_refine_title')}</h2>
            </div>
            <Link href="/refining" className="text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1">{t('view_all')} <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-3xl leading-relaxed text-[0.9375rem]">{t('home_refine_subtitle')}</p>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[4rem_1fr_1fr_1fr] sm:grid-cols-[5rem_1fr_1fr_1fr] gap-0 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] px-4 py-3">
              <span>{t('home_refine_col_level')}</span><span>{t('home_refine_col_rate')}</span><span>{t('home_refine_col_cost')}</span><span>{t('home_refine_col_material')}</span>
            </div>
            {refineLevels.map((rl) => (
              <div key={rl.level} className="grid grid-cols-[4rem_1fr_1fr_1fr] sm:grid-cols-[5rem_1fr_1fr_1fr] items-center gap-0 px-4 py-3 border-b border-white/[0.04] last:border-b-0">
                <span className="text-sm font-bold text-[var(--color-accent)]">+{rl.level}</span>
                <span className="text-xs">{rl.successRate === '100%' ? <span className="badge-active badge text-[10px]">{rl.successRate}</span> : <span className="text-[var(--color-text-secondary)] text-xs">{rl.successRate}</span>}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{rl.zenyCost}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{t(rl.materialKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="section-label justify-center">{t('section_faq')}</div>
          <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] gradient-text">{t('home_faq_title')}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqKeys.map((key) => (
            <details key={key} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-sm group">
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between text-sm">
                {t(`faq_${key}`)}
                <span className="text-[var(--color-accent)] group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">{t(`faq_${key}_answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative overflow-hidden py-16 full-width-bg">
        <div className="absolute inset-0 opacity-20 hero-bg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-accent)]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)] gradient-text">{t('home_cta_title')}</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto leading-relaxed">{t('home_cta_description')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={resolveDynamic(HOME_CONFIG.bottomCta.guideHref, dynCtx)} className="btn-primary">
              {t(HOME_CONFIG.bottomCta.guideLabelKey)}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <a href={EXTERNAL_LINKS[HOME_CONFIG.bottomCta.externalLinkKey as keyof typeof EXTERNAL_LINKS]} target="_blank" rel="noopener noreferrer" className="btn-secondary">{t(HOME_CONFIG.bottomCta.externalLabelKey)}</a>
          </div>
        </div>
      </section>

      {adKey && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex justify-center">
          <div className="hidden md:block">
            <AdBanner type="banner-728x90" />          </div>
          <div className="block md:hidden">
            <AdBanner type="banner-468x60" />          </div>
        </div>
      )}
    </div>
  );
}
