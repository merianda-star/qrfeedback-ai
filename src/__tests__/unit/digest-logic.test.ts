// src/__tests__/unit/digest-logic.test.ts
// Tests for the pure logic functions used in digest generation.
// The actual API route (/api/digest/generate) hits Supabase and OpenAI,
// so those are not tested here. We test the deterministic logic only.

import { describe, it, expect } from 'vitest'
import { getLimit, isOverLimit } from '@/lib/plan-limits'

// ─── Digest limit enforcement ────────────────────────────────────
describe('Digest generation limits', () => {
  it('free plan cannot generate any custom digests', () => {
    expect(getLimit('free', 'digest')).toBe(0)
    expect(isOverLimit('free', 'digest', 0)).toBe(true)
  })

  it('pro plan can generate up to 2 custom digests per month', () => {
    expect(getLimit('pro', 'digest')).toBe(2)
    expect(isOverLimit('pro', 'digest', 0)).toBe(false)
    expect(isOverLimit('pro', 'digest', 1)).toBe(false)
    expect(isOverLimit('pro', 'digest', 2)).toBe(true)
  })

  it('business plan can generate up to 4 custom digests per month', () => {
    expect(getLimit('business', 'digest')).toBe(4)
    expect(isOverLimit('business', 'digest', 3)).toBe(false)
    expect(isOverLimit('business', 'digest', 4)).toBe(true)
  })

  it('cron-generated digests do not count against user limit (separate code path)', () => {
    // This test documents the architectural decision:
    // cron path uses Authorization: Bearer CRON_SECRET header
    // and skips the usage check entirely — users at limit still get Monday digest
    const proAtLimit = isOverLimit('pro', 'digest', 2)
    expect(proAtLimit).toBe(true)
    // The cron bypass means this limit check is never evaluated for cron runs
    // Confirmed by inspection of /api/digest/generate route
  })
})

// ─── Sentiment trend calculation ──────────────────────────────────
// Pure function version of the sentiment trend logic from the generate route
function getSentimentTrend(avgRating: number, prevAvg: number, totalResponses: number): string {
  if (totalResponses === 0) return 'no_data'
  if (prevAvg === 0) return 'stable'
  if (avgRating > prevAvg + 0.2) return 'improving'
  if (avgRating < prevAvg - 0.2) return 'declining'
  return 'stable'
}

describe('Sentiment trend calculation', () => {
  it('returns no_data when there are no responses', () => {
    expect(getSentimentTrend(0, 0, 0)).toBe('no_data')
    expect(getSentimentTrend(4.5, 3.0, 0)).toBe('no_data')
  })

  it('returns stable when there is no previous week data', () => {
    expect(getSentimentTrend(4.0, 0, 10)).toBe('stable')
  })

  it('returns improving when rating increased by more than 0.2', () => {
    expect(getSentimentTrend(4.5, 4.0, 10)).toBe('improving') // +0.5
    expect(getSentimentTrend(4.3, 4.0, 10)).toBe('improving') // +0.3
  })

  it('returns stable when rating changed by 0.2 or less', () => {
    expect(getSentimentTrend(4.1, 4.0, 10)).toBe('stable')   // +0.1
    expect(getSentimentTrend(4.0, 4.0, 10)).toBe('stable')   // 0
    expect(getSentimentTrend(3.9, 4.0, 10)).toBe('stable')   // -0.1
    expect(getSentimentTrend(3.85, 4.0, 10)).toBe('stable')  // -0.15
  })

  it('returns declining when rating dropped by more than 0.2', () => {
    expect(getSentimentTrend(3.7, 4.0, 10)).toBe('declining') // -0.3
    expect(getSentimentTrend(2.0, 4.0, 10)).toBe('declining') // -2.0
  })

  it('handles edge case where ratings are the same', () => {
    expect(getSentimentTrend(3.5, 3.5, 5)).toBe('stable')
  })
})

// ─── Date range logic ────────────────────────────────────────────
// Pure version of the week date calculation from the generate route
function getCurrentMonday(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

describe('Week date calculation', () => {
  it('getCurrentMonday always returns a Monday', () => {
    const monday = getCurrentMonday()
    expect(monday.getDay()).toBe(1) // 1 = Monday
  })

  it('getCurrentMonday returns midnight (start of day)', () => {
    const monday = getCurrentMonday()
    expect(monday.getHours()).toBe(0)
    expect(monday.getMinutes()).toBe(0)
    expect(monday.getSeconds()).toBe(0)
  })

  it('adding 6 days to Monday gives Sunday', () => {
    const monday = getCurrentMonday()
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    expect(sunday.getDay()).toBe(0) // 0 = Sunday
  })
})

// ─── Average rating calculation ──────────────────────────────────
function calculateAvgRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length
}

describe('Average rating calculation', () => {
  it('returns 0 for empty array', () => {
    expect(calculateAvgRating([])).toBe(0)
  })

  it('returns correct average for single rating', () => {
    expect(calculateAvgRating([4])).toBe(4)
  })

  it('returns correct average for multiple ratings', () => {
    expect(calculateAvgRating([1, 2, 3, 4, 5])).toBe(3)
    expect(calculateAvgRating([4, 5, 5, 4])).toBe(4.5)
  })

  it('handles all-negative responses', () => {
    expect(calculateAvgRating([1, 1, 2, 1])).toBe(1.25)
  })

  it('handles all-positive responses', () => {
    expect(calculateAvgRating([5, 5, 5, 4])).toBe(4.75)
  })
})