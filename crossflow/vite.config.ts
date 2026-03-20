import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/worldmoneyflow/',
  plugins: [react()],
  server: {
    proxy: {
      // Yahoo Finance & FRED はCORS非対応のため Express プロキシ経由
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
