// src/lib/plan-limits.ts
// Single source of truth for all plan limits.
// Import this in every API route instead of hardcoding limits inline.

export type Plan = 'free' | 'pro' | 'business'
export type UsageType = 'process' | 'reply' | 'digest'

export const PLAN_LIMITS: Record<UsageType, Record<Plan, number>> = {
  // AI complaint processing — counted monthly
  process: {
    free: 0,
    pro: 1000,
    business: 5000,
  },
  // AI reply suggestions — counted daily
  reply: {
    free: 0,
    pro: 20,
    business: 50,
  },
  // Custom digest generations — counted monthly
  digest: {
    free: 0,
    pro: 2,
    business: 4,
  },
}

export const FORM_LIMITS: Record<Plan, number | null> = {
  free: 3,
  pro: null,      // unlimited
  business: null, // unlimited
}

export const RESPONSE_LIMITS: Record<Plan, number | null> = {
  free: 50,
  pro: 1000,
  business: null, // unlimited
}

// Returns the limit for a given plan and usage type.
// Returns 0 for free plan (no access).
export function getLimit(plan: Plan, type: UsageType): number {
  return PLAN_LIMITS[type][plan] ?? 0
}

// Returns true if the user has reached or exceeded their limit.
export function isOverLimit(plan: Plan, type: UsageType, used: number): boolean {
  const limit = getLimit(plan, type)
  if (limit === 0) return true // free plan always over limit
  return used >= limit
}

// Returns how many uses remain. Returns 0 if over limit.
export function remaining(plan: Plan, type: UsageType, used: number): number {
  const limit = getLimit(plan, type)
  return Math.max(0, limit - used)
}

// Returns true if the plan has access to AI features at all.
export function hasAIAccess(plan: Plan): boolean {
  return plan === 'pro' || plan === 'business'
}

// Returns true if the user can create another form.
export function canCreateForm(plan: Plan, currentFormCount: number): boolean {
  const limit = FORM_LIMITS[plan]
  if (limit === null) return true
  return currentFormCount < limit
}