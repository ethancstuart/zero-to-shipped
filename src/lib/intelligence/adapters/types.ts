export interface RawRelease {
  version: string
  releaseDate: string
  rawChangelog: string
  sourceUrl: string
}

export interface AdapterConfig {
  type: 'github_releases' | 'html_scrape' | 'rss'
  [key: string]: unknown
}

export interface SourceAdapter {
  fetch(config: AdapterConfig): Promise<RawRelease[]>
}
