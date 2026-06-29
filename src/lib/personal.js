// Numerology engine for personal lucky number generation.
//
// Implements Option 3 — multi-component pool (DOB + Expression Number):
//   · Core personal numbers are derived from the user's date of birth and
//     full birth name using the Pythagorean system.
//   · Numbers that fall inside the configured range are included first,
//     in order of numerological significance.
//   · Any remaining slots are filled with a cryptographically-strong
//     random draw, keeping each generation fresh.

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

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

// ─── Personal numbers breakdown ───────────────────────────────────────────────

/**
 * Build a structured breakdown of all derived personal numbers for display.
 *
 * Each item contains:
 *   { type, label, value, isMaster, formula, meaning }
 *
 * Only numbers that are unique and present in the personal pool are included.
 * Items are ordered: Life Path → Expression → remaining personal components.
 */
export function buildPersonalBreakdown({ name, day, month, year }) {
  const monthR      = reduceDigit(month)
  const dayR        = reduceDigit(day)
  const yearDigits  = digitSum(year)
  const yearR       = reduceDigit(yearDigits)
  const lifePathRaw = monthR + dayR + yearR
  const lifePath    = reduceDigit(lifePathRaw)
  const attitudeRaw = month + day
  const attitude    = reduceDigit(attitudeRaw)
  const expression  = name?.trim() ? calcExpressionNumber(name) : null
  const pool        = buildPersonalPool({ name, day, month, year })

  const isMaster  = (n) => n === 11 || n === 22 || n === 33
  const sumStr    = (raw, result) => raw === result ? String(result) : `${raw} → ${result}`

  // ── Expression formula: "Word1(n) + Word2(n) = total → result" ──
  let expressionFormula = null
  if (name?.trim() && expression !== null) {
    const parts    = name.trim().split(/\s+/).filter((p) => p.length > 0)
    const wordVals = parts.map((p) => ({ word: p, val: reduceDigit(namePartSum(p)) }))
    const total    = wordVals.reduce((s, w) => s + w.val, 0)
    const wordStr  = wordVals.map((w) => `${w.word}(${w.val})`).join(' + ')
    expressionFormula = `${wordStr} = ${sumStr(total, expression)}`
  }

  const items  = []
  const added  = new Set()

  // Life Path — always shown
  items.push({
    type:    'life-path',
    label:   'Life Path',
    value:   lifePath,
    isMaster: isMaster(lifePath),
    formula: `${monthR} + ${dayR} + ${yearR} = ${sumStr(lifePathRaw, lifePath)}`,
    meaning: 'The most significant number — the core traits and direction of your life\'s journey.',
  })
  added.add(lifePath)

  // Expression — only when a name is provided
  if (expression !== null) {
    items.push({
      type:    'expression',
      label:   'Expression',
      value:   expression,
      isMaster: isMaster(expression),
      formula: expressionFormula,
      meaning: 'Derived from your full name — your natural talents and the person you are becoming.',
    })
    added.add(expression)
  }

  // Remaining personal components — added only if present in pool and not yet shown
  const candidates = [
    {
      value:   day,
      label:   'Birthday',
      formula: `Birth day ${day}`,
      meaning: 'Your raw birth day — the gifts and traits you were born with.',
    },
    {
      value:   attitude,
      label:   'Attitude',
      formula: `${month} + ${day} = ${sumStr(attitudeRaw, attitude)}`,
      meaning: 'How you instinctively present yourself and create first impressions.',
    },
    {
      value:   dayR,
      label:   'Day',
      formula: day === dayR ? `Birth day ${day}` : `${day} → ${dayR}`,
      meaning: 'The numerological essence of your birth day.',
    },
    {
      value:   monthR,
      label:   'Month',
      formula: month === monthR
        ? `${MONTH_NAMES[month - 1]} (${month})`
        : `${month} → ${monthR}`,
      meaning: 'The energy of the month you were born into.',
    },
    {
      value:   yearR,
      label:   'Year',
      formula: yearDigits === yearR
        ? `${year} → ${yearDigits}`
        : `${year} → ${yearDigits} → ${yearR}`,
      meaning: 'The essence of the year you were born.',
    },
    {
      value:   month,
      label:   'Birth Month',
      formula: `${MONTH_NAMES[month - 1]} (${month})`,
      meaning: 'The raw energy of your birth month.',
    },
  ]

  for (const c of candidates) {
    if (pool.includes(c.value) && !added.has(c.value)) {
      items.push({ ...c, type: 'personal', isMaster: isMaster(c.value) })
      added.add(c.value)
    }
  }

  return items
}
