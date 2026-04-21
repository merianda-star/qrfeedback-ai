'use client'

import { useEffect, useState } from 'react'

type TourStep = {
  id: string
  title: string
  description: string
}

const TOUR_STEPS: TourStep[] = [
  { id: 'nav-overview',   title: '⊞ Overview',    description: 'Your command centre. See total responses, average ratings, and your forms at a glance.' },
  { id: 'nav-responses',  title: '◈ Responses',   description: 'View all customer feedback submitted via your QR codes. Filter by day, week, or month.' },
  { id: 'nav-analytics',  title: '◉ Analytics',   description: 'Track rating trends, response volume, and sentiment breakdown over time.' },
  { id: 'nav-ai-insights',title: '✦ AI Insights', description: 'AI-powered weekly summaries and complaint analysis. Available on Pro and Business plans.' },
  { id: 'nav-forms',      title: '▤ My Forms',    description: 'Create and manage your feedback forms. Each form gets its own QR code.' },
  { id: 'nav-questions',  title: '◎ Questions',   description: 'Customise the survey questions customers see when they scan your QR code.' },
  { id: 'nav-qr',         title: '⬛ QR Codes',   description: 'Download and customise your QR codes. Pro/Business users can change colours and styles.' },
  { id: 'nav-profile',    title: '👤 Profile',    description: 'Update your business name, Google Review URL, and manage your billing plan.' },
  { id: 'nav-settings',   title: '⚙ Settings',   description: 'Configure Review Shield, smart routing, and notification preferences.' },
]

export default function DashboardTour({ onComplete }: { onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  // Highlight whenever stepIndex changes — separate from visibility
  useEffect(() => {
    // Small delay ensures sidebar nav is fully painted
    const t = setTimeout(() => highlightStep(stepIndex), 150)
    return () => clearTimeout(t)
  }, [stepIndex])

  function highlightStep(idx: number) {
    const el = document.getElementById(TOUR_STEPS[idx].id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    // Wait for scroll to settle then measure
    setTimeout(() => {
      setTargetRect(el.getBoundingClientRect())
    }, 80)
  }

  function next() {
    if (stepIndex < TOUR_STEPS.length - 1) setStepIndex(s => s + 1)
    else finish()
  }

  function prev() {
    if (stepIndex > 0) setStepIndex(s => s - 1)
  }

  function finish() {
    onComplete()
  }

  const currentStep = TOUR_STEPS[stepIndex]
  const progressPct = Math.round(((stepIndex + 1) / TOUR_STEPS.length) * 100)

  // Tooltip positioning
  const TOOLTIP_W = 284
  const TOOLTIP_H = 168
  const GAP = 14

  let top = 200
  let left = 250

  if (targetRect) {
    top = targetRect.top + targetRect.height / 2 - TOOLTIP_H / 2
    left = targetRect.right + GAP
    if (top < 12) top = 12
    if (top + TOOLTIP_H > window.innerHeight - 12) top = window.innerHeight - TOOLTIP_H - 12
    if (left + TOOLTIP_W > window.innerWidth - 12) left = targetRect.left - TOOLTIP_W - GAP
  }

  const arrowTop = targetRect
    ? targetRect.top + targetRect.height / 2 - 8
    : top + TOOLTIP_H / 2 - 8

  return (
    <>
      <style>{`
        .tour-highlight {
          position: fixed; z-index: 8889; pointer-events: none;
          border-radius: 8px;
          transition: top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease;
          box-shadow:
            0 0 0 3px rgba(176,92,82,0.6),
            0 0 0 9999px rgba(42,31,29,0.5);
        }
        .tour-tooltip {
          position: fixed; z-index: 8890; pointer-events: all;
          width: ${TOOLTIP_W}px;
          background: #fff; border-radius: 14px;
          box-shadow: 0 8px 32px rgba(42,31,29,0.18);
          border: 1px solid #e8d5cf;
          overflow: hidden;
          transition: top 0.25s ease, left 0.25s ease;
          animation: tour-pop 0.2s ease;
        }
        @keyframes tour-pop {
          from { opacity: 0; transform: scale(0.95) }
          to   { opacity: 1; transform: scale(1) }
        }
        .tour-progress { height: 3px; background: #f0e4e0; }
        .tour-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #b05c52, #c4896a);
          transition: width 0.3s ease;
        }
        .tour-body { padding: 16px 18px 10px; }
        .tour-step-num {
          font-size: 0.6rem; font-weight: 700; color: #b09490;
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;
        }
        .tour-title {
          font-family: 'DM Serif Display', serif;
          font-size: 0.95rem; color: #2a1f1d; margin-bottom: 7px;
        }
        .tour-desc { font-size: 0.76rem; color: #7a5a56; line-height: 1.55; }
        .tour-footer {
          padding: 10px 18px 14px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .tour-skip {
          font-size: 0.7rem; color: #b09490; cursor: pointer;
          background: none; border: none;
          font-family: 'DM Sans', sans-serif; transition: color 0.15s;
        }
        .tour-skip:hover { color: #7a5a56; }
        .tour-nav { display: flex; gap: 6px; }
        .tour-back {
          padding: 6px 13px; border-radius: 7px;
          border: 1.5px solid #e8d5cf; background: transparent;
          font-size: 0.74rem; font-weight: 600; color: #7a5a56;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .tour-back:hover { border-color: #d9c2bb; color: #2a1f1d; }
        .tour-next {
          padding: 6px 16px; border-radius: 7px; border: none;
          background: #b05c52; color: #fff;
          font-size: 0.74rem; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .tour-next:hover { background: #8c3d34; }
        .tour-arrow {
          position: fixed; z-index: 8889; pointer-events: none;
          width: 0; height: 0;
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
          border-right: 9px solid #fff;
          filter: drop-shadow(-1px 0 1px rgba(42,31,29,0.12));
          transition: top 0.25s ease, left 0.25s ease;
        }
      `}</style>

      {/* Highlight ring */}
      {targetRect && (
        <div
          className="tour-highlight"
          style={{
            top:    targetRect.top    - 4,
            left:   targetRect.left   - 6,
            width:  targetRect.width  + 12,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Arrow */}
      <div
        className="tour-arrow"
        style={{ top: arrowTop, left: left - 9 }}
      />

      {/* Tooltip */}
      <div className="tour-tooltip" style={{ top, left }}>
        <div className="tour-progress">
          <div className="tour-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="tour-body">
          <div className="tour-step-num">{stepIndex + 1} of {TOUR_STEPS.length}</div>
          <div className="tour-title">{currentStep.title}</div>
          <div className="tour-desc">{currentStep.description}</div>
        </div>
        <div className="tour-footer">
          <button className="tour-skip" onClick={finish}>Skip tour</button>
          <div className="tour-nav">
            {stepIndex > 0 && (
              <button className="tour-back" onClick={prev}>← Back</button>
            )}
            <button className="tour-next" onClick={next}>
              {stepIndex === TOUR_STEPS.length - 1 ? 'Finish ✓' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}