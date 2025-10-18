export interface PricingPlan {
  name: string
  stripeName: string
  price: string
  priceMonthly: number
  priceId: string | null
  popular?: boolean
  features: string[]
  limits: {
    forms: number | 'unlimited'
    responses: number | 'unlimited'
  }
  cta: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    stripeName: 'QR Freeplan',
    price: '$0',
    priceMonthly: 0,
    priceId: 'price_1SJcpn04KnTBJoOrKtEQjQM7',
    cta: 'Get Started Free',
    features: [
      '3 feedback forms',
      '50 responses per month',
      'QR code generation',
      'Basic analytics dashboard',
      'Email support'
    ],
    limits: {
      forms: 3,
      responses: 50
    }
  },
  {
    name: 'Pro',
    stripeName: 'QR Pro Plan',
    price: '$19',
    priceMonthly: 19,
    priceId: 'price_1SJcqG04KnTBJoOrVzcOJ1jB',
    popular: true,
    cta: 'Start Free Trial',
    features: [
      'Unlimited feedback forms',
      '1,000 responses per month',
      'Advanced analytics & insights',
      'QR code customization',
      'Email notifications',
      'Priority email support',
      'Export data (CSV/Excel)',
      'Custom branding options'
    ],
    limits: {
      forms: 'unlimited',
      responses: 1000
    }
  },
  {
    name: 'Business',
    stripeName: 'QR Business Plan',
    price: '$49',
    priceMonthly: 49,
    priceId: 'price_1SJcvI04KnTBJoOr8jJ5uVnX',
    cta: 'Start Free Trial',
    features: [
      'Everything in Pro',
      'Unlimited responses',
      'White-label feedback forms',
      'Remove QRfeedback.ai branding',
      'API access for integrations',
      'Custom domain support',
      'Dedicated account manager',
      'Phone & priority support',
      'Advanced team collaboration'
    ],
    limits: {
      forms: 'unlimited',
      responses: 'unlimited'
    }
  }
]

export function getPlanByName(name: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => 
    plan.name.toLowerCase() === name.toLowerCase() ||
    plan.stripeName.toLowerCase() === name.toLowerCase()
  )
}

export function getPlanLimits(planName: string) {
  const plan = getPlanByName(planName) || PRICING_PLANS[0]
  return plan.limits
}

export function formatPlanName(planName: string): string {
  const plan = getPlanByName(planName)
  return plan ? plan.name : planName.charAt(0).toUpperCase() + planName.slice(1)
}

