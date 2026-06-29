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

// Fisher-Yates shuffle using the crypto randomInt above.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Line generation ──────────────────────────────────────────────────────────

/**
 * Generate one personal line.
 *
 * `personalSeed` controls which personal numbers are included:
 *   null (default) — use the full in-range pool in priority order (line 1).
 *   number[]       — explicit subset to seed with (used for lines 2+).
 *
 * Personal numbers are placed first (up to `count`). Any remaining slots are
 * filled with unbiased crypto-random picks so each generation stays fresh.
 */
export function generatePersonalLine({ count, min, max, profile, sorted = true, personalSeed = null }) {
  const pool    = buildPersonalPool(profile)
  const inRange = pool.filter((n) => n >= min && n <= max)

  // Use the explicit seed when provided, otherwise the full priority-ordered pool.
  const seedNumbers = personalSeed !== null ? personalSeed : inRange

  // Seed with personal numbers (capped at count).
  const chosen = new Set(seedNumbers.slice(0, count))

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
 *
 * Line 1 always receives the full in-range personal pool (priority order).
 * Lines 2+ each receive a randomly-sized, randomly-shuffled subset of those
 * same personal numbers (strictly fewer than the full set), with the
 * remaining slots filled by a fresh crypto-random draw. This ensures every
 * subsequent line is varied while still carrying some personal influence.
 */
export function generatePersonalLines({ count, min, max, profile }, lineCount = 1) {
  const pool    = buildPersonalPool(profile)
  const inRange = pool.filter((n) => n >= min && n <= max)

  return Array.from({ length: lineCount }, (_, i) => {
    // Line 1 (i === 0): full priority-ordered personal seed — null triggers
    // the default path inside generatePersonalLine.
    // Lines 2+ (i > 0): a random subset of the in-range personal numbers,
    // with a count of 0 to (inRange.length − 1) so the line always differs
    // from line 1 in its personal number complement.
    let personalSeed = null
    if (i > 0 && inRange.length > 0) {
      const subsetCount = randomInt(0, inRange.length - 1)
      personalSeed = shuffle(inRange).slice(0, subsetCount)
    }
    return {
      id: crypto.randomUUID(),
      numbers: generatePersonalLine({ count, min, max, profile, personalSeed }),
    }
  })
}
