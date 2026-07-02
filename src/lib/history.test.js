import { describe, it, expect } from 'vitest'
import {
  META,
  getGameMeta,
  computeFrequency,
  getHotNumbers,
  getColdNumbers,
  getHistoryNumberType,
  getBalancedNumbers,
  generateWeightedLines,
  generatePinnedLine,
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

  it('works with ozlotto gameId', () => {
    const lines = generateWeightedLines({ count: 7, min: 1, max: 47, bias: 'hot', gameId: 'ozlotto' }, 2)
    expect(lines).toHaveLength(2)
    lines.forEach((l) => {
      expect(l.numbers).toHaveLength(7)
      l.numbers.forEach((n) => {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(47)
      })
    })
  })
})

describe('getGameMeta', () => {
  it('returns a positive drawCount for tattslotto', () => {
    const meta = getGameMeta('tattslotto')
    expect(meta.drawCount).toBeGreaterThan(0)
  })

  it('returns a positive drawCount for ozlotto', () => {
    const meta = getGameMeta('ozlotto')
    expect(meta.drawCount).toBeGreaterThan(0)
  })

  it('returns ISO date strings for ozlotto', () => {
    const meta = getGameMeta('ozlotto')
    expect(meta.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(meta.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('defaults to tattslotto (same as META)', () => {
    expect(getGameMeta()).toEqual(META)
  })
})

describe('computeFrequency — multi-game', () => {
  it('returns 47 entries for ozlotto range 1–47', () => {
    const freq = computeFrequency(1, 47, 'ozlotto')
    expect(Object.keys(freq)).toHaveLength(47)
  })

  it('caches separately per gameId', () => {
    const tatts = computeFrequency(1, 45, 'tattslotto')
    const oz = computeFrequency(1, 45, 'ozlotto')
    expect(tatts).not.toBe(oz)
  })

  it('ozlotto frequency total is positive', () => {
    const freq = computeFrequency(1, 47, 'ozlotto')
    const total = Object.values(freq).reduce((a, b) => a + b, 0)
    expect(total).toBeGreaterThan(0)
  })
})

describe('getBalancedNumbers', () => {
  const freq = computeFrequency(1, 45, 'tattslotto')
  const hotSet = new Set(getHotNumbers(freq, 10))
  const coldSet = new Set(getColdNumbers(freq, 10))

  it('returns numbers not in the hot or cold sets', () => {
    const balanced = getBalancedNumbers(freq, hotSet, coldSet)
    for (const n of balanced) {
      expect(hotSet.has(n)).toBe(false)
      expect(coldSet.has(n)).toBe(false)
    }
  })

  it('returns a non-empty array', () => {
    const balanced = getBalancedNumbers(freq, hotSet, coldSet)
    expect(balanced.length).toBeGreaterThan(0)
  })

  it('hot + cold + balanced together cover all numbers in the range', () => {
    const balanced = getBalancedNumbers(freq, hotSet, coldSet)
    const all = new Set([...hotSet, ...coldSet, ...balanced])
    expect(all.size).toBe(Object.keys(freq).length)
  })

  it('returns an empty array when hot and cold together cover the full range', () => {
    const tinyFreq = { 1: 5, 2: 3, 3: 1 }
    const tinyHot = new Set([1])
    const tinyCold = new Set([2, 3])
    expect(getBalancedNumbers(tinyFreq, tinyHot, tinyCold)).toHaveLength(0)
  })
})

// ─── generatePinnedLine ───────────────────────────────────────────────────────

const FREQ = computeFrequency(1, 45, 'tattslotto')
const HOT_SET = new Set(getHotNumbers(FREQ, 10))
const COLD_SET = new Set(getColdNumbers(FREQ, 10))
const HISTORY_STATS = { hotSet: HOT_SET, coldSet: COLD_SET }

describe('generatePinnedLine — basics', () => {
  it('returns exactly `count` numbers', () => {
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45 })
    expect(nums).toHaveLength(6)
  })

  it('all numbers are within [min, max]', () => {
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45, historyStats: HISTORY_STATS })
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(45)
    }
  })

  it('has no duplicates', () => {
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45, historyStats: HISTORY_STATS })
    expect(new Set(nums).size).toBe(6)
  })

  it('returns numbers in ascending order', () => {
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45, historyStats: HISTORY_STATS })
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })
})

