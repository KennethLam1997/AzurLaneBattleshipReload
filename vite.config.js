import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/azurlane': {
        target: 'https://api.allorigins.win/raw?url=https://azurlane.koumakan.jp/wiki/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/azurlane/, '')
      }
    }
  }
})
