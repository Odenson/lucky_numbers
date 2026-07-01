import { describe, it, expect } from 'vitest'
import {
  calcExpressionNumber,
  buildPersonalPool,
  getPersonalNumberType,
  getPersonalSeed,
  generatePersonalLine,
  generatePersonalLines,
} from './personal'

// Verified reference profile: Alex Johnson, 14 March 1988.
// Smoke-tested externally — expected pool: [7, 11, 14, 8, 5, 3].
//   Life Path  : month(3) + day(5) + year(8) = 16 → 7
//   Expression : ALEX(15→6) + JOHNSON(32→5) = 11  (Master Number)
//   Birthday   : 14 (raw)
//   Attitude   : 3 + 14 = 17 → 8
//   Reduced day: 1+4 = 5
//   Reduced mo : 3  (same as raw month, both 3)
const PROFILE = { name: 'Alex Johnson', day: 14, month: 3, year: 1988 }

// ─── calcExpressionNumber ─────────────────────────────────────────────────────

describe('calcExpressionNumber', () => {
  it('returns 11 for "Alex Johnson"', () => {
    expect(calcExpressionNumber('Alex Johnson')).toBe(11)
  })

  it('is case-insensitive', () => {
    expect(calcExpressionNumber('ALEX JOHNSON')).toBe(
      calcExpressionNumber('alex johnson'),
    )
  })

  it('returns null for an empty string', () => {
    expect(calcExpressionNumber('')).toBeNull()
  })

  it('returns null for a whitespace-only string', () => {
    expect(calcExpressionNumber('   ')).toBeNull()
  })

  it('returns a valid numerology number for a single name', () => {
    const result = calcExpressionNumber('Alex')
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(33)
  })

  it('digits embedded in a name are ignored (map to 0 in PYTHAGOREAN table)', () => {
    // '2' has no entry in the Pythagorean table so it contributes 0 to the sum.
    expect(calcExpressionNumber('Alex2 Johnson')).toBe(calcExpressionNumber('Alex Johnson'))
  })

  it('preserves Master Numbers (11) at the final reduction', () => {
    // "Alex Johnson" sums to 11 — verify it is NOT reduced to 2.
    expect(calcExpressionNumber('Alex Johnson')).toBe(11)
    expect(calcExpressionNumber('Alex Johnson')).not.toBe(2)
  })
})

// ─── buildPersonalPool ────────────────────────────────────────────────────────

describe('buildPersonalPool', () => {
  it('contains all expected numbers for the reference profile', () => {
    const pool = buildPersonalPool(PROFILE)
    expect(pool).toContain(7)   // Life Path
    expect(pool).toContain(11)  // Expression
    expect(pool).toContain(14)  // Raw birthday
    expect(pool).toContain(8)   // Attitude (3+14=17→8)
    expect(pool).toContain(5)   // Reduced day (1+4=5)
    expect(pool).toContain(3)   // Reduced month / raw month
  })

  it('returns exactly 6 unique values for the reference profile', () => {
    const pool = buildPersonalPool(PROFILE)
    expect(pool).toHaveLength(6)
  })

  it('has no duplicates', () => {
    const pool = buildPersonalPool(PROFILE)
    expect(new Set(pool).size).toBe(pool.length)
  })

  it('Life Path is first (highest priority)', () => {
    const pool = buildPersonalPool(PROFILE)
    expect(pool[0]).toBe(7)
  })

  it('Expression is second (when present)', () => {
    const pool = buildPersonalPool(PROFILE)
    expect(pool[1]).toBe(11)
  })

  it('all values are positive integers', () => {
    const pool = buildPersonalPool(PROFILE)
    for (const n of pool) {
      expect(Number.isInteger(n)).toBe(true)
      expect(n).toBeGreaterThan(0)
    }
  })

  it('omits Expression when name is empty', () => {
    const pool = buildPersonalPool({ ...PROFILE, name: '' })
    // Expression (11) should not appear; only DOB numbers
    expect(pool).not.toContain(11)
  })
})

