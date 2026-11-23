import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://elana.tolliu.pro',
    integrations: [sitemap()],
    vite: {
        server: {
            proxy: {
                '/media': {
                    target: 'https://elana.tolliu.pro',
                    changeOrigin: true
                },
            },
        },
    },
});
