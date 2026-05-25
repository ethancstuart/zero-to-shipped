import type { AdapterConfig, SourceAdapter } from './types'
import { githubReleasesAdapter } from './github-releases'
import { htmlScraperAdapter } from './html-scraper'
import { rssAdapter } from './rss'

const adapters: Record<string, SourceAdapter> = {
  github_releases: githubReleasesAdapter,
  html_scrape: htmlScraperAdapter,
  rss: rssAdapter,
}

export function getAdapter(config: AdapterConfig): SourceAdapter {
  const adapter = adapters[config.type]
  if (!adapter) {
    throw new Error(`Unknown adapter type: ${config.type}`)
  }
  return adapter
}
