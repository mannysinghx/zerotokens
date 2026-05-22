import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For local dev: use `vercel dev` to run both Vite + API functions together.
  // If running plain `vite dev`, API calls will fail (no serverless runtime locally).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
