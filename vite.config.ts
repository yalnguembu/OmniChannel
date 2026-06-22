import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target =
    env.VITE_API_PROXY_TARGET || 'https://api.omnichannel.nguetioofa.dev'

  return {
    plugins: [
      react(),
      tailwindcss(),
      TanStackRouterVite(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,        // manual registration in main.tsx
        includeAssets: [
          'favicon/favicon.ico',
          'favicon/favicon.svg',
          'android-chrome-192x192.png',
          'android-chrome-512x512.png',
          'favicon/apple-touch-icon.png',
        ],
        manifest: {
          name: 'OmniChannel',
          short_name: 'OmniChannel',
          description: 'Plateforme de messagerie omni-canal — SMS, Email, WhatsApp',
          theme_color: '#1b5e82',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          lang: 'fr',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /\.woff2?(\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-fonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\/api\//i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/hubs\//i,
              handler: 'NetworkOnly',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: '',
        },
        '/hubs': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
          cookieDomainRewrite: '',
        },
      },
    },
  }
})
