import { readdirSync, statSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const buildDir = join(process.cwd(), '.next')
const outputPath = join(process.cwd(), 'docs/performance/bundle-baseline.json')

if (!existsSync(buildDir)) {
  console.error('❌ No .next directory found. Run `npm run build` first.')
  process.exit(1)
}

interface ChunkInfo {
  name: string
  size: number
  sizeKB: number
}

function getDirectorySize(dir: string): { total: number; files: ChunkInfo[] } {
  const files: ChunkInfo[] = []
  let total = 0

  function walk(currentDir: string) {
    let entries: string[]
    try {
      entries = readdirSync(currentDir)
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        walk(fullPath)
      } else if (entry.endsWith('.js') || entry.endsWith('.mjs')) {
        files.push({
          name: fullPath.replace(buildDir + '/', ''),
          size: stat.size,
          sizeKB: Math.round((stat.size / 1024) * 100) / 100,
        })
        total += stat.size
      }
    }
  }

  walk(dir)
  return { total, files }
}

const staticDir = join(buildDir, 'static')
const { total, files } = getDirectorySize(staticDir)

// Sort by size descending
files.sort((a, b) => b.size - a.size)

const baseline = {
  generatedAt: new Date().toISOString(),
  totalJsBytes: total,
  totalJsKB: Math.round((total / 1024) * 100) / 100,
  totalJsMB: Math.round((total / 1024 / 1024) * 100) / 100,
  fileCount: files.length,
  top20LargestChunks: files.slice(0, 20),
}

writeFileSync(outputPath, JSON.stringify(baseline, null, 2))

console.log(`✅ Bundle baseline written to ${outputPath}`)
console.log(`📦 Total JS: ${baseline.totalJsMB} MB (${baseline.totalJsKB} KB) across ${files.length} files`)
console.log(`📊 Largest chunk: ${files[0].name} — ${files[0].sizeKB} KB`)
