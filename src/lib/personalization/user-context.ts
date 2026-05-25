import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function trackContentView(userId: string, slug: string) {
  // Upsert user_context, adding slug to content_consumed array
  const { data: existing } = await supabase
    .from('user_context')
    .select('content_consumed')
    .eq('user_id', userId)
    .single()

  const consumed = existing?.content_consumed || []
  if (!consumed.includes(slug)) {
    consumed.push(slug)
  }

  await supabase.from('user_context').upsert(
    {
      user_id: userId,
      content_consumed: consumed,
      last_active: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
}

export async function trackToolInterest(userId: string, toolSlug: string) {
  const { data: existing } = await supabase
    .from('user_context')
    .select('primary_tools')
    .eq('user_id', userId)
    .single()

  const tools = existing?.primary_tools || []
  if (!tools.includes(toolSlug)) {
    tools.push(toolSlug)
  }

  await supabase.from('user_context').upsert(
    {
      user_id: userId,
      primary_tools: tools,
      last_active: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
}

export async function getUserContext(userId: string) {
  const { data } = await supabase
    .from('user_context')
    .select('*')
    .eq('user_id', userId)
    .single()

  return data
}
