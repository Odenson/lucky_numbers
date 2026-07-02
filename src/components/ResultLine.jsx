import { useState } from 'react'
import Ball from './Ball'
import { getPersonalNumberType } from '../lib/personal'
import { getHistoryNumberType } from '../lib/history'

// Resolve ball type with correct priority:
//   personal-typed numbers always keep their colour.
//   fill slots in personal mode (or all slots in history-only mode) show
//   hot/cold when history is active, neutral ghost otherwise.
//   No mode → undefined → range-based Stage 1 colours.
function resolveBallType(n, { personalMode, profile, historyMode, historyStats }) {
  if (personalMode && profile) {
    const pType = getPersonalNumberType(n, profile)
    if (pType !== 'fill') return pType
    // fill slot — promote to hot/cold if history is also on
    if (historyMode && historyStats) {
      return getHistoryNumberType(n, historyStats.hotSet, historyStats.coldSet, historyStats.activeSets) ?? 'fill'
    }
    return 'fill'
  }
  if (historyMode && historyStats) {
    // neutral numbers become 'fill' (ghost), not random range colours
    return getHistoryNumberType(n, historyStats.hotSet, historyStats.coldSet, historyStats.activeSets) ?? 'fill'
  }
  return undefined // Stage 1: range-based jewel colours
}

// One generated line of balls with copy / share actions.
export default function ResultLine({ numbers, min, max, label, profile, personalMode, historyMode, historyStats }) {
  const [copied, setCopied] = useState(false)
  const text = numbers.join(', ')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard blocked — fall back to a hidden textarea selection.
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const share = async () => {
    const shareData = { title: 'Lucky Numbers', text: `My lucky numbers: ${text}` }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    } else {
      copy()
    }
  }

  return (
    <li className="result-line">
      <span className="result-line-label">{label}</span>
      <div className="result-balls">
        {numbers.map((n, i) => (
          <Ball
            key={`${n}-${i}`}
            value={n}
            min={min}
            max={max}
            index={i}
            type={resolveBallType(n, { personalMode, profile, historyMode, historyStats })}
          />
        ))}
      </div>
      <div className="result-actions">
        <button type="button" onClick={copy} aria-label="Copy this line">
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button type="button" onClick={share} aria-label="Share this line">
          <ShareIcon />
          <span>Share</span>
        </button>
      </div>
    </li>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  )
}
