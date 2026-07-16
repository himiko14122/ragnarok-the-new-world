import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.ragnarok-the-new-world.wiki';
const LOCALES = ['en', 'zh-TW', 'th', 'id'];
const CONTENT_TYPES = ['codes', 'tier-list', 'guides', 'classes', 'mvp-hunting', 'refining', 'zeny-farming', 'pvp', 'dungeons', 'mounts'];
const NAV_PAGES = [
  { path: '/', priority: 1, changefreq: 'daily' },
  { path: '/codes', priority: 0.9, changefreq: 'daily' },
  { path: '/tier-list', priority: 0.9, changefreq: 'weekly' },
  { path: '/guides', priority: 0.8, changefreq: 'weekly' },
  { path: '/classes', priority: 0.9, changefreq: 'weekly' },
  { path: '/mvp-hunting', priority: 0.8, changefreq: 'weekly' },
  { path: '/refining', priority: 0.8, changefreq: 'weekly' },
  { path: '/zeny-farming', priority: 0.8, changefreq: 'weekly' },
  { path: '/pvp', priority: 0.8, changefreq: 'weekly' },
  { path: '/dungeons', priority: 0.7, changefreq: 'weekly' },
  { path: '/mounts', priority: 0.7, changefreq: 'monthly' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { path: '/terms-of-service', priority: 0.4, changefreq: 'yearly' },
];

function localizedPath(locale, p) {
  if (locale === 'en') {
    return p === '/' ? '/' : p;
  }
  return p === '/' ? `/${locale}` : `/${locale}${p}`;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const manifestPath = path.join(process.cwd(), 'src', 'lib', 'content-manifest.json');
let contentPaths = [];
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  contentPaths = manifest.contentPaths || [];
}

const now = new Date().toISOString().split('T')[0];
const urls = [];

for (const page of NAV_PAGES) {
  for (const locale of LOCALES) {
    const lp = localizedPath(locale, page.path);
    const alternates = LOCALES.filter((l) => l !== locale).map((l) => {
      const alp = localizedPath(l, page.path);
      return `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${alp}" />`;
    }).join('\n');
    urls.push(`  <url>
    <loc>${SITE_URL}${lp}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${alternates}
  </url>`);
  }
}

for (const item of contentPaths) {
  const contentPath = `/${item.contentType}/${item.slug}`;
  const lp = localizedPath(item.locale, contentPath);
  const alternates = LOCALES.filter((l) => l !== item.locale).map((l) => {
    const alp = localizedPath(l, contentPath);
    return `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${alp}" />`;
  }).join('\n');
  urls.push(`  <url>
    <loc>${SITE_URL}${lp}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${alternates}
  </url>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, xml);
console.log(`Sitemap generated: ${urls.length} URLs`);
