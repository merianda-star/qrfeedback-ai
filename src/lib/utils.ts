import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateQRData(formId: string, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') {
  return `${baseUrl}/feedback/${formId}`
}

export function getPlanLimits(plan: string) {
  switch (plan) {
    case 'free':
      return { forms: 2, responses: 50, features: ['Basic dashboard', 'QR generation'] }
    case 'starter':
      return { forms: 'unlimited', responses: 500, features: ['Email notifications', 'Custom branding'] }
    case 'professional':
      return { forms: 'unlimited', responses: 2500, features: ['Analytics', 'Data export', 'Review management'] }
    case 'enterprise':
      return { forms: 'unlimited', responses: 10000, features: ['Multi-location', 'API access', 'Priority support'] }
    default:
      return { forms: 0, responses: 0, features: [] }
  }
}

export function isWithinPlanLimits(plan: string, currentForms: number, currentResponses: number) {
  const limits = getPlanLimits(plan)
  
  const formsOk = limits.forms === 'unlimited' || currentForms < (limits.forms as number)
  const responsesOk = currentResponses < (limits.responses as number)
  
  return { formsOk, responsesOk, limits }
}
