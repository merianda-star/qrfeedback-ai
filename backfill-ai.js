// backfill-ai.js
// Run with: node backfill-ai.js
// Make sure your dev server is running on localhost:3000

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function backfill() {
  console.log('Fetching unprocessed negative responses...')

  const { data, error } = await supabase
    .from('responses')
    .select('id, rating, answers')
    .eq('ai_processed', false)
    .lte('rating', 3)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('No unprocessed responses found.')
    return
  }

  console.log(`Found ${data.length} unprocessed responses. Processing...`)

  let success = 0
  let failed = 0

  for (const r of data) {
    try {
      const res = await fetch('http://localhost:3000/api/process-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_id: r.id,
          rating: r.rating,
          answers: r.answers,
        }),
      })

      const json = await res.json()

      if (json.success) {
        success++
        console.log(`✓ ${r.id} — category: ${json.category}`)
      } else if (json.skipped) {
        console.log(`— ${r.id} skipped (rating >= 4)`)
      } else {
        failed++
        console.log(`✗ ${r.id} — error: ${json.error}`)
      }

      // Small delay to avoid hitting OpenAI rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (err) {
      failed++
      console.log(`✗ ${r.id} — fetch error: ${err.message}`)
    }
  }

  console.log(`\nDone. ${success} processed, ${failed} failed.`)
}

backfill()