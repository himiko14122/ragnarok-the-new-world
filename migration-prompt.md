# Next.js → Cloudflare Pages 静态导出改造提示词

将一个 Next.js 15 (App Router + next-intl + MDX) 项目从 Vercel/SSR 迁移到 Cloudflare Pages 纯静态部署。请严格按以下步骤逐一执行，每步完成后再进行下一步。

## 背景

- 目标：`output: 'export'` 纯静态导出 + Cloudflare Pages 托管
- Cloudflare Pages 免费版对纯静态文件无体积限制
- `output: 'export'` 不支持：API Routes、Middleware、ISR、`unstable_cache`/`revalidateTag`、动态 OG 图片、动态 robots/sitemap
- 英语 URL 不显示 `/en/` 前缀（如 `/guides/xxx` 而非 `/en/guides/xxx`），其他语言保留前缀
- **关键陷阱**：next-intl 的 `localePrefix` 配置 + Cloudflare Pages 路由映射、`trailingSlash` 配置、MDX 内部链接、广告防劫持——这些问题会依次导致 404 或异常，必须全部处理

## 步骤

### 1. 删除不兼容功能

- 删除 `src/middleware.ts`
- 删除 `src/app/api/` 目录下所有路由
- 删除 `src/app/robots.ts` 和 `src/app/sitemap.ts`（如果存在）
- 删除任何使用 `ImageResponse` 的动态 OG 图片生成
- 检查并移除代码中所有 `unstable_cache`、`revalidateTag`、`revalidatePath` 调用

### 2. 修改 next.config

```js
const nextConfig = {
  output: 'export',
  trailingSlash: true,   // 必须加！否则 Cloudflare Pages 找不到子路径的 index.html
  images: { unoptimized: true },
};
```

**为什么需要 `trailingSlash: true`**：Next.js 默认生成扁平文件（`de/guides.html`），而 Cloudflare Pages 访问 `/de/guides` 时查找 `de/guides/index.html`，找不到就 404。加 `trailingSlash: true` 后 Next.js 生成目录结构（`de/guides/index.html`），Cloudflare Pages 能正确匹配。

### 3. 配置 localePrefix: 'as-needed' + Cloudflare Pages Function rewrite

修改 `src/i18n/routing.ts`：

```ts
export const routing = defineRouting({
  locales: ['en', 'de', 'uk', 'ja'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
```

**核心问题**：`localePrefix: 'as-needed'` 让英语 URL 无前缀（`/guides/xxx`），但静态导出文件仍在 `out/en/guides/xxx/index.html`。Cloudflare Pages 访问 `/guides/xxx` 找不到 `out/guides/xxx/index.html`，会 404。

**解决方案**：创建 Cloudflare Pages Function 做 **内部 rewrite**（不是 redirect），将无前缀路径映射到 `/en/` 目录：

创建 `functions/[[path]].js`（必须用 `.js` 不用 `.ts`，Next.js 构建会类型检查 `.ts` 文件）：

```js
const LOCALES = ['de', 'uk', 'ja'];

function hasLocalePrefix(pathname) {
  for (const loc of LOCALES) {
    if (pathname === '/' + loc || pathname.startsWith('/' + loc + '/')) return true;
  }
  return false;
}

function isEnPrefixed(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/');
}

function isStaticAsset(pathname) {
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/images/') || pathname.startsWith('/ads/')) return true;
  if (pathname.startsWith('/favicon') || pathname.startsWith('/4a8dd9b1bef346e8268e1e510d12ca61')) return true;
  return /\.(js|css|json|xml|txt|webp|png|jpg|jpeg|svg|ico|woff2?|ttf|map)$/i.test(pathname);
}

export function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (hasLocalePrefix(pathname) || isEnPrefixed(pathname) || isStaticAsset(pathname)) {
    return context.env.ASSETS.fetch(context.request);
  }

  const enPath = pathname === '/' ? '/en/' : '/en' + pathname;
  const enUrl = new URL(enPath, url.origin);

  return context.env.ASSETS.fetch(new Request(enUrl, context.request))
    .then((response) => {
      if (response.status === 404) {
        const enPathNoSlash = pathname.endsWith('/') ? '/en' + pathname.slice(0, -1) : enPath;
        const enUrl2 = new URL(enPathNoSlash, url.origin);
        return context.env.ASSETS.fetch(new Request(enUrl2, context.request));
      }
      return response;
    })
    .then((response) => {
      if (response.status === 404) {
        return new Response('Not Found', { status: 404 });
      }
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=3600');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    });
}
```

**注意**：Function 内部必须自己排除静态资源路径（`isStaticAsset`），因为 `_routes.json` 可能不生效或配置不完整。这是双重保险。

### 4. 创建 public/_routes.json

