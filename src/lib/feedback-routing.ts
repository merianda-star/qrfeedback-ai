// src/lib/feedback-routing.ts
// Pure business logic for feedback form routing.
// Extracted from src/app/feedback/[id]/page.tsx so it can be unit tested.

export function isPositiveRating(rating: number): boolean {
  return rating >= 4
}

export function isNegativeRating(rating: number): boolean {
  return rating > 0 && rating < 4
}

export function getRouteForRating(
  rating: number,
  hasGoogleReviewUrl: boolean
): 'google-consent' | 'email-capture' | 'thankyou-positive' {
  if (isNegativeRating(rating)) return 'email-capture'
  if (hasGoogleReviewUrl) return 'google-consent'
  return 'thankyou-positive'
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Terrible',
    2: 'Poor',
    3: 'Average',
    4: 'Great',
    5: 'Amazing',
  }
  return labels[rating] ?? ''
}