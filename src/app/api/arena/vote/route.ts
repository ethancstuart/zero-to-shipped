import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { challengeId, toolId } = await request.json()

  if (!challengeId || !toolId) {
    return NextResponse.json({ error: 'challengeId and toolId required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('arena_votes')
    .upsert(
      { user_id: user.id, challenge_id: challengeId, tool_id: toolId },
      { onConflict: 'user_id,challenge_id' },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
