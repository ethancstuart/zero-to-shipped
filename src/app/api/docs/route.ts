import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ApiReference } from '@scalar/nextjs-api-reference'

// Read the OpenAPI spec at module load. The file lives in `docs/api/openapi.yaml`
// and is included in the deployment because we read it relative to `process.cwd()`,
// which Vercel/Next bundles into the function output.
const specYaml = readFileSync(
  join(process.cwd(), 'docs', 'api', 'openapi.yaml'),
  'utf-8',
)

export const GET = ApiReference({
  content: specYaml,
  pageTitle: 'Prototype Studio API',
  theme: 'default',
})

// Force Node runtime — `node:fs` is unavailable on the Edge runtime.
export const runtime = 'nodejs'