// ─── getPersonalNumberType ────────────────────────────────────────────────────

describe('getPersonalNumberType', () => {
  it('classifies the Life Path number as "life-path"', () => {
    expect(getPersonalNumberType(7, PROFILE)).toBe('life-path')
  })

  it('classifies the Expression number as "expression"', () => {
    expect(getPersonalNumberType(11, PROFILE)).toBe('expression')
  })

  it('classifies other pool numbers as "personal"', () => {
    expect(getPersonalNumberType(14, PROFILE)).toBe('personal') // raw birthday
    expect(getPersonalNumberType(8, PROFILE)).toBe('personal')  // attitude
    expect(getPersonalNumberType(5, PROFILE)).toBe('personal')  // reduced day
    expect(getPersonalNumberType(3, PROFILE)).toBe('personal')  // reduced month
  })

  it('classifies out-of-pool numbers as "fill"', () => {
    expect(getPersonalNumberType(42, PROFILE)).toBe('fill')
    expect(getPersonalNumberType(1, PROFILE)).toBe('fill')
    expect(getPersonalNumberType(20, PROFILE)).toBe('fill')
  })

  it('"life-path" takes priority over "personal" when values coincide', () => {
    // For any profile where Life Path also appears elsewhere in the pool,
    // it must still be classified as 'life-path'.
    expect(getPersonalNumberType(7, PROFILE)).toBe('life-path')
  })
})

// ─── generatePersonalLine ─────────────────────────────────────────────────────

describe('generatePersonalLine', () => {
  const opts = { count: 7, min: 1, max: 42, profile: PROFILE }

  it('returns exactly `count` numbers', () => {
    expect(generatePersonalLine(opts)).toHaveLength(7)
  })

  it('all numbers are within [min, max]', () => {
    const nums = generatePersonalLine(opts)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(42)
    }
  })

  it('has no duplicates', () => {
    const nums = generatePersonalLine(opts)
    expect(new Set(nums).size).toBe(nums.length)
  })

  it('returns numbers in ascending order by default', () => {
    const nums = generatePersonalLine(opts)
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })

  it('always includes Life Path and Expression when in range', () => {
    // Run 20 times — personal numbers must appear every time.
    for (let i = 0; i < 20; i++) {
      const nums = generatePersonalLine(opts)
      expect(nums).toContain(7)   // Life Path
      expect(nums).toContain(11)  // Expression
    }
  })

  it('includes all 6 personal numbers when count equals pool size', () => {
    const nums = generatePersonalLine({ ...opts, count: 6 })
    const pool = buildPersonalPool(PROFILE)
    for (const n of pool) {
      expect(nums).toContain(n)
    }
  })

  it('works when count exceeds the personal pool size', () => {
    // count=8 > pool size (6) — fill must cover the gap.
    const nums = generatePersonalLine({ ...opts, count: 8 })
    expect(nums).toHaveLength(8)
    expect(new Set(nums).size).toBe(8)
  })

  it('works when the personal pool falls entirely outside the range', () => {
    // Range 20–42: none of [7, 11, 14, 8, 5, 3] are in range except 14.
    const nums = generatePersonalLine({ count: 5, min: 20, max: 42, profile: PROFILE })
    expect(nums).toHaveLength(5)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(20)
      expect(n).toBeLessThanOrEqual(42)
    }
  })
})

// ─── generatePersonalLine — personalSeed override ────────────────────────────

