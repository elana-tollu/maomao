import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ✏️ Replace with your real domain (needed for canonical URLs and the sitemap)
export default defineConfig({
  site: 'https://elana.tolliu.pro',
  integrations: [sitemap()],
});
