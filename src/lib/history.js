import rawData from '../data/tatts-history.json'
import { randomInt } from './random'

export const META = {
  game: rawData.meta.game,
  updated: rawData.meta.updated,
  drawCount: rawData.draws.length,
  from: rawData.draws.at(-1)?.date ?? '',
  to: rawData.draws[0]?.date ?? '',
}

// Module-level cache — draws are static, so this is safe.
const _freqCache = new Map()

export function computeFrequency(min, max) {
  const key = `${min}-${max}`
  if (_freqCache.has(key)) return _freqCache.get(key)
  const freq = {}
  for (let n = min; n <= max; n++) freq[n] = 0
  for (const draw of rawData.draws) {
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

// Returns 'hot' | 'cold' | undefined for ball colouring in results.
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
    const norm = ((freq[n] ?? 0) - minF) / span // 0..1
    if (bias === 'hot') return 0.1 + 0.9 * norm
    if (bias === 'cold') return 0.1 + 0.9 * (1 - norm)
    return 1 // balanced
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

export function generateWeightedLine({ count, min, max, bias = 'hot', sorted = true }) {
  const freq = computeFrequency(min, max)
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const weights = buildWeightArray(pool, freq, bias)
  const numbers = weightedSampleWithoutReplacement(pool, weights, count)
  return sorted ? numbers.sort((a, b) => a - b) : numbers
}

export function generateWeightedLines({ count, min, max, bias }, lineCount) {
  return Array.from({ length: lineCount }, (_, i) => ({
    id: `h-${Date.now()}-${i}`,
    numbers: generateWeightedLine({ count, min, max, bias }),
  }))
}
