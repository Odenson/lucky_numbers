import tattslottoData from '../data/tattslotto-history.json'
import ozlottoData from '../data/ozlotto-history.json'
import { randomInt, shuffle } from './random'

const GAME_DATA = {
  tattslotto: tattslottoData,
  ozlotto: ozlottoData,
}

function rawFor(gameId = 'tattslotto') {
  return GAME_DATA[gameId] ?? GAME_DATA.tattslotto
}

// Backwards-compatible export: tattslotto meta (used by HistorySheet default).
export const META = buildMeta('tattslotto')

export function getGameMeta(gameId = 'tattslotto') {
  return buildMeta(gameId)
}

function buildMeta(gameId) {
  const raw = rawFor(gameId)
  return {
    game: raw.meta.game,
    updated: raw.meta.updated,
    drawCount: raw.draws.length,
    from: raw.draws.at(-1)?.date ?? '',
    to: raw.draws[0]?.date ?? '',
  }
}

// Module-level cache keyed by `gameId:min-max` — draws are static.
const _freqCache = new Map()

export function computeFrequency(min, max, gameId = 'tattslotto') {
  const key = `${gameId}:${min}-${max}`
  if (_freqCache.has(key)) return _freqCache.get(key)
  const raw = rawFor(gameId)
  const freq = {}
  for (let n = min; n <= max; n++) freq[n] = 0
  for (const draw of raw.draws) {
    for (const n of draw.numbers) {
      if (n >= min && n <= max) freq[n]++
    }
  }
  _freqCache.set(key, freq)
  return freq
}

// Cache keyed by `gameId:min-max:qN` — quarter is 0-3 (Q1=0 … Q4=3).
const _seasonalCache = new Map()

export function computeSeasonalFrequency(min, max, gameId = 'tattslotto', quarter) {
  const key = `${gameId}:${min}-${max}:q${quarter}`
  if (_seasonalCache.has(key)) return _seasonalCache.get(key)
  const raw = rawFor(gameId)
  const freq = {}
  for (let n = min; n <= max; n++) freq[n] = 0
  for (const draw of raw.draws) {
    const month = new Date(draw.date + 'T00:00:00').getMonth() // 0-11
    if (Math.floor(month / 3) !== quarter) continue
    for (const n of draw.numbers) {
      if (n >= min && n <= max) freq[n]++
    }
  }
  _seasonalCache.set(key, freq)
  return freq
}

/** Returns the top `count` numbers for the current calendar quarter. */
export function getSeasonalNumbers(min, max, gameId = 'tattslotto', quarter, count = 10) {
  const freq = computeSeasonalFrequency(min, max, gameId, quarter)
  return getHotNumbers(freq, count)
}

/** 0-3 index of the current calendar quarter. */
export function currentQuarter() {
  return Math.floor(new Date().getMonth() / 3)
}

export function getHotNumbers(freq, count = 10) {
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([n]) => Number(n))
}

export function getColdNumbers(freq, count = 10) {
  return Object.entries(freq)
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(([n]) => Number(n))
}

export function getHistoryNumberType(n, hotSet, coldSet, seasonalSet = null) {
  if (seasonalSet?.has(n)) return 'seasonal'
  if (hotSet.has(n)) return 'hot'
  if (coldSet.has(n)) return 'cold'
  return undefined
}

// Numbers in the mid-frequency range — not in the hot or cold sets.
export function getBalancedNumbers(freq, hotSet, coldSet) {
  return Object.keys(freq).map(Number).filter((n) => !hotSet.has(n) && !coldSet.has(n))
}

/**
 * Generate the deterministic first line based on active modes.
 *
 * personalSeed  – ordered personal numbers already in range (may be []).
 * bias          – 'hot' | 'cold' | 'balanced' (ignored when historyStats is null).
 * historyStats  – { hotSet, coldSet, seasonalSet, quarter } or null.
 * seasonalBoost – when true, seasonal numbers in the fill pool are drawn first.
 *
 * Fill rules for remaining slots after personal numbers are placed:
 *   hot      → draw from hotSet
 *   cold     → draw from coldSet
 *   balanced → draw from mid-frequency numbers (neither hot nor cold)
 *   no history → draw at random from remaining range
 *
 * If the chosen fill pool runs dry, remaining slots fall back to random from full range.
 */
