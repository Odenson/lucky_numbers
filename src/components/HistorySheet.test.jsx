import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import HistorySheet from './HistorySheet'

const DEFAULT_CONFIG = { count: 7, min: 1, max: 45, lineCount: 1, allowRepeats: false }

function renderSheet(overrides = {}) {
  const props = { open: true, onClose: vi.fn(), config: DEFAULT_CONFIG, ...overrides }
  return { ...render(<HistorySheet {...props} />), ...props }
}

describe('HistorySheet', () => {
  it('renders nothing when closed', () => {
    const { container } = renderSheet({ open: false })
    expect(container.firstChild).toBeNull()
  })

  it('renders the dialog when open', () => {
    const { getByRole } = renderSheet()
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('shows "Lotto History" title', () => {
    const { getByText } = renderSheet()
    expect(getByText('Lotto History')).toBeInTheDocument()
  })

  it('displays the draw count', () => {
    const { getByText } = renderSheet()
    expect(getByText(/draws/)).toBeInTheDocument()
  })

  it('shows hot and cold section labels', () => {
    const { getByText } = renderSheet()
    expect(getByText(/Hot · 10 most frequently drawn/)).toBeInTheDocument()
    expect(getByText(/Cold · 10 most overdue/)).toBeInTheDocument()
  })

  it('renders exactly 10 hot balls', () => {
    const { container } = renderSheet()
    expect(container.querySelectorAll('.mini-ball--hot')).toHaveLength(10)
  })

  it('renders exactly 10 cold balls', () => {
    const { container } = renderSheet()
    expect(container.querySelectorAll('.mini-ball--cold')).toHaveLength(10)
  })

  it('shows the frequency section', () => {
    const { getByText } = renderSheet()
    expect(getByText(/Frequency · 1–45/)).toBeInTheDocument()
  })

  it('renders a frequency row for every number in range', () => {
    const { container } = renderSheet()
    expect(container.querySelectorAll('.history-freq-row')).toHaveLength(45)
  })

  it('close button calls onClose', () => {
    const onClose = vi.fn()
    const { getByRole } = renderSheet({ onClose })
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('clicking the backdrop calls onClose', () => {
    const onClose = vi.fn()
    const { getByRole } = renderSheet({ onClose })
    fireEvent.click(getByRole('dialog').parentElement)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows the bundled badge', () => {
    const { getByText } = renderSheet()
    expect(getByText(/Bundled/)).toBeInTheDocument()
  })
})
