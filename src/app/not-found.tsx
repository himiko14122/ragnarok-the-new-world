'use client';

import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    const p = window.location.pathname;
    const locales = ['de', 'uk', 'ja', 'en'];
    const hasLocale = locales.some(
      (l) => p === `/${l}/` || p === `/${l}` || p.startsWith(`/${l}/`)
    );
    if (!hasLocale && p !== '/') {
      const nav = navigator.language.split('-')[0];
      const target = locales.includes(nav) ? nav : 'en';
      const prefix = target === 'en' ? '' : `/${target}`;
      window.location.replace(prefix + p);
    }
  }, []);

  return (
    <html>
      <body>
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0d0a',
          color: '#8a7e68',
        }}>
          Redirecting...
        </div>
      </body>
    </html>
  );
}
