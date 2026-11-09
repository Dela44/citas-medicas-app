import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const tunnelHosts = ['.trycloudflare.com', 'localhost', '127.0.0.1']

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: tunnelHosts,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    allowedHosts: tunnelHosts,
  },
})
