// Core number-generation logic.
//
// Kept as pure functions with no React/DOM dependencies so that later stages
// (personal-detail seeding in stage 2, historical-pattern weighting in stage 3)
// can plug in by swapping the `pick` strategy without touching the UI.

import { randomInt } from './random.js'

/**
 * Generate a single line of lucky numbers.
 * @param {object} opts
 * @param {number} opts.count        how many numbers to draw
 * @param {number} opts.min          lowest possible number (inclusive)
 * @param {number} opts.max          highest possible number (inclusive)
 * @param {boolean} [opts.allowRepeats=false]
 * @param {boolean} [opts.sorted=true] return numbers in ascending order
 * @returns {number[]}
 */
export function generateLine({ count, min, max, allowRepeats = false, sorted = true }) {
  const numbers = []

  if (allowRepeats) {
    for (let i = 0; i < count; i++) numbers.push(randomInt(min, max))
  } else {
    const chosen = new Set()
    while (chosen.size < count) chosen.add(randomInt(min, max))
    numbers.push(...chosen)
  }

  return sorted ? numbers.sort((a, b) => a - b) : numbers
}

/**
 * Generate several independent lines at once.
 * @returns {{ id: string, numbers: number[] }[]}
 */
export function generateLines(opts, lineCount = 1) {
  return Array.from({ length: lineCount }, () => ({
    id: crypto.randomUUID(),
    numbers: generateLine(opts),
  }))
}

/**
 * Validate a configuration. Returns an error string, or null if valid.
 */
export function validateConfig({ count, min, max, allowRepeats, lineCount }) {
  if (!Number.isInteger(min) || !Number.isInteger(max)) return 'Range must be whole numbers.'
  if (min >= max) return 'The lowest number must be below the highest.'
  if (count < 1) return 'Draw at least one number.'
  if (lineCount < 1) return 'Generate at least one line.'
  const poolSize = max - min + 1
  if (!allowRepeats && count > poolSize) {
    return `Can't draw ${count} unique numbers from a pool of ${poolSize}.`
  }
  return null
}
