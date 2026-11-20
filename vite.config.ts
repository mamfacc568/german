import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the build works at any URL: a user site
  // (user.github.io), a project site (user.github.io/repo/) or a custom
  // domain — without having to hard-code the repository name.
  base: './',
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' is what removes the APK rebuild-and-reinstall loop:
      // push to GitHub, the host rebuilds, and the next time the installed
      // app is opened it picks up the new version by itself.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'WortSchatz — Learn German',
        short_name: 'WortSchatz',
        description: 'A German dictionary and learning app for English speakers.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#EEF0F8',
        theme_color: '#2563EB',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Fonts must be cached or offline text falls back to system faces.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Looked-up words are already kept in localStorage; this just
            // spares the network on a repeat lookup in the same session.
            urlPattern: /^https:\/\/en\.wiktionary\.org\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wiktionary',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
