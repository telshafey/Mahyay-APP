
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Per guidelines, the app must use process.env.API_KEY.
    // This exposes the VITE_API_KEY environment variable to the app as process.env.API_KEY.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      // Switch to injectManifest strategy to use our custom service worker
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
      manifest: {
        name: 'مَحيّاي - رفيقك الروحي اليومي',
        short_name: 'مَحيّاي',
        description: 'تطبيق إسلامي شامل يساعدك على تنظيم عباداتك اليومية من صلوات وأذكار وقراءة للقرآن الكريم، مع متابعة الإحصائيات والتحديات الإيمانية. معزز بتأملات روحية من Gemini.',
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
