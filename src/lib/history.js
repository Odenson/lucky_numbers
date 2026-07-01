import tattslottoData from '../data/tattslotto-history.json'
import ozlottoData from '../data/ozlotto-history.json'
import { randomInt } from './random'

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

export function getHistoryNumberType(n, hotSet, coldSet) {
  if (hotSet.has(n)) return 'hot'
  if (coldSet.has(n)) return 'cold'
  return undefined
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

export function generateWeightedLine({ count, min, max, bias = 'hot', sorted = true, gameId = 'tattslotto' }) {
  const freq = computeFrequency(min, max, gameId)
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const weights = buildWeightArray(pool, freq, bias)
  const numbers = weightedSampleWithoutReplacement(pool, weights, count)
  return sorted ? numbers.sort((a, b) => a - b) : numbers
}

export function generateWeightedLines({ count, min, max, bias, gameId = 'tattslotto' }, lineCount) {
  return Array.from({ length: lineCount }, (_, i) => ({
    id: `h-${Date.now()}-${i}`,
    numbers: generateWeightedLine({ count, min, max, bias, gameId }),
  }))
}
