import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Manages dark/light mode, persisted across visits and reflected on <html>.
// Defaults to the user's OS preference on first visit.
export function useTheme() {
  const [theme, setTheme] = useLocalStorage('ln:theme', defaultTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0E1020' : '#F4F4FB')
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggle }
}

function defaultTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return 'dark'
}
