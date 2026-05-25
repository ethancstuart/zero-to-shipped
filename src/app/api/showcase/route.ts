import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('showcase_projects')
    .select(`*, showcase_project_tools(tool_id, tools:tool_id(name, slug))`)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json()
  const { title, url, description, screenshot_url, github_url, build_time_minutes, builder_experience, tool_ids } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description required' }, { status: 400 })
  }

  const { data: project, error } = await supabase
    .from('showcase_projects')
    .insert({
      user_id: user.id,
      title,
      url: url || null,
      description,
      screenshot_url: screenshot_url || null,
      github_url: github_url || null,
      build_time_minutes: build_time_minutes || null,
      builder_experience: builder_experience || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert tool associations
  if (tool_ids && Array.isArray(tool_ids) && tool_ids.length > 0) {
    await supabase.from('showcase_project_tools').insert(
      tool_ids.map((tid: string) => ({ project_id: project.id, tool_id: tid })),
    )
  }

  return NextResponse.json({ success: true, id: project.id })
}
