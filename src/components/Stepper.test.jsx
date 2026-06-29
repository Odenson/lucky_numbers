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
