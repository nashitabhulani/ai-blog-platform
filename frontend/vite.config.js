import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        ws: true,
      },
      '/uploads': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
})
