import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
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
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
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