describe('generatePinnedLine — personal only (no history)', () => {
  // PROFILE personal numbers in [1, 45]: [7, 11, 14, 8, 5, 3]
  const PERSONAL_SEED = [7, 11, 14, 8, 5, 3]

  it('includes all personal seed numbers when count equals seed size', () => {
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45, personalSeed: PERSONAL_SEED })
    for (const n of PERSONAL_SEED) expect(nums).toContain(n)
  })

  it('includes as many seed numbers as count allows when seed is larger than count', () => {
    const nums = generatePinnedLine({ count: 3, min: 1, max: 45, personalSeed: PERSONAL_SEED })
    // First 3 in seed (7, 11, 14) must be present
    expect(nums).toContain(7)
    expect(nums).toContain(11)
    expect(nums).toContain(14)
    expect(nums).toHaveLength(3)
  })

  it('fills remaining slots from the full range when seed is smaller than count', () => {
    // Seed only 2 personal numbers, count=6 → 4 random fill slots
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45, personalSeed: [7, 11] })
    expect(nums).toContain(7)
    expect(nums).toContain(11)
    expect(nums).toHaveLength(6)
    expect(new Set(nums).size).toBe(6)
  })

  it('works with an empty seed (pure random fill)', () => {
    const nums = generatePinnedLine({ count: 6, min: 1, max: 45, personalSeed: [] })
    expect(nums).toHaveLength(6)
    expect(new Set(nums).size).toBe(6)
  })
})

describe('generatePinnedLine — History + Hot', () => {
  it('all numbers come from the hot set when no personal seed', () => {
    // Run multiple times — every result must be from HOT_SET (10 numbers, pick 6)
    for (let i = 0; i < 10; i++) {
      const nums = generatePinnedLine({
        count: 6, min: 1, max: 45,
        personalSeed: [], bias: 'hot', historyStats: HISTORY_STATS,
      })
      for (const n of nums) expect(HOT_SET.has(n)).toBe(true)
    }
  })
})

describe('generatePinnedLine — History + Cold', () => {
  it('all numbers come from the cold set when no personal seed', () => {
    for (let i = 0; i < 10; i++) {
      const nums = generatePinnedLine({
        count: 6, min: 1, max: 45,
        personalSeed: [], bias: 'cold', historyStats: HISTORY_STATS,
      })
      for (const n of nums) expect(COLD_SET.has(n)).toBe(true)
    }
  })
})

describe('generatePinnedLine — History + Balanced', () => {
  const BALANCED = new Set(getBalancedNumbers(FREQ, HOT_SET, COLD_SET))

  it('all numbers come from the balanced set when no personal seed', () => {
    for (let i = 0; i < 10; i++) {
      const nums = generatePinnedLine({
        count: 6, min: 1, max: 45,
        personalSeed: [], bias: 'balanced', historyStats: HISTORY_STATS,
      })
      for (const n of nums) expect(BALANCED.has(n)).toBe(true)
    }
  })
})

describe('generatePinnedLine — Personal + Hot', () => {
  const PERSONAL_SEED = [7, 11, 14, 8, 5, 3]

  it('personal numbers appear, remaining slots come from hot set', () => {
    // count=6 with 2 personal seeds → 4 slots must be hot
    const nums = generatePinnedLine({
      count: 6, min: 1, max: 45,
      personalSeed: [7, 11], bias: 'hot', historyStats: HISTORY_STATS,
    })
    expect(nums).toContain(7)
    expect(nums).toContain(11)
    // Remaining 4 must be in the hot set
    const fillNums = nums.filter((n) => n !== 7 && n !== 11)
    for (const n of fillNums) expect(HOT_SET.has(n)).toBe(true)
  })

  it('falls back to random fill if personal seed exhausts the hot pool', () => {
    // Use a hot set of size 1, seed covers it plus more — fallback must kick in
    const tinyHotSet = new Set([7])
    const tinyColdSet = new Set([1, 2])
    const nums = generatePinnedLine({
      count: 6, min: 1, max: 45,
      personalSeed: PERSONAL_SEED, bias: 'hot',
      historyStats: { hotSet: tinyHotSet, coldSet: tinyColdSet },
    })
    expect(nums).toHaveLength(6)
    expect(new Set(nums).size).toBe(6)
  })
})

describe('generatePinnedLine — Personal + Cold', () => {
  it('personal numbers appear, remaining slots come from cold set', () => {
    const nums = generatePinnedLine({
      count: 6, min: 1, max: 45,
      personalSeed: [7, 11], bias: 'cold', historyStats: HISTORY_STATS,
    })
    expect(nums).toContain(7)
    expect(nums).toContain(11)
    const fillNums = nums.filter((n) => n !== 7 && n !== 11)
    for (const n of fillNums) expect(COLD_SET.has(n)).toBe(true)
  })
})

describe('generatePinnedLine — Personal + Balanced', () => {
  const BALANCED = new Set(getBalancedNumbers(FREQ, HOT_SET, COLD_SET))

  it('personal numbers appear, remaining slots come from balanced set', () => {
    const nums = generatePinnedLine({
      count: 6, min: 1, max: 45,
      personalSeed: [7, 11], bias: 'balanced', historyStats: HISTORY_STATS,
    })
    expect(nums).toContain(7)
    expect(nums).toContain(11)
    const fillNums = nums.filter((n) => n !== 7 && n !== 11)
    for (const n of fillNums) expect(BALANCED.has(n)).toBe(true)
  })
})
