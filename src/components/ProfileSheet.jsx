import { useState, useEffect } from 'react'
import Stepper from './Stepper'
import { MONTH_NAMES_SHORT } from '../lib/constants'

const CURRENT_YEAR = new Date().getFullYear()
const EMPTY_DRAFT = { name: '', day: 1, month: 1, year: 1990, city: '', country: '', state: '' }

// Returns the number of days in a given month/year (handles leap years).
function maxDayFor(month, year) {
  return new Date(year, month, 0).getDate()
}

export default function ProfileSheet({ open, profile, onSave, onClose }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  useEffect(() => {
    if (open) setDraft(profile ? { ...EMPTY_DRAFT, ...profile } : EMPTY_DRAFT)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const setMonth = (month) => {
    const newMax = maxDayFor(month, draft.year)
    set({ month, day: Math.min(draft.day, newMax) })
  }

  const setYear = (year) => {
    const newMax = maxDayFor(draft.month, year)
    set({ year, day: Math.min(draft.day, newMax) })
  }

  const isComplete = draft.name.trim().length > 0

  const handleSave = () => {
    if (!isComplete) return
    onSave(draft)
    onClose()
  }

  if (!open) return null

  const dayMax = maxDayFor(draft.month, draft.year)

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Your profile"
      >
        <div className="sheet-header">
          <div className="sheet-title">
            <PersonIcon />
            <span>Your profile</span>
          </div>
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sheet-body">
          <label className="field-label" htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            className="field-input"
            type="text"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Alex Johnson"
            autoComplete="name"
          />

          <label className="field-label">Date of birth</label>
          <div className="dob-grid">
            <Stepper
              label="Day"
              value={draft.day}
              min={1}
              max={dayMax}
              onChange={(day) => set({ day })}
            />
            <Stepper
              label="Month"
              value={draft.month}
              min={1}
              max={12}
              onChange={setMonth}
              formatValue={(v) => MONTH_NAMES_SHORT[v - 1]}
            />
          </div>
          <Stepper
            label="Year"
            value={draft.year}
            min={1900}
            max={CURRENT_YEAR}
            onChange={setYear}
            lazyClamp
          />

          <label className="field-label field-label--section">Place of birth</label>
          <p className="field-hint">Used for personalised number generation in a future update.</p>
          <label className="field-label" htmlFor="profile-city">City</label>
          <input
            id="profile-city"
            className="field-input"
            type="text"
            value={draft.city}
            onChange={(e) => set({ city: e.target.value })}
            placeholder="Rome"
            autoComplete="address-level2"
          />

          <div className="location-grid">
            <div>
              <label className="field-label" htmlFor="profile-country">Country</label>
              <input
                id="profile-country"
                className="field-input"
                type="text"
                value={draft.country}
                onChange={(e) => set({ country: e.target.value })}
                placeholder="Italy"
                autoComplete="country-name"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="profile-state">
                State / region
                <span className="field-optional"> (optional)</span>
              </label>
              <input
                id="profile-state"
                className="field-input"
                type="text"
                value={draft.state}
                onChange={(e) => set({ state: e.target.value })}
                placeholder="Lazio"
                autoComplete="address-level1"
              />
            </div>
          </div>

          <button
            type="button"
            className="generate-btn sheet-save-btn"
            onClick={handleSave}
            disabled={!isComplete}
          >
            <SaveIcon />
            Save profile
          </button>
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
