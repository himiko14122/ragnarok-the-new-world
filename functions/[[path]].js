const LOCALES = []; // en is default, no other locales yet

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

function fetchWithIndexFallback(context, pathname) {
  const url = new URL(context.request.url);
  // Try the path as-is first
  return context.env.ASSETS.fetch(context.request)
    .then((response) => {
      if (response.status === 404) {
        // Try adding /index.html
        const indexPath = pathname.endsWith('/') ? pathname + 'index.html' : pathname + '/index.html';
        const indexUrl = new URL(indexPath, url.origin);
        return context.env.ASSETS.fetch(new Request(indexUrl, context.request));
      }
      return response;
    });
}

export function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (hasLocalePrefix(pathname) || isEnPrefixed(pathname) || isStaticAsset(pathname)) {
    return context.env.ASSETS.fetch(context.request);
  }

  // Since en is the only locale, serve directly from /en/ directory
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
