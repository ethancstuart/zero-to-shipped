import type { RawRelease, AdapterConfig, SourceAdapter } from './types'

export const rssAdapter: SourceAdapter = {
  async fetch(config: AdapterConfig): Promise<RawRelease[]> {
    const { url } = config as unknown as { url: string }

    const response = await fetch(url, { next: { revalidate: 0 } })
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status} for ${url}`)
    }

    const xml = await response.text()

    const items: RawRelease[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const itemXml = match[1]
      const title =
        itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        itemXml.match(/<title>(.*?)<\/title>/)?.[1] ||
        ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const description =
        itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
        itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] ||
        ''

      items.push({
        version: title,
        releaseDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        rawChangelog: description.replace(/<[^>]+>/g, '').slice(0, 5000),
        sourceUrl: link,
      })
    }

    return items
  },
}
