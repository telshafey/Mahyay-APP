import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel provides the environment variables during the build process.
    // This makes them available to your client-side code.
    // NOTE: For local development, you can create a .env.local file
    // at the root of your project and add: API_KEY="your_gemini_api_key"
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  }
})
