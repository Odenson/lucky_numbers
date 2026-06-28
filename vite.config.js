import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// DEPLOY_BASE is set by the Actions workflow — /lucky_numbers/ for prod,
// /lucky_numbers/dev/ for the dev preview. Defaults to / for local dev.
const base = process.env.DEPLOY_BASE ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
})
