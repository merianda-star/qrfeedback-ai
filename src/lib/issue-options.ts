// src/lib/issue-options.ts
// Business-type-specific issue options for the negative feedback question.
// Extracted from src/app/feedback/[id]/page.tsx so it can be unit tested.

export type BusinessType =
  | 'restaurant'
  | 'retail'
  | 'healthcare'
  | 'services'
  | 'hospitality'
  | 'other'

export const ISSUE_OPTIONS: Record<BusinessType, string[]> = {
  restaurant: [
    'Food quality',
    'Wait time',
    'Staff service',
    'Cleanliness',
    'Pricing / Value',
  ],
  retail: [
    'Product quality',
    'Wait time',
    'Staff service',
    'Store cleanliness',
    'Pricing / Value',
  ],
  healthcare: [
    'Wait time',
    'Staff attitude',
    'Treatment quality',
    'Cleanliness',
    'Communication',
  ],
  services: [
    'Quality of service',
    'Response time',
    'Staff professionalism',
    'Value for money',
    'Communication',
  ],
  hospitality: [
    'Room quality',
    'Wait time',
    'Staff service',
    'Cleanliness',
    'Pricing / Value',
  ],
  other: [
    'Quality',
    'Wait time',
    'Staff service',
    'Cleanliness',
    'Pricing / Value',
  ],
}

// Returns issue options for a given business type.
// Falls back to 'other' if type is unrecognised.
export function getIssueOptions(businessType: string): string[] {
  return ISSUE_OPTIONS[businessType as BusinessType] ?? ISSUE_OPTIONS.other
}