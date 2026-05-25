import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecommendations } from '@/lib/personalization/recommender'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ recommendations: [] })
  }

  const recommendations = await getRecommendations(user.id, 5)
  return NextResponse.json({ recommendations })
}
