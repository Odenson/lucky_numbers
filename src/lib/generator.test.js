import { describe, it, expect } from 'vitest'
import { validateConfig, generateLine, generateLines } from './generator'

// ─── validateConfig ───────────────────────────────────────────────────────────

describe('validateConfig', () => {
  const valid = { count: 7, min: 1, max: 42, allowRepeats: false, lineCount: 1 }

  it('returns null for a valid configuration', () => {
    expect(validateConfig(valid)).toBeNull()
  })

  it('errors when min is not an integer', () => {
    expect(validateConfig({ ...valid, min: 1.5 })).toBeTruthy()
  })

  it('errors when max is not an integer', () => {
    expect(validateConfig({ ...valid, max: 42.9 })).toBeTruthy()
  })

  it('errors when min equals max', () => {
    expect(validateConfig({ ...valid, min: 5, max: 5 })).toBeTruthy()
  })

  it('errors when min is greater than max', () => {
    expect(validateConfig({ ...valid, min: 10, max: 5 })).toBeTruthy()
  })

  it('errors when count is less than 1', () => {
    expect(validateConfig({ ...valid, count: 0 })).toBeTruthy()
  })

  it('errors when lineCount is less than 1', () => {
    expect(validateConfig({ ...valid, lineCount: 0 })).toBeTruthy()
  })

  it('errors when count exceeds pool size without repeats', () => {
    expect(validateConfig({ ...valid, count: 50, min: 1, max: 10, allowRepeats: false })).toBeTruthy()
  })

  it('allows count greater than pool size when allowRepeats is true', () => {
    expect(validateConfig({ ...valid, count: 50, min: 1, max: 10, allowRepeats: true })).toBeNull()
  })

  it('allows count equal to pool size without repeats', () => {
    expect(validateConfig({ ...valid, count: 10, min: 1, max: 10 })).toBeNull()
  })
})

// ─── generateLine ─────────────────────────────────────────────────────────────

describe('generateLine', () => {
  const opts = { count: 7, min: 1, max: 42 }

  it('returns exactly `count` numbers', () => {
    expect(generateLine(opts)).toHaveLength(7)
  })

  it('all numbers are within [min, max]', () => {
    const nums = generateLine(opts)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(42)
    }
  })

  it('returns no duplicates by default', () => {
    const nums = generateLine(opts)
    expect(new Set(nums).size).toBe(nums.length)
  })

  it('returns numbers in ascending order by default', () => {
    const nums = generateLine(opts)
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })

  it('returns unsorted results when sorted=false', () => {
    // Run enough times to see at least one unsorted result in a wide range.
    const results = Array.from({ length: 100 }, () =>
      generateLine({ count: 7, min: 1, max: 42, sorted: false }),
    )
    const someUnsorted = results.some(
      (r) => r.join(',') !== [...r].sort((a, b) => a - b).join(','),
    )
    expect(someUnsorted).toBe(true)
  })

  it('can generate repeated numbers when allowRepeats is true', () => {
    // With 3 choices and 10 draws, repeats are inevitable.
    const nums = generateLine({ count: 10, min: 1, max: 3, allowRepeats: true })
    expect(nums).toHaveLength(10)
  })

  it('works at boundary: count equals pool size', () => {
    const nums = generateLine({ count: 5, min: 1, max: 5 })
    expect(new Set(nums).size).toBe(5)
    expect(nums.every((n) => n >= 1 && n <= 5)).toBe(true)
  })
})

// ─── generateLines ────────────────────────────────────────────────────────────

describe('generateLines', () => {
  const opts = { count: 6, min: 1, max: 49 }

  it('returns the requested number of lines', () => {
    expect(generateLines(opts, 5)).toHaveLength(5)
  })

  it('defaults to one line', () => {
    expect(generateLines(opts)).toHaveLength(1)
  })

  it('each line has a string id and a numbers array', () => {
    const lines = generateLines(opts, 3)
    for (const line of lines) {
      expect(typeof line.id).toBe('string')
      expect(Array.isArray(line.numbers)).toBe(true)
      expect(line.numbers).toHaveLength(6)
    }
  })

  it('every line id is unique', () => {
    const lines = generateLines(opts, 10)
    const ids = lines.map((l) => l.id)
    expect(new Set(ids).size).toBe(10)
  })
})
