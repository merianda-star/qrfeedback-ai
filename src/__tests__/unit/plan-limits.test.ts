// src/__tests__/unit/plan-limits.test.ts
import { describe, it, expect } from 'vitest'
import {
  getLimit,
  isOverLimit,
  remaining,
  hasAIAccess,
  canCreateForm,
  PLAN_LIMITS,
} from '@/lib/plan-limits'

// ─── getLimit ────────────────────────────────────────────────────
describe('getLimit', () => {
  it('returns correct process limits per plan', () => {
    expect(getLimit('free', 'process')).toBe(0)
    expect(getLimit('pro', 'process')).toBe(1000)
    expect(getLimit('business', 'process')).toBe(5000)
  })

  it('returns correct reply limits per plan', () => {
    expect(getLimit('free', 'reply')).toBe(0)
    expect(getLimit('pro', 'reply')).toBe(20)
    expect(getLimit('business', 'reply')).toBe(50)
  })

  it('returns correct digest limits per plan', () => {
    expect(getLimit('free', 'digest')).toBe(0)
    expect(getLimit('pro', 'digest')).toBe(2)
    expect(getLimit('business', 'digest')).toBe(4)
  })
})

// ─── isOverLimit ─────────────────────────────────────────────────
describe('isOverLimit', () => {
  describe('process limits', () => {
    it('free plan is always over limit (no AI access)', () => {
      expect(isOverLimit('free', 'process', 0)).toBe(true)
    })

    it('pro plan is not over limit below 1000', () => {
      expect(isOverLimit('pro', 'process', 0)).toBe(false)
      expect(isOverLimit('pro', 'process', 999)).toBe(false)
    })

    it('pro plan is over limit at exactly 1000', () => {
      expect(isOverLimit('pro', 'process', 1000)).toBe(true)
    })

    it('pro plan is over limit above 1000', () => {
      expect(isOverLimit('pro', 'process', 1001)).toBe(true)
    })

    it('business plan is not over limit below 5000', () => {
      expect(isOverLimit('business', 'process', 0)).toBe(false)
      expect(isOverLimit('business', 'process', 4999)).toBe(false)
    })

    it('business plan is over limit at exactly 5000', () => {
      expect(isOverLimit('business', 'process', 5000)).toBe(true)
    })
  })

  describe('reply limits', () => {
    it('pro plan is not over limit below 20', () => {
      expect(isOverLimit('pro', 'reply', 19)).toBe(false)
    })

    it('pro plan is over limit at 20', () => {
      expect(isOverLimit('pro', 'reply', 20)).toBe(true)
    })

    it('business plan is not over limit below 50', () => {
      expect(isOverLimit('business', 'reply', 49)).toBe(false)
    })

    it('business plan is over limit at 50', () => {
      expect(isOverLimit('business', 'reply', 50)).toBe(true)
    })
  })

  describe('digest limits', () => {
    it('pro plan is not over limit at 1 digest', () => {
      expect(isOverLimit('pro', 'digest', 1)).toBe(false)
    })

    it('pro plan is over limit at 2 digests', () => {
      expect(isOverLimit('pro', 'digest', 2)).toBe(true)
    })

    it('business plan is not over limit at 3 digests', () => {
      expect(isOverLimit('business', 'digest', 3)).toBe(false)
    })

    it('business plan is over limit at 4 digests', () => {
      expect(isOverLimit('business', 'digest', 4)).toBe(true)
    })
  })
})

// ─── remaining ───────────────────────────────────────────────────
describe('remaining', () => {
  it('returns correct remaining for pro process', () => {
    expect(remaining('pro', 'process', 0)).toBe(1000)
    expect(remaining('pro', 'process', 400)).toBe(600)
    expect(remaining('pro', 'process', 1000)).toBe(0)
  })

  it('returns correct remaining for business process', () => {
    expect(remaining('business', 'process', 0)).toBe(5000)
    expect(remaining('business', 'process', 2500)).toBe(2500)
  })

  it('never returns negative remaining', () => {
    expect(remaining('pro', 'process', 9999)).toBe(0)
  })

  it('returns 0 for free plan', () => {
    expect(remaining('free', 'process', 0)).toBe(0)
  })
})

// ─── hasAIAccess ─────────────────────────────────────────────────
describe('hasAIAccess', () => {
  it('pro plan has AI access', () => {
    expect(hasAIAccess('pro')).toBe(true)
  })

  it('business plan has AI access', () => {
    expect(hasAIAccess('business')).toBe(true)
  })

  it('free plan does not have AI access', () => {
    expect(hasAIAccess('free')).toBe(false)
  })
})

// ─── canCreateForm ───────────────────────────────────────────────
describe('canCreateForm', () => {
  it('free plan can create forms up to 3', () => {
    expect(canCreateForm('free', 0)).toBe(true)
    expect(canCreateForm('free', 1)).toBe(true)
    expect(canCreateForm('free', 2)).toBe(true)
  })

  it('free plan cannot create a 4th form', () => {
    expect(canCreateForm('free', 3)).toBe(false)
    expect(canCreateForm('free', 10)).toBe(false)
  })

  it('pro plan can create unlimited forms', () => {
    expect(canCreateForm('pro', 0)).toBe(true)
    expect(canCreateForm('pro', 100)).toBe(true)
    expect(canCreateForm('pro', 9999)).toBe(true)
  })

  it('business plan can create unlimited forms', () => {
    expect(canCreateForm('business', 0)).toBe(true)
    expect(canCreateForm('business', 100)).toBe(true)
  })
})

// ─── PLAN_LIMITS structure ───────────────────────────────────────
describe('PLAN_LIMITS structure', () => {
  it('business limit is always higher than pro limit', () => {
    expect(PLAN_LIMITS.process.business).toBeGreaterThan(PLAN_LIMITS.process.pro)
    expect(PLAN_LIMITS.reply.business).toBeGreaterThan(PLAN_LIMITS.reply.pro)
    expect(PLAN_LIMITS.digest.business).toBeGreaterThan(PLAN_LIMITS.digest.pro)
  })

  it('free plan has 0 for all AI usage types', () => {
    expect(PLAN_LIMITS.process.free).toBe(0)
    expect(PLAN_LIMITS.reply.free).toBe(0)
    expect(PLAN_LIMITS.digest.free).toBe(0)
  })
})