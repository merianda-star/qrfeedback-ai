// ── Plan limits — change these for testing ──────────────────────────────────
// null = unlimited

export const RESPONSE_LIMITS: Record<string, number | null> = {
  free:     5,
  pro:      1000,
  business: null,
}

export const AI_PROCESS_LIMITS: Record<string, number> = {
  pro:      1000,
  business: 5000,
}

export const AI_REPLY_LIMITS: Record<string, number> = {
  pro:      20,
  business: 50,
}

// Upgrade warning threshold — show prompt when this fraction of limit is used
export const RESPONSE_WARN_PCT = 0.8