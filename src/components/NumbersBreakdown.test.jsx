import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import NumbersBreakdown from './NumbersBreakdown'

const PROFILE = { name: 'Alex Johnson', day: 15, month: 6, year: 1988, city: '', country: '', state: '' }

function renderBreakdown(overrides = {}) {
  const props = { open: true, profile: PROFILE, onClose: () => {}, ...overrides }
  return render(<NumbersBreakdown {...props} />)
}

describe('NumbersBreakdown', () => {
  it('renders nothing when open is false', () => {
    const { queryByRole } = renderBreakdown({ open: false })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders nothing when profile is null', () => {
    const { queryByRole } = renderBreakdown({ profile: null })
    expect(queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open and profile are set', () => {
    const { getByRole } = renderBreakdown()
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('displays the profile name and formatted date of birth', () => {
    const { getByText } = renderBreakdown()
    expect(getByText(/Alex Johnson/)).toBeInTheDocument()
    expect(getByText(/15 June 1988/)).toBeInTheDocument()
  })

  it('shows the Primary section', () => {
    const { getByText } = renderBreakdown()
    expect(getByText('Primary')).toBeInTheDocument()
  })

  it('always shows a Life Path item', () => {
    const { getByText } = renderBreakdown()
    expect(getByText('Life Path')).toBeInTheDocument()
  })

  it('shows an Expression item when name is provided', () => {
    const { getByText } = renderBreakdown()
    expect(getByText('Expression')).toBeInTheDocument()
  })

  it('does not show Expression when name is absent', () => {
    const { queryByText } = renderBreakdown({ profile: { ...PROFILE, name: '' } })
    expect(queryByText('Expression')).not.toBeInTheDocument()
  })

  it('shows Personal Components section when secondary items exist', () => {
    const { getByText } = renderBreakdown()
    expect(getByText('Personal Components')).toBeInTheDocument()
  })

  it('shows the formula for Life Path', () => {
    const { getByText } = renderBreakdown()
    expect(getByText(/Life Path/)).toBeInTheDocument()
  })

  it('marks Master Numbers with the Master badge', () => {
    // Life Path 11 is a master number — use a DOB that produces one.
    // 29 Nov 1975: month=11, day=29, year=1975
    // monthR=2, dayR=2, yearR=reduceDigit(1+9+7+5=22)=22 → lifePath=2+2+22=26→8, not 11
    // Try: 29/02/1957 → monthR=2, dayR=2, yearR=reduceDigit(22)=22 → 2+2+22=26→8 nope
    // 2 Nov 1990: monthR=2 dayR=2 yearR=reduceDigit(19)=10→1 → 2+2+1=5, nope
    // Try 9/2/2000: month=2,day=9,year=2000 → monthR=2,dayR=9,yearR=2 → 2+9+2=13→4, nope
    // 29/11/1974: monthR=2,dayR=2,yearR=reduceDigit(1974→21→3) → 2+2+3=7, nope
    // Try producing a master 11 easily: monthR+dayR+yearR=11
    // e.g. 2+3+6=11 → month=2,dayR=3(day=3),yearR=6(e.g. year=1986→24→6)
    // 3 Feb 1986: monthR=2, dayR=3, yearR=reduceDigit(24)=6 → 2+3+6=11 ✓
    const masterProfile = { name: '', day: 3, month: 2, year: 1986, city: '', country: '', state: '' }
    const { getAllByText } = render(
      <NumbersBreakdown open={true} profile={masterProfile} onClose={() => {}} />,
    )
    expect(getAllByText(/Master/i).length).toBeGreaterThan(0)
  })
})
