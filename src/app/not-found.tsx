'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';

export default function NotFound() {
  useEffect(() => {
    const p = window.location.pathname;
    const hasLocale = routing.locales.some(
      (l) => p === `/${l}/` || p === `/${l}` || p.startsWith(`/${l}/`)
    );
    if (!hasLocale && p !== '/') {
      const nav = navigator.language.split('-')[0];
      const target = routing.locales.includes(nav as typeof routing.locales[number]) ? nav : routing.defaultLocale;
      window.location.replace(`/${target}${p}`);
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
