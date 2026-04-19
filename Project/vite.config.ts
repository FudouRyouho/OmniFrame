import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@lib':       '/src/lib',
      '@domains':  '/src/domains',
      '@shared':    '/src/shared',
      '@core':      '/src/core',
      '@assets':    '/src/assets',
      '@providers': '/src/providers',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
