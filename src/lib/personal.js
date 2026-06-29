// Numerology engine for personal lucky number generation.
//
// Implements Option 3 — multi-component pool (DOB + Expression Number):
//   · Core personal numbers are derived from the user's date of birth and
//     full birth name using the Pythagorean system.
//   · Numbers that fall inside the configured range are included first,
//     in order of numerological significance.
//   · Any remaining slots are filled with a cryptographically-strong
//     random draw, keeping each generation fresh.

// ─── Pythagorean letter-to-number table ──────────────────────────────────────

const PYTHAGOREAN = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9,
  J:1, K:2, L:3, M:4, N:5, O:6, P:7, Q:8, R:9,
  S:1, T:2, U:3, V:4, W:5, X:6, Y:7, Z:8,
}

// ─── Reduction helpers ────────────────────────────────────────────────────────

// Sum all decimal digits of a positive integer.
function digitSum(n) {
  return String(Math.abs(Math.floor(n)))
    .split('')
    .reduce((s, d) => s + Number(d), 0)
}

// Reduce n to a single digit, stopping at Master Numbers 11, 22, or 33.
function reduceDigit(n) {
  if (n === 11 || n === 22 || n === 33) return n
  if (n > 0 && n < 10) return n
  const s = digitSum(n)
  if (s === n) return n // guard against degenerate input
  return reduceDigit(s)
}

// ─── Expression Number ────────────────────────────────────────────────────────

function namePartSum(part) {
  return part
    .toUpperCase()
    .split('')
    .reduce((s, c) => s + (PYTHAGOREAN[c] ?? 0), 0)
}

// Calculate the Expression Number from a full name string.
// Each space-separated token is reduced separately before the final sum,
// preserving any Master Numbers that arise at the per-token level.
export function calcExpressionNumber(fullName) {
  const parts = fullName.trim().split(/\s+/).filter((p) => p.length > 0)
  if (parts.length === 0) return null
  const total = parts
    .map((p) => reduceDigit(namePartSum(p)))
    .reduce((s, v) => s + v, 0)
  return reduceDigit(total)
}

// ─── Personal pool ────────────────────────────────────────────────────────────

// Derive an ordered, deduplicated array of personal numerological numbers.
// Numbers are listed in decreasing significance so that when the pool is
// larger than `count`, the most meaningful numbers are always picked first.
//
// Order: Life Path → Expression → raw birthday → Attitude →
//        reduced day → reduced month → reduced year → raw month
export function buildPersonalPool({ day, month, year, name }) {
  const monthR   = reduceDigit(month)
  const dayR     = reduceDigit(day)
  const yearR    = reduceDigit(digitSum(year))
  const lifePath = reduceDigit(monthR + dayR + yearR)
  const attitude = reduceDigit(month + day)
  const expression = name?.trim() ? calcExpressionNumber(name) : null

  const ordered = [
    lifePath,   // #1 — most significant DOB number
    expression, // #2 — most significant name number (null if name absent)
    day,        // #3 — raw birthday day (1–31, inherently personal)
    attitude,   // #4 — month + day combined
    dayR,       // #5 — reduced day
    monthR,     // #6 — reduced month
    yearR,      // #7 — reduced year
    month,      // #8 — raw birth month (1–12)
  ].filter((n) => n !== null && n !== undefined && n > 0)

  const seen = new Set()
  return ordered.filter((n) => !seen.has(n) && seen.add(n))
}

// ─── Unbiased random integer (mirrors generator.js) ──────────────────────────

function randomInt(min, max) {
  const range = max - min + 1
  const maxUnbiased = Math.floor(0xffffffff / range) * range
  const buf = new Uint32Array(1)
  let v
  do {
    crypto.getRandomValues(buf)
    v = buf[0]
  } while (v >= maxUnbiased)
  return min + (v % range)
}

// ─── Line generation ──────────────────────────────────────────────────────────

/**
 * Generate one personal line.
 *
 * Personal numbers that fall within [min, max] are always included first
 * (up to `count`, in significance order). Any remaining slots are filled
 * with unbiased crypto-random picks so each generation stays fresh.
 */
export function generatePersonalLine({ count, min, max, profile, sorted = true }) {
  const pool    = buildPersonalPool(profile)
  const inRange = pool.filter((n) => n >= min && n <= max)

  // Seed with personal numbers (capped at count).
  const chosen = new Set(inRange.slice(0, count))

  // Fill any remaining slots with random draws from the rest of the range.
  if (chosen.size < count) {
    const remaining = []
    for (let n = min; n <= max; n++) {
      if (!chosen.has(n)) remaining.push(n)
    }
    while (chosen.size < count && remaining.length > 0) {
      const idx = randomInt(0, remaining.length - 1)
      chosen.add(remaining[idx])
      remaining.splice(idx, 1)
    }
  }

  const numbers = [...chosen]
  return sorted ? numbers.sort((a, b) => a - b) : numbers
}

/**
 * Classify a single number by its numerological source for a given profile.
 * Returns 'life-path' | 'expression' | 'personal' | 'fill'
 */
export function getPersonalNumberType(n, profile) {
  const monthR   = reduceDigit(profile.month)
  const dayR     = reduceDigit(profile.day)
  const yearR    = reduceDigit(digitSum(profile.year))
  const lifePath = reduceDigit(monthR + dayR + yearR)
  const expression = profile.name?.trim() ? calcExpressionNumber(profile.name) : null
  const pool     = buildPersonalPool(profile)

  if (n === lifePath)                        return 'life-path'
  if (expression !== null && n === expression) return 'expression'
  if (pool.includes(n))                      return 'personal'
  return 'fill'
}

/**
 * Generate several independent personal lines at once.
 */
export function generatePersonalLines({ count, min, max, profile }, lineCount = 1) {
  return Array.from({ length: lineCount }, () => ({
    id: crypto.randomUUID(),
    numbers: generatePersonalLine({ count, min, max, profile }),
  }))
}
