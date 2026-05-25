import type { RawRelease, AdapterConfig, SourceAdapter } from './types'

export const htmlScraperAdapter: SourceAdapter = {
  async fetch(config: AdapterConfig): Promise<RawRelease[]> {
    const { url } = config as unknown as { url: string }

    const response = await fetch(url, { next: { revalidate: 0 } })
    if (!response.ok) {
      throw new Error(`Scrape failed: ${response.status} for ${url}`)
    }

    const html = await response.text()

    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 10000)

    return [
      {
        version: 'unknown',
        releaseDate: new Date().toISOString(),
        rawChangelog: textContent,
        sourceUrl: url,
      },
    ]
  },
}
