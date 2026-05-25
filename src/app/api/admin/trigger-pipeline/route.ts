import { NextResponse } from 'next/server'
import { runPipeline } from '@/lib/intelligence/pipeline'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { toolName, version, rawChangelog, sourceUrl } = body

  if (!toolName || !version) {
    return NextResponse.json(
      { error: 'toolName and version are required' },
      { status: 400 },
    )
  }

  const result = await runPipeline('manual', {
    toolName,
    version,
    rawChangelog: rawChangelog || '',
    sourceUrl: sourceUrl || '',
  })

  return NextResponse.json(result)
}
