import type { RawRelease, AdapterConfig, SourceAdapter } from './types'

interface GitHubReleaseResponse {
  tag_name: string
  published_at: string
  body: string
  html_url: string
}

export const githubReleasesAdapter: SourceAdapter = {
  async fetch(config: AdapterConfig): Promise<RawRelease[]> {
    const { owner, repo } = config as { owner: string; repo: string }
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} for ${owner}/${repo}`)
    }

    const releases: GitHubReleaseResponse[] = await response.json()

    return releases.map((r) => ({
      version: r.tag_name.replace(/^v/, ''),
      releaseDate: r.published_at,
      rawChangelog: r.body || '',
      sourceUrl: r.html_url,
    }))
  },
}
