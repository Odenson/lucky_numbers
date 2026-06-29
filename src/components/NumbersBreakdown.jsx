import Ball from './Ball'
import { buildPersonalBreakdown } from '../lib/personal'
import { MONTH_NAMES } from '../lib/constants'

function formatDob({ day, month, year }) {
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`
}

export default function NumbersBreakdown({ open, profile, onClose }) {
  if (!open || !profile) return null

  const items = buildPersonalBreakdown(profile)

  // Split items into the two display sections
  const primary   = items.filter((i) => i.type === 'life-path' || i.type === 'expression')
  const secondary = items.filter((i) => i.type === 'personal')

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Your lucky numbers breakdown"
      >
        <div className="sheet-header">
          <div className="sheet-title">
            <GridIcon />
            <span>Your Lucky Numbers</span>
          </div>
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sheet-body">
          <p className="breakdown-profile">
            {profile.name} · {formatDob(profile)}
          </p>

          {primary.length > 0 && (
            <>
              <p className="breakdown-section-label">Primary</p>
              {primary.map((item) => (
                <BreakdownItem key={item.label} item={item} />
              ))}
            </>
          )}

          {secondary.length > 0 && (
            <>
              <p className="breakdown-section-label">Personal Components</p>
              {secondary.map((item) => (
                <BreakdownItem key={item.label} item={item} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function BreakdownItem({ item }) {
  return (
    <div className="breakdown-item">
      <div className="breakdown-ball">
        <Ball value={item.value} min={1} max={49} type={item.type} index={0} />
      </div>
      <div className="breakdown-info">
        <div className="breakdown-label-row">
          <span className="breakdown-label">{item.label}</span>
          {item.isMaster && <span className="breakdown-master">Master ✦</span>}
        </div>
        <span className="breakdown-formula">{item.formula}</span>
        <span className="breakdown-meaning">{item.meaning}</span>
      </div>
    </div>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
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
