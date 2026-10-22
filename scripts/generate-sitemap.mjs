import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const configuredUrl = process.env.SITE_URL;

if (!configuredUrl) {
  console.warn('[sitemap] SITE_URL is not configured; keeping the generic robots.txt and skipping sitemap.xml so a fake domain is never published.');
  process.exit(0);
}

let origin;
try {
  const parsed = new URL(configuredUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('SITE_URL must use HTTP or HTTPS.');
  origin = parsed.origin.replace(/\/$/, '');
} catch (error) {
  console.error('[sitemap] Invalid SITE_URL:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const publicDir = resolve(process.cwd(), 'public');
mkdirSync(publicDir, { recursive: true });
const now = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(resolve(publicDir, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n', 'utf8');
console.log('[sitemap] Generated sitemap.xml and robots.txt for ' + origin);