放在 `public/` 目录，构建后自动到 `out/_routes.json`，告诉 Cloudflare Pages 哪些路径不经过 Function：

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_next/*",
    "/ads/*",
    "/images/*",
    "/favicon*",
    "/*.js",
    "/*.css",
    "/*.json",
    "/*.xml",
    "/*.txt",
    "/*.webp",
    "/*.png",
    "/*.jpg",
    "/*.svg",
    "/*.ico",
    "/*.woff2",
    "/*.woff",
    "/*.ttf",
    "/*.map",
    "/api/*"
  ]
}
```

**重要**：Cloudflare Pages `_routes.json` 中 `/*` 能匹配任意深度子路径（如 `/images/guides/foo.jpg` 匹配 `/images/*`）。不允许重叠规则（如 `/_next/*` 和 `/_next/**/*` 不能同时存在）。

### 5. 修改 localizedPath 函数

修改 `src/config/site.ts`：

```ts
import { routing, type Locale } from '@/i18n/routing';

export function localizedPath(locale: Locale | string, path = '/') {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized === '/' ? '/' : normalized;  // en 不加前缀
  }
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}
```

所有 SEO 元数据（`getAlternates`、`breadcrumbJsonLd`、`articleJsonLd`、`openGraph.url`）都通过 `localizedPath` 生成，改一处全部生效。

### 6. 所有 [locale] 动态路由添加 generateStaticParams

每个使用 `[locale]` 参数的页面必须导出：

```tsx
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

对于 `[...slug]/page.tsx` 这种 catch-all 路由，必须穷举所有可能路径：

```tsx
export async function generateStaticParams() {
  const staticParams = routing.locales.flatMap((locale) =>
    NAV_CONFIG.filter(item => item.path !== '/').map(item => ({
      locale,
      slug: item.path.slice(1).split('/'),
    }))
  );
  const contentParams = getAllContentPaths(routing.defaultLocale).flatMap(item =>
    routing.locales.map(locale => ({
      locale,
      slug: [item.contentType, ...item.segments],
    }))
  );
  return [...staticParams, ...contentParams];
}
```

### 7. 移除运行时 fs 依赖 — 构建时生成 content-manifest.json

- 构建时用脚本（`scripts/generate-content-manifest.mjs`）扫描内容目录，生成 `src/lib/content-manifest.json`
- manifest 包含：`contentPaths`（slug、title、locale、contentType、importPath、segments）和 `tocMap`（每个文章的 TOC 条目，id 和 text）
- **TOC id 生成必须使用 `github-slugger`**（与 `rehype-slug` 保持一致，保留 Unicode 字符），不能用 ASCII-only 正则，否则非英语文章的"本文目录"锚点跳转会失败
- 运行时代码从 manifest JSON 读取内容列表，不再使用 `fs.readdirSync`/`fs.readFileSync`
- dev 模式仍可用 fs，用 `process.env.NODE_ENV === 'development'` 判断
- `src/lib/content-manifest.json` 加入 `.gitignore`

**generate-content-manifest.mjs 中 TOC 提取的关键代码**：

```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { slug: githubSlug } = require('github-slugger');

function extractTocFromMdxSource(source) {
  return source
    .split('\n')
    .map((line) => line.match(/^##\s+(.+)$/))
    .filter((match) => Boolean(match))
    .map((match) => {
      const text = match[1].replace(/\*\*/g, '').replace(/\*/g, '');
      const id = githubSlug(text) || `h-${1}`;
      return { id, text };
    });
}
```

**错误示例**（会导致非英语 TOC 跳转失败）：

```js
// ❌ ASCII-only，会剔除所有 CJK/Cyrillic 字符
const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
```

### 8. 修复 MDX 内容中的内部链接

**问题**：MDX 文件中的 Markdown 链接如 `[指南](/guides/xxx)` 会被编译成普通 `<a href="/guides/xxx">`，不经过 next-intl 的 `Link` 组件，不会自动加 locale 前缀。

**解决方案**：在 `ArticleContent` 组件中，用 `useEffect` 在 hydration 后扫描并修复内部链接：

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';

