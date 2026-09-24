import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'Ztress — Santuario Mental',
        short_name: 'Ztress',
        description: 'Tu refugio anti-estrés local-first: respiración guiada, sonidos binaurales, tests validados y terapias clínicas. Sin tracking, sin login, solo calma.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B1015',
        theme_color: '#8FBCBB',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'es',
        categories: ['health', 'lifestyle', 'medical'],
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Respiración 4-6',
            short_name: '4-6',
            description: 'Activa tu nervio vago en 2 minutos',
            url: '/?tab=zen&protocol=46',
            icons: [{ src: '/icons/shortcut-breathe.png', sizes: '192x192' }]
          },
          {
            name: 'Botón de Pánico',
            short_name: 'Pánico',
            description: 'Rescate inmediato 4-1-7',
            url: '/?panic=true',
            icons: [{ src: '/icons/shortcut-panic.png', sizes: '192x192' }]
          },
          {
            name: 'Sonidos Binaurales',
            short_name: 'Audio',
            description: 'Ondas Alpha, Theta, Delta, naturaleza',
            url: '/?tab=jukebox',
            icons: [{ src: '/icons/shortcut-audio.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Optimizaciones de producción
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Code splitting manual para vendors pesados
        manualChunks: (id) => {
          if (id.includes('framer-motion')) return 'framer-motion';
          if (id.includes('react') || id.includes('zustand')) return 'vendor';
          if (id.includes('node_modules')) return 'vendor';
        },
        // Nombres de chunks más legibles para debugging
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Source maps solo para debugging en producción si se necesita
    sourcemap: false,
    // Target moderno para mejor tree-shaking
    target: 'es2022',
  },
  // Optimización de dependencias en dev
  optimizeDeps: {
    include: ['framer-motion', 'zustand', 'react', 'react-dom'],
    exclude: [],
  },
})
