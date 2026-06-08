import { readdirSync, statSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const buildDir = join(process.cwd(), '.next')
const baselinePath = join(process.cwd(), 'docs/performance/bundle-baseline.json')
const THRESHOLD_PERCENT = 15 // fail if bundle grows >15%

if (!existsSync(buildDir)) {
  console.error('❌ No .next directory found. Run `npm run build` first.')
  process.exit(1)
}

if (!existsSync(baselinePath)) {
  console.error('❌ No bundle baseline found. Run `npm run measure-bundle` to create one.')
  process.exit(1)
}

function getTotalJsSize(dir: string): number {
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
        total += stat.size
      }
    }
  }
  walk(dir)
  return total
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'))
const currentSize = getTotalJsSize(join(buildDir, 'static'))
const baselineSize = baseline.totalJsBytes
const diff = currentSize - baselineSize
const percentChange = (diff / baselineSize) * 100

const currentKB = Math.round((currentSize / 1024) * 100) / 100
const baselineKB = baseline.totalJsKB
const diffKB = Math.round((diff / 1024) * 100) / 100

console.log(`📦 Bundle size:`)
console.log(`   Baseline: ${baselineKB} KB`)
console.log(`   Current:  ${currentKB} KB`)
console.log(`   Diff:     ${diffKB > 0 ? '+' : ''}${diffKB} KB (${percentChange.toFixed(1)}%)`)
console.log(`   Generated: ${baseline.generatedAt}`)

if (percentChange > THRESHOLD_PERCENT) {
  console.error(`\n❌ Bundle size grew by ${percentChange.toFixed(1)}%, exceeding ${THRESHOLD_PERCENT}% threshold.`)
  console.error(`To update the baseline: npm run measure-bundle`)
  process.exit(1)
}

console.log(`\n✅ Bundle size check passed (${percentChange.toFixed(1)}% change, threshold: ${THRESHOLD_PERCENT}%)`)