export function generatePinnedLine({
  count,
  min,
  max,
  personalSeed = [],
  bias = 'hot',
  historyStats = null,
  gameId = 'tattslotto',
  seasonalBoost = false,
}) {
  const usedSet = new Set(personalSeed.slice(0, count))
  const result  = [...usedSet]
  const needed  = count - result.length

  if (needed > 0) {
    let fillPool = []

    if (historyStats) {
      const { hotSet, coldSet, seasonalSet } = historyStats
      if (bias === 'hot') {
        fillPool = [...hotSet].filter((n) => !usedSet.has(n) && n >= min && n <= max)
      } else if (bias === 'cold') {
        fillPool = [...coldSet].filter((n) => !usedSet.has(n) && n >= min && n <= max)
      } else {
        const freq = computeFrequency(min, max, gameId)
        fillPool = getBalancedNumbers(freq, hotSet, coldSet).filter(
          (n) => !usedSet.has(n) && n >= min && n <= max,
        )
      }

      // Seasonal boost: pick seasonal members of the fill pool first.
      if (seasonalBoost && seasonalSet?.size) {
        const seasonal = shuffle(fillPool.filter((n) => seasonalSet.has(n)))
        const rest     = shuffle(fillPool.filter((n) => !seasonalSet.has(n)))
        fillPool = [...seasonal, ...rest]
      } else {
        fillPool = shuffle(fillPool)
      }
    } else {
      for (let n = min; n <= max; n++) {
        if (!usedSet.has(n)) fillPool.push(n)
      }
      fillPool = shuffle(fillPool)
    }

    for (const n of fillPool.slice(0, needed)) {
      result.push(n)
      usedSet.add(n)
    }

    // Fallback if fill pool was exhausted (e.g. all hot numbers already used by personal)
    if (result.length < count) {
      const fallback = []
      for (let n = min; n <= max; n++) {
        if (!usedSet.has(n)) fallback.push(n)
      }
      for (const n of shuffle(fallback)) {
        if (result.length >= count) break
        result.push(n)
      }
    }
  }

  return result.sort((a, b) => a - b)
}

function buildWeightArray(pool, freq, bias) {
  const values = pool.map((n) => freq[n] ?? 0)
  const maxF = Math.max(...values)
  const minF = Math.min(...values)
  const span = maxF - minF || 1
  return pool.map((n) => {
    const norm = ((freq[n] ?? 0) - minF) / span
    if (bias === 'hot') return 0.1 + 0.9 * norm
    if (bias === 'cold') return 0.1 + 0.9 * (1 - norm)
    return 1
  })
}

function weightedSampleWithoutReplacement(pool, weights, count) {
  const remaining = [...pool]
  const remainingW = [...weights]
  const selected = []
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const scaled = remainingW.map((w) => Math.max(1, Math.round(w * 100_000)))
    const total = scaled.reduce((a, b) => a + b, 0)
    const r = randomInt(0, total - 1)
    let cumulative = 0
    let chosen = remaining.length - 1
    for (let j = 0; j < remaining.length; j++) {
      cumulative += scaled[j]
      if (r < cumulative) { chosen = j; break }
    }
    selected.push(remaining[chosen])
    remaining.splice(chosen, 1)
    remainingW.splice(chosen, 1)
  }
  return selected
}

export function generateWeightedLine({
  count, min, max, bias = 'hot', sorted = true,
  gameId = 'tattslotto', quarter = null,
  seasonalBoost = false, seasonalSet = null,
}) {
  const freq = computeFrequency(min, max, gameId)
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  let weights = buildWeightArray(pool, freq, bias)
  // Seasonal boost: double the weight of this quarter's hot numbers.
  if (seasonalBoost && seasonalSet?.size) {
    weights = weights.map((w, i) => (seasonalSet.has(pool[i]) ? w * 2 : w))
  }
  const numbers = weightedSampleWithoutReplacement(pool, weights, count)
  return sorted ? numbers.sort((a, b) => a - b) : numbers
}

export function generateWeightedLines(
  { count, min, max, bias, gameId = 'tattslotto', quarter = null, seasonalBoost = false, seasonalSet = null },
  lineCount,
) {
  return Array.from({ length: lineCount }, (_, i) => ({
    id: `h-${Date.now()}-${i}`,
    numbers: generateWeightedLine({ count, min, max, bias, gameId, quarter, seasonalBoost, seasonalSet }),
  }))
}
