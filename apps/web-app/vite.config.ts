
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
  resolve: {
    alias: {
      '@mahyay/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    commonjsOptions: {
      include: [/packages\//, /node_modules/],
    },
  },
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
      manifest: {
        name: 'مَحيّاي - رفيقك الروحي اليومي',
        short_name: 'مَحيّاي',
        description: 'تطبيق إسلامي شامل يساعدك على تنظيم عباداتك اليومية.',
        theme_color: '#2d5a47',
        background_color: '#1e4d3b',
        display: 'standalone',
        scope: '/',
        start_url: '.',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
