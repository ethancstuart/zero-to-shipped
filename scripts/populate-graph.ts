import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function populate() {
  console.log('Populating knowledge graph...')

  // 1. Create tool nodes
  const { data: tools } = await supabase.from('tools').select('slug, name')
  for (const tool of tools || []) {
    await supabase.from('knowledge_nodes').upsert(
      { slug: tool.slug, title: tool.name, node_type: 'tool', metadata: {} },
      { onConflict: 'slug' },
    )
  }
  console.log(`Created ${(tools || []).length} tool nodes`)

  // 2. Create content nodes
  const { data: content } = await supabase.from('content_index').select('slug, title, tools, pillar')
  for (const item of content || []) {
    await supabase.from('knowledge_nodes').upsert(
      { slug: item.slug, title: item.title, node_type: 'content', metadata: { pillar: item.pillar } },
      { onConflict: 'slug' },
    )
  }
  console.log(`Created ${(content || []).length} content nodes`)

  // 3. Create content→tool edges
  let edgeCount = 0
  for (const item of content || []) {
    if (!item.tools || item.tools.length === 0) continue

    const { data: contentNode } = await supabase
      .from('knowledge_nodes')
      .select('id')
      .eq('slug', item.slug)
      .single()

    for (const toolSlug of item.tools) {
      const { data: toolNode } = await supabase
        .from('knowledge_nodes')
        .select('id')
        .eq('slug', toolSlug)
        .single()

      if (contentNode && toolNode) {
        await supabase.from('knowledge_edges').upsert(
          {
            source_id: contentNode.id,
            target_id: toolNode.id,
            relationship: 'uses',
            weight: 1.0,
          },
          { onConflict: 'source_id,target_id,relationship' },
        )
        edgeCount++
      }
    }
  }
  console.log(`Created ${edgeCount} content→tool edges`)

  console.log('Knowledge graph populated.')
}

populate()
