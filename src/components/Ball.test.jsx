import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Ball from './Ball'

describe('Ball', () => {
  it('renders the numeric value', () => {
    const { getByText } = render(<Ball value={7} min={1} max={42} />)
    expect(getByText('7')).toBeInTheDocument()
  })

  it('animation delay is index * 60 ms', () => {
    const { getByText } = render(<Ball value={5} min={1} max={42} index={3} />)
    expect(getByText('5')).toHaveStyle({ animationDelay: '180ms' })
  })

  it('zero index gives 0ms delay', () => {
    const { getByText } = render(<Ball value={5} min={1} max={42} index={0} />)
    expect(getByText('5')).toHaveStyle({ animationDelay: '0ms' })
  })

  it('default (no type) renders with inline background colour', () => {
    const { getByText } = render(<Ball value={5} min={1} max={42} />)
    const el = getByText('5')
    expect(el.style.background).toBeTruthy()
  })

  it('type="fill" adds .ball--fill class', () => {
    const { getByText } = render(<Ball value={5} min={1} max={42} type="fill" />)
    expect(getByText('5')).toHaveClass('ball--fill')
  })

  it('type="fill" has no inline background colour', () => {
    const { getByText } = render(<Ball value={5} min={1} max={42} type="fill" />)
    expect(getByText('5').style.background).toBeFalsy()
  })

  it('type="life-path" does NOT add .ball--fill class', () => {
    const { getByText } = render(<Ball value={7} min={1} max={42} type="life-path" />)
    expect(getByText('7')).not.toHaveClass('ball--fill')
  })

  it('type="life-path" renders with amber inline background', () => {
    const { getByText } = render(<Ball value={7} min={1} max={42} type="life-path" />)
    // jsdom serialises hex colours as rgb() when reading back from .style
    expect(getByText('7').style.background).toBe('rgb(239, 159, 39)') // #EF9F27
  })

  it('type="expression" renders with teal inline background', () => {
    const { getByText } = render(<Ball value={11} min={1} max={42} type="expression" />)
    expect(getByText('11').style.background).toBe('rgb(29, 158, 117)') // #1D9E75
  })

  it('type="personal" renders with purple inline background', () => {
    const { getByText } = render(<Ball value={14} min={1} max={42} type="personal" />)
    expect(getByText('14').style.background).toBe('rgb(83, 74, 183)') // #534AB7
  })
})