export default function ArticleContent({ children }) {
  const articleRef = useRef<HTMLElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!articleRef.current) return;
    const anchors = articleRef.current.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
    if (locale === 'en') {
      anchors.forEach((a) => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('/en/')) {
          a.setAttribute('href', href.replace(/^\/en/, ''));
        }
      });
    } else {
      const localePrefix = `/${locale}/`;
      anchors.forEach((a) => {
        if (!a.getAttribute('href')?.startsWith(localePrefix) && !a.getAttribute('href')?.startsWith(`/${locale}`)) {
          const href = a.getAttribute('href')!;
          const trailing = href.endsWith('/') ? '' : '/';
          a.setAttribute('href', `/${locale}${href.startsWith('/') ? '' : '/'}${href}${trailing}`);
        }
      });
    }
  }, [locale]);

  return <article ref={articleRef}>{children}</article>;
}
```

### 9. 替代 API Routes — 创建 Pages Functions

在 `functions/` 目录创建 Cloudflare Pages Functions：

**必须用 `.js` 不用 `.ts`**——Next.js 构建会类型检查 `functions/` 下的 `.ts` 文件，找不到 `PagesFunction` 类型会报错。

```
functions/api/indexnow.js
```

```js
export async function onRequestPost(context) {
  const body = await context.request.json();
  // ... 业务逻辑
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 10. 替代 robots/sitemap — 构建时生成静态文件

- 创建 `public/robots.txt`（静态文件，直接放 public/）
- 创建 `scripts/generate-sitemap.mjs`，读取 content-manifest.json 生成 XML sitemap 输出到 `public/sitemap.xml`
- `public/sitemap.xml` 加入 `.gitignore`（构建时生成）
- sitemap 中的 en URL 不带 `/en/` 前缀，其他语言带前缀

sitemap 脚本中的 `localizedPath` 函数：

```js
function localizedPath(locale, p) {
  if (locale === 'en') {
    return p === '/' ? '/' : p;
  }
  return p === '/' ? `/${locale}` : `/${locale}${p}`;
}
```

### 11. 广告系统防劫持

#### Banner 广告（固定尺寸）：iframe 隔离 + 重写 window.top

每个 banner 广告放在独立 HTML 文件（`public/ads/banner-*.html`），通过 iframe 加载。HTML 内注入防劫持脚本：

```html
<script>
Object.defineProperty(window,'top',{get:function(){return window.self}});
Object.defineProperty(window,'parent',{get:function(){return window.self}});
Object.defineProperty(window,'frameElement',{get:function(){return null}});
</script>
```

广告配置（`src/config/ads.ts`）：

```ts
export interface BannerSlot {
  type: BannerType;
  width: number;
  height: number;
  src: string;  // 指向 /ads/banner-xxx.html
}
```

#### Native 广告（动态高度）：直接嵌入 + 防劫持脚本

Native 广告不用 iframe（高度不可控），直接在主页面加载广告脚本。防劫持方案：在加载广告脚本前，动态注入防劫持脚本重写 `window.top`/`window.parent`/`window.frameElement`：

```tsx
const HIJACK_GUARD = `
Object.defineProperty(window,'top',{get:function(){return window.self},configurable:true});
Object.defineProperty(window,'parent',{get:function(){return window.self},configurable:true});
Object.defineProperty(window,'frameElement',{get:function(){return null},configurable:true});
`.replace(/\n/g, '');

// useEffect 中：
const guardScript = document.createElement('script');
guardScript.textContent = HIJACK_GUARD;
container.appendChild(guardScript);

const div = document.createElement('div');
div.id = slot.containerId;
container.appendChild(div);

const adScript = document.createElement('script');
adScript.src = slot.scriptUrl;
adScript.async = true;
container.appendChild(adScript);
```

Native 广告配置：

```ts
export interface NativeSlot {
  type: 'native-banner';
  containerId: string;
  scriptUrl: string;
}
```

### 12. 创建 public/_headers

```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

### 13. 构建后镜像 en 目录到根目录（可选但推荐）

创建 `scripts/mirror-en-to-root.mjs`，将 `out/en/` 的内容复制到 `out/` 根目录。这样即使用户直接访问 `/guides/xxx/` 而没有经过 Function rewrite，Cloudflare Pages 的 ASSETS 也能找到对应文件。

```js
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'out');
const EN_DIR = path.join(OUT_DIR, 'en');

if (!fs.existsSync(EN_DIR)) {
  console.log('No en/ directory found, skipping mirror.');
  process.exit(0);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  }
}

