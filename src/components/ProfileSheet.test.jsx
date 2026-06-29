import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import ProfileSheet from './ProfileSheet'

const PROFILE = { name: 'Alex Johnson', day: 15, month: 6, year: 1988, city: 'London', country: 'UK', state: '' }

function renderSheet(overrides = {}) {
  const props = {
    open: true,
    profile: null,
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }
  return { ...render(<ProfileSheet {...props} />), ...props }
}

describe('ProfileSheet', () => {
  it('renders nothing when open is false', () => {
    const { queryByRole } = renderSheet({ open: false })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open is true', () => {
    const { getByRole } = renderSheet()
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('pre-fills fields from the profile prop', () => {
    const { getByDisplayValue } = renderSheet({ profile: PROFILE })
    expect(getByDisplayValue('Alex Johnson')).toBeInTheDocument()
    expect(getByDisplayValue('London')).toBeInTheDocument()
    expect(getByDisplayValue('UK')).toBeInTheDocument()
  })

  it('save button is disabled when name is empty', () => {
    const { getByText } = renderSheet({ profile: null })
    expect(getByText('Save profile').closest('button')).toBeDisabled()
  })

  it('save button is enabled after typing a name', () => {
    const { getByPlaceholderText, getByText } = renderSheet()
    fireEvent.change(getByPlaceholderText('Alex Johnson'), { target: { value: 'Gary' } })
    expect(getByText('Save profile').closest('button')).not.toBeDisabled()
  })

  it('clicking save calls onSave with the draft and then onClose', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const { getByPlaceholderText, getByText } = renderSheet({ onSave, onClose })
    fireEvent.change(getByPlaceholderText('Alex Johnson'), { target: { value: 'Gary' } })
    fireEvent.click(getByText('Save profile'))
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0]).toMatchObject({ name: 'Gary' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('clicking cancel calls onClose without saving', () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const { getByText } = renderSheet({ onSave, onClose })
    fireEvent.click(getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('clicking the backdrop calls onClose', () => {
    const onClose = vi.fn()
    const { container } = renderSheet({ onClose })
    fireEvent.click(container.querySelector('.sheet-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('clicking inside the sheet does not close it', () => {
    const onClose = vi.fn()
    const { getByRole } = renderSheet({ onClose })
    fireEvent.click(getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('location fields are rendered', () => {
    const { getByLabelText } = renderSheet()
    expect(getByLabelText('City')).toBeInTheDocument()
    expect(getByLabelText('Country')).toBeInTheDocument()
  })

  describe('date validation', () => {
    it('day max is capped at 28 for February in a non-leap year', () => {
      const { getByRole } = renderSheet({ profile: { ...PROFILE, month: 2, year: 2023, day: 28 } })
      const dayIncrease = getByRole('button', { name: /Increase Day/i })
      expect(dayIncrease).toBeDisabled()
    })

    it('day 31 is valid in January', () => {
      const { getByRole } = renderSheet({ profile: { ...PROFILE, month: 1, year: 2023, day: 31 } })
      const dayIncrease = getByRole('button', { name: /Increase Day/i })
      expect(dayIncrease).toBeDisabled()
    })

    it('day is clamped when month changes to a shorter month', () => {
      const { getByRole, getAllByRole } = renderSheet({
        profile: { ...PROFILE, month: 1, year: 2023, day: 31 },
      })
      // Click minus on Month to get to... wait, month starts at 1 (Jan).
      // Click plus on Month to move to February (max day = 28).
      const monthIncrease = getByRole('button', { name: /Increase Month/i })
      fireEvent.click(monthIncrease)
      // After switching to Feb, day should be clamped from 31 to 28.
      const dayIncreaseAfter = getByRole('button', { name: /Increase Day/i })
      expect(dayIncreaseAfter).toBeDisabled()
    })
  })
})