describe('generatePersonalLine — personalSeed override', () => {
  const opts = { count: 7, min: 1, max: 42, profile: PROFILE }

  it('empty personalSeed produces a fully random line (valid count, in range, no dups)', () => {
    const nums = generatePersonalLine({ ...opts, personalSeed: [] })
    expect(nums).toHaveLength(7)
    expect(new Set(nums).size).toBe(7)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(42)
    }
  })

  it('numbers in personalSeed are included in the output', () => {
    const nums = generatePersonalLine({ ...opts, personalSeed: [7, 11] })
    expect(nums).toContain(7)
    expect(nums).toContain(11)
  })

  it('personalSeed is capped at count (extra seed numbers are dropped)', () => {
    // Seed 4 numbers but count is 3 — only first 3 of the seed should appear.
    const nums = generatePersonalLine({ count: 3, min: 1, max: 42, profile: PROFILE, personalSeed: [7, 11, 14, 8] })
    expect(nums).toHaveLength(3)
    // First 3 seed values must all be present.
    expect(nums).toContain(7)
    expect(nums).toContain(11)
    expect(nums).toContain(14)
  })

  it('personalSeed=null (default) is identical to omitting the parameter', () => {
    // Both calls should produce lines that always include all in-range personal numbers.
    // Run 5 times to rule out a lucky pass.
    for (let i = 0; i < 5; i++) {
      const a = generatePersonalLine({ ...opts })
      const b = generatePersonalLine({ ...opts, personalSeed: null })
      // Both must contain all in-range personal numbers from PROFILE.
      for (const n of [7, 11, 14, 8, 5, 3]) {
        expect(a).toContain(n)
        expect(b).toContain(n)
      }
    }
  })
})

// ─── generatePersonalLines ────────────────────────────────────────────────────

describe('generatePersonalLines', () => {
  const opts = { count: 6, min: 1, max: 49, profile: PROFILE }

  it('returns the requested number of lines', () => {
    expect(generatePersonalLines(opts, 4)).toHaveLength(4)
  })

  it('defaults to one line', () => {
    expect(generatePersonalLines(opts)).toHaveLength(1)
  })

  it('each line has a unique id and a numbers array of correct length', () => {
    const lines = generatePersonalLines(opts, 5)
    const ids = new Set()
    for (const line of lines) {
      expect(typeof line.id).toBe('string')
      expect(line.numbers).toHaveLength(6)
      ids.add(line.id)
    }
    expect(ids.size).toBe(5)
  })

  // ─ Multi-line seeding behaviour ───────────────────────────────────────────

  it('line 1 always contains all in-range personal numbers', () => {
    // PROFILE in-range pool: [7, 11, 14, 8, 5, 3] — all fall within [1, 49].
    // count=6 matches pool size exactly, so all 6 must be present.
    for (let i = 0; i < 5; i++) {
      const [line1] = generatePersonalLines(opts, 3)
      for (const n of [7, 11, 14, 8, 5, 3]) {
        expect(line1.numbers).toContain(n)
      }
    }
  })

  it('all lines (including 2+) are valid: correct count, in range, no duplicates', () => {
    const lines = generatePersonalLines(opts, 5)
    for (const line of lines) {
      expect(line.numbers).toHaveLength(6)
      expect(new Set(line.numbers).size).toBe(6)
      for (const n of line.numbers) {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(49)
      }
    }
  })

  it('lines 2+ do not always contain all in-range personal numbers', () => {
    // The PROFILE pool has 6 in-range personal numbers. Lines 2+ seed a
    // strict subset (0 to 5), so at least some runs must produce fewer than 6.
    // With 20 attempts the probability of random fill completing all 6 every
    // single time is negligible.
    const PERSONAL_POOL = new Set([7, 11, 14, 8, 5, 3])
    let someLineHasFewer = false
    for (let i = 0; i < 20 && !someLineHasFewer; i++) {
      const lines = generatePersonalLines(opts, 2)
      const personalCount = lines[1].numbers.filter((n) => PERSONAL_POOL.has(n)).length
      if (personalCount < PERSONAL_POOL.size) someLineHasFewer = true
    }
    expect(someLineHasFewer).toBe(true)
  })

  it('lines 2+ vary across separate calls (genuine randomness)', () => {
    // Collect several line-2 results. At least 2 distinct results should
    // appear within 10 calls — identical lines would indicate no randomness.
    const seen = new Set()
    for (let i = 0; i < 10; i++) {
      const line2 = generatePersonalLines(opts, 2)[1]
      seen.add(line2.numbers.join(','))
    }
    expect(seen.size).toBeGreaterThan(1)
  })

  it('single-line request is unaffected by multi-line logic', () => {
    const [line] = generatePersonalLines(opts, 1)
    for (const n of [7, 11, 14, 8, 5, 3]) {
      expect(line.numbers).toContain(n)
    }
  })
})

