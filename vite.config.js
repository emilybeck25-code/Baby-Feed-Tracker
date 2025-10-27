import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Baby-Feed-Tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'manifest.json'],
      manifest: {
        name: 'Baby Feed Tracker',
        short_name: 'Feed Tracker',
        description: 'Track your baby feeding times',
        theme_color: '#c084fc',
        background_color: '#f3f4f6',
        display: 'standalone',
        start_url: '/Baby-Feed-Tracker/',
        scope: '/Baby-Feed-Tracker/',
        icons: [
          {
            src: '/Baby-Feed-Tracker/icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/Baby-Feed-Tracker/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
});