copyRecursiveSync(EN_DIR, OUT_DIR);
```

**注意**：此脚本需要在 `next build` 之后运行。如果使用此脚本，build 命令需调整为：

```json
"build": "node scripts/generate-content-manifest.mjs && node scripts/generate-sitemap.mjs && next build && node scripts/mirror-en-to-root.mjs"
```

### 14. 清理 Workers 方案残留（如果有）

- 删除 `open-next.config.ts`、`wrangler.jsonc`
- 从 `package.json` 移除 `@opennextjs/cloudflare`、`wrangler` 依赖
- 简化 build 脚本

### 15. 最终 package.json build 脚本

```json
{
  "scripts": {
    "build": "node scripts/generate-content-manifest.mjs && node scripts/generate-sitemap.mjs && next build",
    "cf-build": "corepack enable && pnpm install --frozen-lockfile && pnpm run build"
  }
}
```

`cf-build` 是 Cloudflare Pages Dashboard 配置的 build command，先启用 corepack 确保 pnpm 可用，再安装依赖并构建。

### 16. Cloudflare Pages Dashboard 设置

- Framework preset: `Next.js (Static HTML Export)` 或 None
- Build command: `pnpm run cf-build`
- Build output directory: `out`
- Root directory: `/`
- Node.js version: 18 或 20

## 已知陷阱

| 陷阱 | 现象 | 原因 | 修复 |
|------|------|------|------|
| 缺少 `trailingSlash: true` | 子路径全部 404 | Next.js 生成扁平文件 `de/guides.html`，Cloudflare Pages 查找 `de/guides/index.html` 找不到 | `next.config` 加 `trailingSlash: true` |
| 无 Pages Function rewrite | 英语无前缀 URL 404 | 静态文件在 `out/en/`，但 URL 是 `/guides/xxx` | `functions/[[path]].js` 内部 rewrite 到 `/en/` 目录 |
| `_redirects` 与 Function 冲突 | ERR_TOO_MANY_REDIRECTS | `_redirects` 把 `/en/*` 301 到 `/:splat`，Function 又 rewrite 回 `/en/` | 不要在 `_redirects` 中做 `/en/*` → `/:splat` 301 |
| `_routes.json` 重叠规则 | 部署失败 Error 8000057 | `/_next/*` 和 `/_next/**/*` 同时存在 | 用 `/*` 即可匹配子路径，不要用 `/**/*` |
| Function 未排除静态资源 | 图片/广告 not found | Function 把 `/images/xxx` rewrite 到 `/en/images/xxx`（不存在） | Function 内加 `isStaticAsset()` 检查 + `_routes.json` exclude |
| `_routes.json` 放在 `functions/` | 排除规则不生效 | Cloudflare Pages 从构建输出根目录读 `_routes.json` | 放在 `public/` 目录，构建后到 `out/_routes.json` |
| MDX 内部链接无 locale 前缀 | 非 en 页面中文章内链 404 | Markdown 链接编译成普通 `<a>`，不经过 next-intl `Link` | `ArticleContent` 中用 `useEffect` 修复 |
| `functions/` 下用 `.ts` | 构建类型错误 | Next.js 构建会类型检查 `functions/` 下的 TS 文件 | 改为 `.js` |
| 广告脚本劫持页面跳转 | 用户被重定向到广告页面 | 同源 iframe 内的 JS 可通过 `window.top.location` 跳转 | Banner: iframe HTML 中重写 window.top/parent；Native: 加载前注入防劫持脚本 |
| `pnpm-workspace.yaml` 缺少 packages | pnpm v10 构建报错 | pnpm v10 要求 workspace 配置有 packages 字段 | 添加 `packages: []` |
| TOC id 使用 ASCII-only 正则 | 非英语文章"In This Guide"锚点跳转失败 | `rehype-slug` 用 `github-slugger`（保留 Unicode）生成 DOM id，但 manifest 用 ASCII-only 正则生成 TOC id，两者不匹配 | `generate-content-manifest.mjs` 中也使用 `github-slugger` |
| React 纯度检查报错 | `Math.random` 在渲染中调用导致构建失败 | React 19 严格检查组件纯度，不允许在渲染期间调用 `Math.random()` 等不纯函数 | 用基于 slug 的确定性哈希扰动替代 `Math.random()` |

## 验证清单

- [ ] `pnpm build` 成功，无报错
- [ ] `out/en/index.html` 存在（首页）
- [ ] `out/en/guides/index.html` 存在（列表页用目录结构）
- [ ] `out/en/guides/xxx/index.html` 存在（详情页用目录结构）
- [ ] `out/de/`、`out/uk/`、`out/ja/` 目录都有完整内容
- [ ] `out/robots.txt` 存在
- [ ] `out/sitemap.xml` 存在，en URL 无 `/en/` 前缀，其他语言有前缀
- [ ] `out/_routes.json` 存在且规则无重叠
- [ ] `out/_headers` 存在且缓存策略正确
- [ ] `functions/` 下的 Pages Functions 为 `.js` 文件
- [ ] 部署后 `/` 返回英文首页内容（URL 不变，内部 rewrite）
- [ ] 部署后 `/guides/xxx/` 返回英文内容（URL 无 `/en/`）
- [ ] 部署后 `/en/guides/xxx/` 返回英文内容（Function 直接从 ASSETS 返回）
- [ ] 部署后 `/de/guides/xxx/` 返回德语内容
- [ ] 部署后 de 页面中的内部链接（包括 MDX 正文链接）都带 `/de/` 前缀
- [ ] 部署后非英语文章的"In This Guide"目录锚点跳转正常
- [ ] 部署后广告正常展示，不被劫持
- [ ] 部署后图片正常加载（不经过 Function rewrite）