// ─── generatePersonalLines — allVaried option ─────────────────────────────────

describe('generatePersonalLines — allVaried', () => {
  const opts = { count: 6, min: 1, max: 49, profile: PROFILE }
  const PERSONAL_POOL = new Set([7, 11, 14, 8, 5, 3])

  it('when allVaried=true, line 1 does NOT always contain the full personal pool', () => {
    // Without allVaried, line 1 always has all 6 personal numbers.
    // With allVaried, line 1 uses a random subset — so at least some runs
    // should produce fewer than 6 personal numbers on line 1.
    let someLineHasFewer = false
    for (let i = 0; i < 30 && !someLineHasFewer; i++) {
      const [line1] = generatePersonalLines(opts, 1, { allVaried: true })
      const count = line1.numbers.filter((n) => PERSONAL_POOL.has(n)).length
      if (count < PERSONAL_POOL.size) someLineHasFewer = true
    }
    expect(someLineHasFewer).toBe(true)
  })

  it('all lines with allVaried=true are still valid: count, range, no duplicates', () => {
    const lines = generatePersonalLines(opts, 5, { allVaried: true })
    for (const line of lines) {
      expect(line.numbers).toHaveLength(6)
      expect(new Set(line.numbers).size).toBe(6)
      for (const n of line.numbers) {
        expect(n).toBeGreaterThanOrEqual(1)
        expect(n).toBeLessThanOrEqual(49)
      }
    }
  })

  it('allVaried=false (default) still gives line 1 the full pool', () => {
    for (let i = 0; i < 5; i++) {
      const [line1] = generatePersonalLines(opts, 3)
      for (const n of [7, 11, 14, 8, 5, 3]) {
        expect(line1.numbers).toContain(n)
      }
    }
  })
})

// ─── getPersonalSeed ──────────────────────────────────────────────────────────

describe('getPersonalSeed', () => {
  it('returns all pool numbers that fall within [min, max]', () => {
    // PROFILE pool: [7, 11, 14, 8, 5, 3] — all in [1, 45]
    const seed = getPersonalSeed(PROFILE, 1, 45)
    for (const n of [7, 11, 14, 8, 5, 3]) expect(seed).toContain(n)
    expect(seed).toHaveLength(6)
  })

  it('excludes pool numbers outside the range', () => {
    // Range 10–45: excludes 3, 5, 8 from pool
    const seed = getPersonalSeed(PROFILE, 10, 45)
    expect(seed).not.toContain(3)
    expect(seed).not.toContain(5)
    expect(seed).not.toContain(8)
    expect(seed).toContain(11)
    expect(seed).toContain(14)
  })

  it('returns an empty array when no pool numbers are in range', () => {
    // Range 40–45: none of [7, 11, 14, 8, 5, 3] qualify
    const seed = getPersonalSeed(PROFILE, 40, 45)
    expect(seed).toHaveLength(0)
  })

  it('preserves the priority order of buildPersonalPool', () => {
    const pool = buildPersonalPool(PROFILE)
    const seed = getPersonalSeed(PROFILE, 1, 45)
    // Seed must be the pool filtered — same relative order
    const filtered = pool.filter((n) => n >= 1 && n <= 45)
    expect(seed).toEqual(filtered)
  })
})
