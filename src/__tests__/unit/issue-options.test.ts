// src/__tests__/unit/issue-options.test.ts
import { describe, it, expect } from 'vitest'
import { getIssueOptions, ISSUE_OPTIONS } from '@/lib/issue-options'

// ─── Every business type returns exactly 5 options ───────────────
describe('ISSUE_OPTIONS', () => {
  const businessTypes = Object.keys(ISSUE_OPTIONS) as Array<keyof typeof ISSUE_OPTIONS>

  it('every business type has exactly 5 options', () => {
    businessTypes.forEach(type => {
      expect(ISSUE_OPTIONS[type]).toHaveLength(5)
    })
  })

  it('no option is an empty string', () => {
    businessTypes.forEach(type => {
      ISSUE_OPTIONS[type].forEach(option => {
        expect(option.trim()).not.toBe('')
      })
    })
  })

  it('no duplicate options within a single business type', () => {
    businessTypes.forEach(type => {
      const options = ISSUE_OPTIONS[type]
      const unique = new Set(options)
      expect(unique.size).toBe(options.length)
    })
  })
})

// ─── Restaurant ──────────────────────────────────────────────────
describe('restaurant options', () => {
  it('includes food quality', () => {
    expect(ISSUE_OPTIONS.restaurant).toContain('Food quality')
  })

  it('includes wait time', () => {
    expect(ISSUE_OPTIONS.restaurant).toContain('Wait time')
  })

  it('includes cleanliness', () => {
    expect(ISSUE_OPTIONS.restaurant).toContain('Cleanliness')
  })
})

// ─── Services ────────────────────────────────────────────────────
describe('services options', () => {
  it('does NOT include food-specific options', () => {
    expect(ISSUE_OPTIONS.services).not.toContain('Food quality')
    expect(ISSUE_OPTIONS.services).not.toContain('Room quality')
  })

  it('includes service-specific options', () => {
    expect(ISSUE_OPTIONS.services).toContain('Quality of service')
    expect(ISSUE_OPTIONS.services).toContain('Staff professionalism')
    expect(ISSUE_OPTIONS.services).toContain('Communication')
  })

  it('does not include staff service (uses professionalism instead)', () => {
    expect(ISSUE_OPTIONS.services).not.toContain('Staff service')
  })
})

// ─── Healthcare ──────────────────────────────────────────────────
describe('healthcare options', () => {
  it('does NOT include food-specific options', () => {
    expect(ISSUE_OPTIONS.healthcare).not.toContain('Food quality')
    expect(ISSUE_OPTIONS.healthcare).not.toContain('Room quality')
    expect(ISSUE_OPTIONS.healthcare).not.toContain('Pricing / Value')
  })

  it('includes healthcare-specific options', () => {
    expect(ISSUE_OPTIONS.healthcare).toContain('Treatment quality')
    expect(ISSUE_OPTIONS.healthcare).toContain('Staff attitude')
    expect(ISSUE_OPTIONS.healthcare).toContain('Communication')
  })
})

// ─── Hospitality ─────────────────────────────────────────────────
describe('hospitality options', () => {
  it('includes room quality', () => {
    expect(ISSUE_OPTIONS.hospitality).toContain('Room quality')
  })

  it('does NOT include food quality', () => {
    expect(ISSUE_OPTIONS.hospitality).not.toContain('Food quality')
  })
})

// ─── Retail ──────────────────────────────────────────────────────
describe('retail options', () => {
  it('includes product quality (not food quality)', () => {
    expect(ISSUE_OPTIONS.retail).toContain('Product quality')
    expect(ISSUE_OPTIONS.retail).not.toContain('Food quality')
  })

  it('includes store cleanliness (not just cleanliness)', () => {
    expect(ISSUE_OPTIONS.retail).toContain('Store cleanliness')
  })
})

// ─── getIssueOptions ─────────────────────────────────────────────
describe('getIssueOptions', () => {
  it('returns correct options for known business types', () => {
    expect(getIssueOptions('restaurant')).toEqual(ISSUE_OPTIONS.restaurant)
    expect(getIssueOptions('services')).toEqual(ISSUE_OPTIONS.services)
    expect(getIssueOptions('healthcare')).toEqual(ISSUE_OPTIONS.healthcare)
    expect(getIssueOptions('retail')).toEqual(ISSUE_OPTIONS.retail)
    expect(getIssueOptions('hospitality')).toEqual(ISSUE_OPTIONS.hospitality)
  })

  it('falls back to "other" options for unknown business type', () => {
    expect(getIssueOptions('unknown')).toEqual(ISSUE_OPTIONS.other)
    expect(getIssueOptions('')).toEqual(ISSUE_OPTIONS.other)
    expect(getIssueOptions('gym')).toEqual(ISSUE_OPTIONS.other)
  })

  it('services options never contain food-related text', () => {
    const options = getIssueOptions('services')
    const hasFoodText = options.some(o =>
      o.toLowerCase().includes('food') || o.toLowerCase().includes('room')
    )
    expect(hasFoodText).toBe(false)
  })

  it('healthcare options never contain food or room text', () => {
    const options = getIssueOptions('healthcare')
    const hasInvalidText = options.some(o =>
      o.toLowerCase().includes('food') || o.toLowerCase().includes('room')
    )
    expect(hasInvalidText).toBe(false)
  })
})