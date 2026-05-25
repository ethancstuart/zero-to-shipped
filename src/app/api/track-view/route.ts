import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { slug } = await request.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Upsert into content_analytics — increment views for today's period
  const { data: existing } = await supabase
    .from('content_analytics')
    .select('id, views')
    .eq('content_slug', slug)
    .eq('period_start', today)
    .single()

  if (existing) {
    await supabase
      .from('content_analytics')
      .update({ views: existing.views + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('content_analytics')
      .insert({ content_slug: slug, views: 1, period_start: today, period_end: today })
  }

  // Track in user_context if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { trackContentView } = await import('@/lib/personalization/user-context')
    await trackContentView(user.id, slug)
  }

  return NextResponse.json({ success: true })
}
