const INDEXNOW_KEY = '4a8dd9b1bef346e8268e1e510d12ca61';
const HOST = 'www.ragnarok-the-new-world.wiki';
const SEARCH_ENGINES = [
  'https://www.bing.com/indexnow',
  'https://api.indexnow.org/indexnow',
  'https://yandex.com/indexnow',
];

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const urls = body.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'Provide a non-empty "urls" array' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (urls.length > 10000) {
      return new Response(JSON.stringify({ error: 'Maximum 10,000 URLs per request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const results = await Promise.allSettled(
      SEARCH_ENGINES.map((engine) =>
        fetch(engine, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
    );

    const summary = results.map((r, i) => ({
      engine: SEARCH_ENGINES[i],
      status: r.status === 'fulfilled' ? r.value.status : 'failed',
    }));

    return new Response(JSON.stringify({ ok: true, results: summary }), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestGet(context) {
  const baseUrl = `https://${HOST}`;
  const locales = ['en', 'zh-TW', 'th', 'id'];
  const allUrls = [];

  for (const locale of locales) {
    allUrls.push(
      `${baseUrl}/`,
      `${baseUrl}/codes`,
      `${baseUrl}/tier-list`,
      `${baseUrl}/classes`,
      `${baseUrl}/mvp-hunting`,
      `${baseUrl}/refining`,
      `${baseUrl}/zeny-farming`,
      `${baseUrl}/pvp`,
      `${baseUrl}/dungeons`,
      `${baseUrl}/mounts`,
      `${baseUrl}/guides`,
    );
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
    urlList: allUrls,
  };

  const results = await Promise.allSettled(
    SEARCH_ENGINES.map((engine) =>
      fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    )
  );

  const summary = results.map((r, i) => ({
    engine: SEARCH_ENGINES[i],
    status: r.status === 'fulfilled' ? r.value.status : 'failed',
  }));

  return new Response(JSON.stringify({ ok: true, submitted: allUrls.length, results: summary }), { headers: { 'Content-Type': 'application/json' } });
}
