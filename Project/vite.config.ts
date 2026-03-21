import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@lib':       resolve(__dirname, 'src/lib'),
      '@features':  resolve(__dirname, 'src/features'),
      '@shared':    resolve(__dirname, 'src/shared'),
      '@assets':    resolve(__dirname, 'src/assets'),
      '@providers': resolve(__dirname, 'src/providers'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
