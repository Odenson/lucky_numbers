import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// DEPLOY_BASE is set by the Actions workflow — /lucky_numbers/ for prod,
// /lucky_numbers/dev/ for the dev preview. Defaults to / for local dev.
const base = process.env.DEPLOY_BASE ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: Number(process.env.PORT) || 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/components/**', 'src/hooks/**'],
      exclude: ['src/test/**'],
    },
  },
})
