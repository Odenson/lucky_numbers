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
    historyMode: false,
    onHistoryModeChange: vi.fn(),
    historyBias: 'hot',
    onHistoryBiasChange: vi.fn(),
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
    const personalSwitch = (utils) => utils.getByRole('switch', { name: 'Personal lucky numbers' })

    it('toggle is disabled when profileComplete is false', () => {
      const utils = renderControls({ profileComplete: false })
      expect(personalSwitch(utils)).toBeDisabled()
    })

    it('toggle is enabled when profileComplete is true', () => {
      const utils = renderControls({ profileComplete: true })
      expect(personalSwitch(utils)).not.toBeDisabled()
    })

    it('clicking toggle calls onPersonalModeChange with true when off', () => {
      const onPersonalModeChange = vi.fn()
      const utils = renderControls({ profileComplete: true, personalMode: false, onPersonalModeChange })
      fireEvent.click(personalSwitch(utils))
      expect(onPersonalModeChange).toHaveBeenCalledWith(true)
    })

    it('clicking toggle calls onPersonalModeChange with false when on', () => {
      const onPersonalModeChange = vi.fn()
      const utils = renderControls({ profileComplete: true, personalMode: true, onPersonalModeChange })
      fireEvent.click(personalSwitch(utils))
      expect(onPersonalModeChange).toHaveBeenCalledWith(false)
    })

    it('clicking disabled toggle does not call onPersonalModeChange', () => {
      const onPersonalModeChange = vi.fn()
      const utils = renderControls({ profileComplete: false, onPersonalModeChange })
      fireEvent.click(personalSwitch(utils))
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

  describe('history mode toggle', () => {
    const historySwitch = (utils) => utils.getByRole('switch', { name: 'Historical weighting' })

    it('renders the history toggle', () => {
      const utils = renderControls()
      expect(historySwitch(utils)).toBeInTheDocument()
    })

    it('toggle is always enabled', () => {
      const utils = renderControls()
      expect(historySwitch(utils)).not.toBeDisabled()
    })

    it('clicking toggle calls onHistoryModeChange with true when off', () => {
      const onHistoryModeChange = vi.fn()
      const utils = renderControls({ historyMode: false, onHistoryModeChange })
      fireEvent.click(historySwitch(utils))
      expect(onHistoryModeChange).toHaveBeenCalledWith(true)
    })

    it('clicking toggle calls onHistoryModeChange with false when on', () => {
      const onHistoryModeChange = vi.fn()
      const utils = renderControls({ historyMode: true, onHistoryModeChange })
      fireEvent.click(historySwitch(utils))
      expect(onHistoryModeChange).toHaveBeenCalledWith(false)
    })

    it('bias chips are hidden when history mode is off', () => {
      const { queryByRole } = renderControls({ historyMode: false })
      expect(queryByRole('group', { name: 'Weighting bias' })).not.toBeInTheDocument()
    })

    it('bias chips are visible when history mode is on', () => {
      const { getByRole } = renderControls({ historyMode: true })
      expect(getByRole('group', { name: 'Weighting bias' })).toBeInTheDocument()
    })

    it('clicking a bias chip calls onHistoryBiasChange', () => {
      const onHistoryBiasChange = vi.fn()
      const { getByRole } = renderControls({ historyMode: true, onHistoryBiasChange })
      fireEvent.click(getByRole('button', { name: /Cold/i }))
      expect(onHistoryBiasChange).toHaveBeenCalledWith('cold')
    })

    it('selected bias chip has pressed state', () => {
      const { getByRole } = renderControls({ historyMode: true, historyBias: 'balanced' })
      expect(getByRole('button', { name: /Balanced/i })).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
