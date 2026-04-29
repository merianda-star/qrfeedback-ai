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

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string): 'pro' | 'business' | null {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID) return 'business'
  return null
}

// Update user plan in database
async function updateUserPlan(userId: string, plan: 'pro' | 'business' | 'free', subscriptionId?: string) {
  await adminSupabase
    .from('profiles')
    .update({
      plan,
      trial_ends_at: null, // Always clear trial on Stripe plan change
      stripe_subscription_id: subscriptionId || null,
    })
    .eq('id', userId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Payment succeeded — activate plan ──────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const plan = session.metadata?.plan as 'pro' | 'business'

        if (!userId || !plan) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }

        const subscriptionId = session.subscription as string
        await updateUserPlan(userId, plan, subscriptionId)
        console.log(`Plan activated: user=${userId} plan=${plan}`)
        break
      }

      // ── Subscription updated — handle plan changes ─────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          // Try to find user by stripe_customer_id
          const customerId = subscription.customer as string
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) {
            console.error('No profile found for customer:', customerId)
            break
          }

          const priceId = subscription.items.data[0]?.price?.id
          const plan = getPlanFromPriceId(priceId)

          if (plan) {
            await updateUserPlan(profile.id, plan, subscription.id)
            console.log(`Plan updated: user=${profile.id} plan=${plan}`)
          }
          break
        }

        const priceId = subscription.items.data[0]?.price?.id
        const plan = getPlanFromPriceId(priceId)

        if (plan) {
          await updateUserPlan(userId, plan, subscription.id)
          console.log(`Plan updated: user=${userId} plan=${plan}`)
        }
        break
      }

      // ── Subscription cancelled — downgrade at period end ───────────
      // Stripe sets status to 'canceled' after the period ends
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          // Try to find user by stripe_customer_id
          const customerId = subscription.customer as string
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (!profile) {
            console.error('No profile found for customer:', customerId)
            break
          }

          await updateUserPlan(profile.id, 'free')
          console.log(`Plan downgraded to free: user=${profile.id}`)
          break
        }

        await updateUserPlan(userId, 'free')
        console.log(`Plan downgraded to free: user=${userId}`)
        break
      }

      // ── Payment failed — notify but do not downgrade immediately ───
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id, email, business_name')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) break

        // Log for now — Stripe will retry automatically
        // After 3 failed retries Stripe fires customer.subscription.deleted
        console.log(`Payment failed for user=${profile.id} email=${profile.email}`)

        // Optionally: send a payment failed email via Resend here
        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
export const dynamic = 'force-dynamic'