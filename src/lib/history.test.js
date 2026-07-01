import { describe, it, expect } from 'vitest'
import {
  META,
  computeFrequency,
  getHotNumbers,
  getColdNumbers,
  getHistoryNumberType,
  generateWeightedLines,
} from './history'

describe('META', () => {
  it('has a positive drawCount', () => {
    expect(META.drawCount).toBeGreaterThan(0)
  })

  it('has ISO date strings for from and to', () => {
    expect(META.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(META.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('from is earlier than to', () => {
    expect(META.from < META.to).toBe(true)
  })
})

describe('computeFrequency', () => {
  it('returns an entry for every number in [min, max]', () => {
    const freq = computeFrequency(1, 45)
    expect(Object.keys(freq)).toHaveLength(45)
    for (let n = 1; n <= 45; n++) {
      expect(freq[n]).toBeGreaterThanOrEqual(0)
    }
  })

  it('only counts numbers within the requested range', () => {
    const freq = computeFrequency(1, 10)
    expect(Object.keys(freq)).toHaveLength(10)
    expect(freq[11]).toBeUndefined()
  })

  it('total count is positive', () => {
    const freq = computeFrequency(1, 45)
    const total = Object.values(freq).reduce((a, b) => a + b, 0)
    expect(total).toBeGreaterThan(0)
  })

  it('returns the same reference for the same range (cached)', () => {
    const a = computeFrequency(1, 45)
    const b = computeFrequency(1, 45)
    expect(a).toBe(b)
  })
})

describe('getHotNumbers', () => {
  it('returns the requested count', () => {
    const freq = computeFrequency(1, 45)
    expect(getHotNumbers(freq, 10)).toHaveLength(10)
  })

  it('returns numbers in descending frequency order', () => {
    const freq = computeFrequency(1, 45)
    const hot = getHotNumbers(freq, 10)
    for (let i = 0; i < hot.length - 1; i++) {
      expect(freq[hot[i]]).toBeGreaterThanOrEqual(freq[hot[i + 1]])
    }
  })

  it('returns numbers within the frequency map keys', () => {
    const freq = computeFrequency(1, 45)
    const hot = getHotNumbers(freq, 5)
    hot.forEach((n) => expect(freq[n]).toBeDefined())
  })
})

describe('getColdNumbers', () => {
  it('returns the requested count', () => {
    const freq = computeFrequency(1, 45)
    expect(getColdNumbers(freq, 10)).toHaveLength(10)
  })

  it('returns numbers in ascending frequency order', () => {
    const freq = computeFrequency(1, 45)
    const cold = getColdNumbers(freq, 10)
    for (let i = 0; i < cold.length - 1; i++) {
      expect(freq[cold[i]]).toBeLessThanOrEqual(freq[cold[i + 1]])
    }
  })

  it('hot and cold lists are disjoint', () => {
    const freq = computeFrequency(1, 45)
    const hotSet = new Set(getHotNumbers(freq, 10))
    const cold = getColdNumbers(freq, 10)
    cold.forEach((n) => expect(hotSet.has(n)).toBe(false))
  })
})

describe('getHistoryNumberType', () => {
  const hotSet = new Set([7, 22, 31])
  const coldSet = new Set([2, 11, 19])

  it('returns "hot" for a number in the hot set', () => {
    expect(getHistoryNumberType(7, hotSet, coldSet)).toBe('hot')
  })

  it('returns "cold" for a number in the cold set', () => {
    expect(getHistoryNumberType(2, hotSet, coldSet)).toBe('cold')
  })

  it('returns undefined for a neutral number', () => {
    expect(getHistoryNumberType(15, hotSet, coldSet)).toBeUndefined()
  })

  it('hot takes precedence if a number appeared in both sets', () => {
    const overlap = new Set([7])
    expect(getHistoryNumberType(7, overlap, overlap)).toBe('hot')
  })
})

describe('generateWeightedLines', () => {
  it('returns the requested number of lines', () => {
    const lines = generateWeightedLines({ count: 7, min: 1, max: 45, bias: 'hot' }, 3)
    expect(lines).toHaveLength(3)
  })

  it('each line has the correct number count', () => {
    const lines = generateWeightedLines({ count: 6, min: 1, max: 45, bias: 'hot' }, 2)
    lines.forEach((l) => expect(l.numbers).toHaveLength(6))
  })

  it('all numbers are within [min, max]', () => {
    const lines = generateWeightedLines({ count: 7, min: 1, max: 45, bias: 'balanced' }, 3)
    lines.forEach((l) =>
      l.numbers.forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(45)
      })
    )
  })

  it('numbers are unique within each line', () => {
    const lines = generateWeightedLines({ count: 7, min: 1, max: 45, bias: 'cold' }, 3)
    lines.forEach((l) => expect(new Set(l.numbers).size).toBe(l.numbers.length))
  })

  it('numbers are sorted in ascending order', () => {
    const lines = generateWeightedLines({ count: 7, min: 1, max: 45, bias: 'hot' }, 3)
    lines.forEach((l) => {
      const sorted = [...l.numbers].sort((a, b) => a - b)
      expect(l.numbers).toEqual(sorted)
    })
  })

  it('each line has a unique id', () => {
    const lines = generateWeightedLines({ count: 7, min: 1, max: 45, bias: 'hot' }, 3)
    const ids = lines.map((l) => l.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('works with all three bias modes', () => {
    for (const bias of ['hot', 'balanced', 'cold']) {
      const lines = generateWeightedLines({ count: 6, min: 1, max: 45, bias }, 1)
      expect(lines[0].numbers).toHaveLength(6)
    }
  })
})
