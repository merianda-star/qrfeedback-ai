import { describe, it, expect } from 'vitest'
import {
  isPositiveRating,
  isNegativeRating,
  getRouteForRating,
  isValidEmail,
  getRatingLabel,
} from '@/lib/feedback-routing'

describe('isPositiveRating', () => {
  it('returns true for 4 stars', () => expect(isPositiveRating(4)).toBe(true))
  it('returns true for 5 stars', () => expect(isPositiveRating(5)).toBe(true))
  it('returns false for 3 stars', () => expect(isPositiveRating(3)).toBe(false))
  it('returns false for 2 stars', () => expect(isPositiveRating(2)).toBe(false))
  it('returns false for 1 star', () => expect(isPositiveRating(1)).toBe(false))
})

describe('isNegativeRating', () => {
  it('returns true for 1 star', () => expect(isNegativeRating(1)).toBe(true))
  it('returns true for 2 stars', () => expect(isNegativeRating(2)).toBe(true))
  it('returns true for 3 stars', () => expect(isNegativeRating(3)).toBe(true))
  it('returns false for 4 stars', () => expect(isNegativeRating(4)).toBe(false))
  it('returns false for 5 stars', () => expect(isNegativeRating(5)).toBe(false))
  it('returns false for 0', () => expect(isNegativeRating(0)).toBe(false))
})

describe('getRouteForRating', () => {
  it('routes negative ratings to email-capture', () => {
    expect(getRouteForRating(1, true)).toBe('email-capture')
    expect(getRouteForRating(3, true)).toBe('email-capture')
    expect(getRouteForRating(1, false)).toBe('email-capture')
  })
  it('routes positive rating with google url to google-consent', () => {
    expect(getRouteForRating(4, true)).toBe('google-consent')
    expect(getRouteForRating(5, true)).toBe('google-consent')
  })
  it('routes positive rating without google url to thankyou-positive', () => {
    expect(getRouteForRating(4, false)).toBe('thankyou-positive')
    expect(getRouteForRating(5, false)).toBe('thankyou-positive')
  })
})

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('name+tag@domain.co.in')).toBe(true)
  })
  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })
})

describe('getRatingLabel', () => {
  it('returns correct label for each rating', () => {
    expect(getRatingLabel(1)).toBe('Terrible')
    expect(getRatingLabel(2)).toBe('Poor')
    expect(getRatingLabel(3)).toBe('Average')
    expect(getRatingLabel(4)).toBe('Great')
    expect(getRatingLabel(5)).toBe('Amazing')
  })
  it('returns empty string for out-of-range rating', () => {
    expect(getRatingLabel(0)).toBe('')
    expect(getRatingLabel(6)).toBe('')
  })
})