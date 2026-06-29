import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Stepper from './Stepper'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function renderStepper(props) {
  const onChange = props.onChange ?? vi.fn()
  const utils = render(
    <Stepper
      label={props.label ?? 'Count'}
      value={props.value ?? 5}
      min={props.min ?? 1}
      max={props.max ?? 10}
      onChange={onChange}
      formatValue={props.formatValue}
      hint={props.hint}
    />,
  )
  return { ...utils, onChange }
}

describe('Stepper', () => {
  it('renders the label', () => {
    const { getByText } = renderStepper({ label: 'Numbers' })
    expect(getByText('Numbers')).toBeInTheDocument()
  })

  it('renders the current value', () => {
    const { getByDisplayValue } = renderStepper({ value: 7 })
    expect(getByDisplayValue('7')).toBeInTheDocument()
  })

  it('renders a hint when provided', () => {
    const { getByText } = renderStepper({ hint: 'Some hint' })
    expect(getByText('Some hint')).toBeInTheDocument()
  })

  it('minus button calls onChange with value - 1', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Stepper label="Count" value={5} min={1} max={10} onChange={onChange} />,
    )
    fireEvent.click(getByRole('button', { name: /Decrease/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('plus button calls onChange with value + 1', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Stepper label="Count" value={5} min={1} max={10} onChange={onChange} />,
    )
    fireEvent.click(getByRole('button', { name: /Increase/i }))
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('minus button is disabled at min', () => {
    const { getByRole } = renderStepper({ value: 1, min: 1, max: 10 })
    expect(getByRole('button', { name: /Decrease/i })).toBeDisabled()
  })

  it('plus button is disabled at max', () => {
    const { getByRole } = renderStepper({ value: 10, min: 1, max: 10 })
    expect(getByRole('button', { name: /Increase/i })).toBeDisabled()
  })

  it('minus is not disabled when above min', () => {
    const { getByRole } = renderStepper({ value: 5, min: 1, max: 10 })
    expect(getByRole('button', { name: /Decrease/i })).not.toBeDisabled()
  })

  it('plus is not disabled when below max', () => {
    const { getByRole } = renderStepper({ value: 5, min: 1, max: 10 })
    expect(getByRole('button', { name: /Increase/i })).not.toBeDisabled()
  })

  it('typing a valid number calls onChange with the clamped value', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Stepper label="Count" value={5} min={1} max={10} onChange={onChange} />,
    )
    fireEvent.change(getByRole('spinbutton'), { target: { value: '8' } })
    expect(onChange).toHaveBeenCalledWith(8)
  })

  it('clamps typed value to min when below range', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Stepper label="Count" value={5} min={1} max={10} onChange={onChange} />,
    )
    fireEvent.change(getByRole('spinbutton'), { target: { value: '-5' } })
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('clamps typed value to max when above range', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Stepper label="Count" value={5} min={1} max={10} onChange={onChange} />,
    )
    fireEvent.change(getByRole('spinbutton'), { target: { value: '99' } })
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('formatValue: displays the formatted string in the input', () => {
    const { getByDisplayValue } = renderStepper({
      value: 3,
      min: 1,
      max: 12,
      formatValue: (v) => MONTHS[v - 1],
    })
    expect(getByDisplayValue('Mar')).toBeInTheDocument()
  })

  it('formatValue: input is read-only', () => {
    const { getByRole } = renderStepper({
      value: 3,
      min: 1,
      max: 12,
      formatValue: (v) => MONTHS[v - 1],
    })
    // When formatValue is provided the input is type="text", not spinbutton.
    const input = getByRole('textbox', { name: /Count/i })
    expect(input).toHaveAttribute('readonly')
  })

  it('formatValue: minus/plus still call onChange with numeric steps', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Stepper
        label="Month"
        value={3}
        min={1}
        max={12}
        onChange={onChange}
        formatValue={(v) => MONTHS[v - 1]}
      />,
    )
    fireEvent.click(getByRole('button', { name: /Increase/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })
})

// ─── lazyClamp mode ───────────────────────────────────────────────────────────

describe('Stepper — lazyClamp mode', () => {
  function renderYear(value, onChange = vi.fn()) {
    const utils = render(
      <Stepper label="Year" value={value} min={1900} max={2026} onChange={onChange} lazyClamp />,
    )
    const input = utils.getByRole('textbox', { name: /Year/i })
    return { ...utils, input, onChange }
  }

  it('renders the current value as text', () => {
    const { input } = renderYear(1988)
    expect(input).toHaveValue('1988')
  })

  it('input is type="text" with inputMode="numeric"', () => {
    const { input } = renderYear(1988)
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'numeric')
  })

  it('typing does NOT call onChange immediately', () => {
    const { input, onChange } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '197' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('typing shows the in-progress value in the input', () => {
    const { input } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1975' } })
    expect(input).toHaveValue('1975')
  })

  it('onBlur commits the typed value and calls onChange', () => {
    const { input, onChange } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1975' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(1975)
  })

  it('onBlur clamps a value above max to max', () => {
    const { input, onChange } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '2099' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(2026)
  })

  it('onBlur clamps a value below min to min', () => {
    const { input, onChange } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1800' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(1900)
  })

  it('onBlur with non-numeric input falls back to the last committed value', () => {
    const { input, onChange } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(1990)
  })

  it('minus button decrements from the committed value when not editing', () => {
    const { onChange, getByRole } = renderYear(1990)
    fireEvent.click(getByRole('button', { name: /Decrease/i }))
    expect(onChange).toHaveBeenCalledWith(1989)
  })

  it('plus button increments from the committed value when not editing', () => {
    const { onChange, getByRole } = renderYear(1990)
    fireEvent.click(getByRole('button', { name: /Increase/i }))
    expect(onChange).toHaveBeenCalledWith(1991)
  })

  it('minus button uses the in-progress draft as the base', () => {
    const { input, onChange, getByRole } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1975' } })
    fireEvent.click(getByRole('button', { name: /Decrease/i }))
    expect(onChange).toHaveBeenCalledWith(1974)
  })

  it('plus button uses the in-progress draft as the base', () => {
    const { input, onChange, getByRole } = renderYear(1990)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '1975' } })
    fireEvent.click(getByRole('button', { name: /Increase/i }))
    expect(onChange).toHaveBeenCalledWith(1976)
  })

  it('minus is disabled at min', () => {
    const { getByRole } = renderYear(1900)
    expect(getByRole('button', { name: /Decrease/i })).toBeDisabled()
  })

  it('plus is disabled at max', () => {
    const { getByRole } = renderYear(2026)
    expect(getByRole('button', { name: /Increase/i })).toBeDisabled()
  })
})
