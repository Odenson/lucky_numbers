import { describe, it, expect } from 'vitest'
import { ballColor, personalBallColor } from './palette'

// ─── ballColor ────────────────────────────────────────────────────────────────

describe('ballColor', () => {
  it('returns an array of two strings (bg, fg)', () => {
    const result = ballColor(1, 1, 42)
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
    expect(typeof result[0]).toBe('string')
    expect(typeof result[1]).toBe('string')
  })

  it('bg colour looks like a hex colour', () => {
    const [bg] = ballColor(5, 1, 49)
    expect(bg).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('fg colour looks like a hex colour', () => {
    const [, fg] = ballColor(5, 1, 49)
    expect(fg).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('min value maps to a colour (first bucket)', () => {
    const result = ballColor(1, 1, 49)
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toBeTruthy()
  })

  it('max value maps to a colour (last bucket — coral)', () => {
    const [bg] = ballColor(49, 1, 49)
    expect(bg).toBe('#D85A30')
  })

  it('different values in the range can produce different colours', () => {
    const [bg1] = ballColor(1, 1, 49)
    const [bg6] = ballColor(49, 1, 49)
    expect(bg1).not.toBe(bg6)
  })
})

// ─── personalBallColor ────────────────────────────────────────────────────────

describe('personalBallColor', () => {
  it('"life-path" returns yellow [#F0C52A, #2C1A00]', () => {
    expect(personalBallColor('life-path')).toEqual(['#F0C52A', '#2C1A00'])
  })

  it('"expression" returns green [#16A34A, #DCFCE7]', () => {
    expect(personalBallColor('expression')).toEqual(['#16A34A', '#DCFCE7'])
  })

  it('"personal" returns purple [#534AB7, #EEEDFE]', () => {
    expect(personalBallColor('personal')).toEqual(['#534AB7', '#EEEDFE'])
  })

  it('"fill" returns null (ghost style handled by CSS)', () => {
    expect(personalBallColor('fill')).toBeNull()
  })

  it('unknown type returns null', () => {
    expect(personalBallColor('unknown-type')).toBeNull()
    expect(personalBallColor('')).toBeNull()
  })
})
