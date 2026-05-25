import fs from 'fs/promises'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface Chunk {
  text: string
  headingPath: string
  index: number
}

export function chunkContent(
  markdown: string,
  maxTokens: number = 1500,
): Chunk[] {
  const sections = markdown.split(/^(#{1,3}\s.+)$/m)
  const chunks: Chunk[] = []
  let currentHeading = ''
  let currentText = ''
  let chunkIndex = 0

  for (const section of sections) {
    if (section.match(/^#{1,3}\s/)) {
      currentHeading = section.replace(/^#+\s/, '').trim()
      continue
    }

    const text = section.trim()
    if (!text) continue

    if (currentText.length + text.length > maxTokens * 4) {
      if (currentText) {
        chunks.push({
          text: currentText,
          headingPath: currentHeading,
          index: chunkIndex++,
        })
      }
      currentText = text
    } else {
      currentText += '\n\n' + text
    }
  }

  if (currentText) {
    chunks.push({
      text: currentText,
      headingPath: currentHeading,
      index: chunkIndex,
    })
  }

  return chunks
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI embedding error: ${response.status}`)
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>
  }
  return data.data[0].embedding
}

export async function embedContent(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)
  const chunks = chunkContent(content)

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text)

    await supabase.from('content_embeddings').upsert(
      {
        content_slug: frontmatter.slug as string,
        chunk_index: chunk.index,
        heading_path: chunk.headingPath,
        chunk_text: chunk.text,
        embedding,
        metadata: {
          pillar: frontmatter.pillar as string | undefined,
          tools: frontmatter.tools as string[] | undefined,
          title: frontmatter.title as string | undefined,
        },
      },
      { onConflict: 'content_slug,chunk_index' },
    )
  }

  return chunks.length
}
