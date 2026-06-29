import { useState, useEffect } from 'react'
import Stepper from './Stepper'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CURRENT_YEAR = new Date().getFullYear()

const EMPTY_DRAFT = { name: '', day: 1, month: 1, year: 1990, city: '', country: '' }

export default function ProfileSheet({ open, profile, onSave, onClose }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  // Re-seed the draft each time the sheet opens so edits don't linger.
  useEffect(() => {
    if (open) setDraft(profile ?? EMPTY_DRAFT)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const isComplete =
    draft.name.trim().length > 0 &&
    draft.city.trim().length > 0 &&
    draft.country.trim().length > 0

  const handleSave = () => {
    if (!isComplete) return
    onSave(draft)
    onClose()
  }

  if (!open) return null

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
            <span>Your Profile</span>
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
              max={31}
              onChange={(day) => set({ day })}
            />
            <Stepper
              label="Month"
              value={draft.month}
              min={1}
              max={12}
              onChange={(month) => set({ month })}
              formatValue={(v) => MONTHS[v - 1]}
            />
            <Stepper
              label="Year"
              value={draft.year}
              min={1900}
              max={CURRENT_YEAR}
              onChange={(year) => set({ year })}
            />
          </div>

          <label className="field-label" htmlFor="profile-city">City of birth</label>
          <input
            id="profile-city"
            className="field-input"
            type="text"
            value={draft.city}
            onChange={(e) => set({ city: e.target.value })}
            placeholder="London"
            autoComplete="address-level2"
          />

          <label className="field-label" htmlFor="profile-country">Country of birth</label>
          <input
            id="profile-country"
            className="field-input"
            type="text"
            value={draft.country}
            onChange={(e) => set({ country: e.target.value })}
            placeholder="United Kingdom"
            autoComplete="country-name"
          />

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
