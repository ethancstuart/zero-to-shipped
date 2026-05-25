import fs from 'fs/promises'
import path from 'path'
import { embedContent } from '../src/lib/assistant/embeddings'

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  let names: string[]
  try {
    names = await fs.readdir(dir)
  } catch {
    return results
  }
  for (const name of names) {
    const fullPath = path.join(dir, name)
    const stat = await fs.stat(fullPath)
    if (stat.isDirectory()) results.push(...(await walkDir(fullPath)))
    else if (name.endsWith('.mdx')) results.push(fullPath)
  }
  return results
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is required')
    process.exit(1)
  }

  const files = await walkDir(CONTENT_DIR)
  console.log(`Found ${files.length} MDX files`)

  let totalChunks = 0
  let errors = 0

  // Process files sequentially to avoid rate limiting
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const basename = path.basename(file)
    try {
      const chunks = await embedContent(file)
      totalChunks += chunks
      console.log(`[${i + 1}/${files.length}] ${basename}: ${chunks} chunks`)
    } catch (error) {
      errors++
      console.error(
        `[${i + 1}/${files.length}] ${basename}: ERROR - ${error instanceof Error ? error.message : 'Unknown'}`,
      )
    }
  }

  console.log(
    `\nDone. ${totalChunks} chunks embedded across ${files.length - errors} files. ${errors} errors.`,
  )
}

main()
