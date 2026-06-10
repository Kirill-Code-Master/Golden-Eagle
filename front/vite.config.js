import { defineConfig } from 'vite'
import plugin from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [plugin()],
  server: {
    port: 53029,
    proxy: {
      // Любой запрос /api/* будет проксирован на Express-сервер.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})