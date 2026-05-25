import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !slug) return NextResponse.json({ bookmarked: false })

  const { data } = await supabase
    .from('bookmarks')
    .select('content_slug')
    .eq('user_id', user.id)
    .eq('content_slug', slug)
    .single()

  return NextResponse.json({ bookmarked: !!data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { slug } = await request.json()
  await supabase.from('bookmarks').insert({ user_id: user.id, content_slug: slug })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

  const { slug } = await request.json()
  await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('content_slug', slug)
  return NextResponse.json({ success: true })
}
