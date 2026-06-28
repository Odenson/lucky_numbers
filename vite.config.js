import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves from /lucky_numbers/; Netlify and local dev serve from /.
const base = process.env.GITHUB_ACTIONS ? '/lucky_numbers/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
