import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import Controls from './Controls'

const DEFAULT_CONFIG = { count: 7, min: 1, max: 42, lineCount: 1, allowRepeats: false }

function renderControls(overrides = {}) {
  const props = {
    config: DEFAULT_CONFIG,
    onChange: vi.fn(),
    error: null,
    personalMode: false,
    onPersonalModeChange: vi.fn(),
    profileComplete: false,
    ...overrides,
  }
  return { ...render(<Controls {...props} />), ...props }
}

describe('Controls', () => {
  it('renders the summary text with count and range', () => {
    const { getByText } = renderControls()
    expect(getByText(/7 numbers between 1 and 42/)).toBeInTheDocument()
  })

  it('shows pool size in the summary', () => {
    const { getByText } = renderControls()
    expect(getByText(/42 in the pool/)).toBeInTheDocument()
  })

  it('includes line count in summary when more than 1', () => {
    const { getByText } = renderControls({ config: { ...DEFAULT_CONFIG, lineCount: 3 } })
    expect(getByText(/3 lines/)).toBeInTheDocument()
  })

  it('does not show line count in summary when 1', () => {
    const { queryByText } = renderControls()
    expect(queryByText(/1 line/)).not.toBeInTheDocument()
  })

  it('displays an error message when error prop is set', () => {
    const { getByRole } = renderControls({ error: "Can't draw that many." })
    expect(getByRole('alert')).toHaveTextContent("Can't draw that many.")
  })

  it('does not render an error when error is null', () => {
    const { queryByRole } = renderControls()
    expect(queryByRole('alert')).not.toBeInTheDocument()
  })

  describe('personal mode toggle', () => {
    it('toggle is disabled when profileComplete is false', () => {
      const { getByRole } = renderControls({ profileComplete: false })
      expect(getByRole('switch')).toBeDisabled()
    })

    it('toggle is enabled when profileComplete is true', () => {
      const { getByRole } = renderControls({ profileComplete: true })
      expect(getByRole('switch')).not.toBeDisabled()
    })

    it('clicking toggle calls onPersonalModeChange with true when off', () => {
      const onPersonalModeChange = vi.fn()
      const { getByRole } = renderControls({ profileComplete: true, personalMode: false, onPersonalModeChange })
      fireEvent.click(getByRole('switch'))
      expect(onPersonalModeChange).toHaveBeenCalledWith(true)
    })

    it('clicking toggle calls onPersonalModeChange with false when on', () => {
      const onPersonalModeChange = vi.fn()
      const { getByRole } = renderControls({ profileComplete: true, personalMode: true, onPersonalModeChange })
      fireEvent.click(getByRole('switch'))
      expect(onPersonalModeChange).toHaveBeenCalledWith(false)
    })

    it('clicking disabled toggle does not call onPersonalModeChange', () => {
      const onPersonalModeChange = vi.fn()
      const { getByRole } = renderControls({ profileComplete: false, onPersonalModeChange })
      fireEvent.click(getByRole('switch'))
      expect(onPersonalModeChange).not.toHaveBeenCalled()
    })

    it('shows unlock hint when profile is not complete', () => {
      const { getByText } = renderControls({ profileComplete: false })
      expect(getByText('Add your profile to unlock')).toBeInTheDocument()
    })

    it('shows description text when profile is complete', () => {
      const { getByText } = renderControls({ profileComplete: true })
      expect(getByText('Based on your name & birth details')).toBeInTheDocument()
    })
  })
})
