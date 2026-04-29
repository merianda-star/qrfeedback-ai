import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getPlanFromPriceId(priceId: string): 'pro' | 'business' | null {
  console.log('[webhook] checking priceId:', priceId)
  console.log('[webhook] PRO price ID env:', process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)
  console.log('[webhook] BUSINESS price ID env:', process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID)
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID) return 'business'
  return null
}

async function updateUserPlan(userId: string, plan: 'pro' | 'business' | 'free', subscriptionId?: string) {
  console.log('[webhook] updating user plan:', { userId, plan, subscriptionId })
  const { data, error } = await adminSupabase
    .from('profiles')
    .update({
      plan,
      trial_ends_at: null,
      stripe_subscription_id: subscriptionId || null,
    })
    .eq('id', userId)
    .select('id, plan')
  console.log('[webhook] update result:', { data, error })
}

export async function POST(req: NextRequest) {
  console.log('[webhook] received request')

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  console.log('[webhook] signature present:', !!signature)
  console.log('[webhook] body length:', body.length)

  if (!signature) {
    console.log('[webhook] ERROR: missing stripe-signature header')
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('[webhook] event verified:', event.type, event.id)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('[webhook] checkout.session.completed:', {
          id: session.id,
          metadata: session.metadata,
          subscription: session.subscription,
          customer: session.customer,
        })

        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan as 'pro' | 'business'

        if (!userId || !plan) {
          console.error('[webhook] ERROR: missing metadata. userId:', userId, 'plan:', plan)
          break
        }

        const subscriptionId = session.subscription as string
        await updateUserPlan(userId, plan, subscriptionId)
        console.log('[webhook] plan activated successfully:', { userId, plan })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('[webhook] customer.subscription.updated:', {
          id: subscription.id,
          metadata: subscription.metadata,
          customer: subscription.customer,
          status: subscription.status,
        })

        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          const customerId = subscription.customer as string
          console.log('[webhook] no userId in metadata, looking up by customerId:', customerId)
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) {
            console.error('[webhook] ERROR: no profile found for customer:', customerId)
            break
          }

          const priceId = subscription.items.data[0]?.price?.id
          const plan = getPlanFromPriceId(priceId)
          if (plan) await updateUserPlan(profile.id, plan, subscription.id)
          break
        }

        const priceId = subscription.items.data[0]?.price?.id
        const plan = getPlanFromPriceId(priceId)
        if (plan) await updateUserPlan(userId, plan, subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('[webhook] customer.subscription.deleted:', {
          id: subscription.id,
          customer: subscription.customer,
          metadata: subscription.metadata,
        })

        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          const customerId = subscription.customer as string
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) {
            console.error('[webhook] ERROR: no profile found for customer:', customerId)
            break
          }

          await updateUserPlan(profile.id, 'free')
          break
        }

        await updateUserPlan(userId, 'free')
        console.log('[webhook] plan downgraded to free:', userId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('[webhook] invoice.payment_failed:', {
          customer: invoice.customer,
        })
        break
      }

      default:
        console.log('[webhook] unhandled event type:', event.type)
    }
  } catch (err) {
    console.error('[webhook] handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic'