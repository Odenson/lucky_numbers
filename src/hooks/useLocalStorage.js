import { useEffect, useState } from 'react'

// Persist a piece of React state to localStorage under `key`.
// Falls back gracefully if storage is unavailable (private mode, quota, etc.).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write failures — the app still works in-memory.
    }
  }, [key, value])

  return [value, setValue]
}
