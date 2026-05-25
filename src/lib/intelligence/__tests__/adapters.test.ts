import { describe, it, expect, vi, afterEach } from 'vitest'
import { githubReleasesAdapter } from '@/lib/intelligence/adapters/github-releases'
import { htmlScraperAdapter } from '@/lib/intelligence/adapters/html-scraper'
import { rssAdapter } from '@/lib/intelligence/adapters/rss'
import { getAdapter } from '@/lib/intelligence/adapters/registry'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getAdapter', () => {
  it('returns github adapter for github_releases type', () => {
    const adapter = getAdapter({ type: 'github_releases', owner: 'test', repo: 'test' })
    expect(adapter).toBeDefined()
    expect(adapter.fetch).toBeInstanceOf(Function)
  })

  it('returns html scraper for html_scrape type', () => {
    const adapter = getAdapter({ type: 'html_scrape', url: 'https://example.com' })
    expect(adapter).toBeDefined()
  })

  it('returns rss adapter for rss type', () => {
    const adapter = getAdapter({ type: 'rss', url: 'https://example.com/feed.xml' })
    expect(adapter).toBeDefined()
  })

  it('throws for unknown adapter type', () => {
    expect(() => getAdapter({ type: 'unknown' as never })).toThrow('Unknown adapter type')
  })
})

describe('githubReleasesAdapter', () => {
  it('parses GitHub release response', async () => {
    const mockResponse = [
      {
        tag_name: 'v1.0.0',
        published_at: '2026-05-20T00:00:00Z',
        body: 'Release notes here',
        html_url: 'https://github.com/test/test/releases/tag/v1.0.0',
      },
    ]
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    )

    const releases = await githubReleasesAdapter.fetch({
      type: 'github_releases',
      owner: 'test',
      repo: 'test',
    })

    expect(releases).toHaveLength(1)
    expect(releases[0].version).toBe('1.0.0')
    expect(releases[0].rawChangelog).toBe('Release notes here')
    expect(releases[0].sourceUrl).toBe('https://github.com/test/test/releases/tag/v1.0.0')
  })

  it('strips v prefix from version tags', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            tag_name: 'v2.3.1',
            published_at: '2026-05-20T00:00:00Z',
            body: '',
            html_url: 'https://github.com/t/t/releases/tag/v2.3.1',
          },
        ]),
        { status: 200 },
      ),
    )

    const releases = await githubReleasesAdapter.fetch({
      type: 'github_releases',
      owner: 't',
      repo: 't',
    })
    expect(releases[0].version).toBe('2.3.1')
  })

  it('throws on API error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404 }),
    )

    await expect(
      githubReleasesAdapter.fetch({
        type: 'github_releases',
        owner: 'bad',
        repo: 'repo',
      }),
    ).rejects.toThrow('GitHub API error: 404')
  })
})

describe('htmlScraperAdapter', () => {
  it('extracts text from HTML', async () => {
    const html =
      '<html><body><h1>Update v1.2</h1><p>New features here</p><script>evil()</script></body></html>'
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(html, { status: 200 }),
    )

    const releases = await htmlScraperAdapter.fetch({
      type: 'html_scrape',
      url: 'https://example.com/changelog',
    })

    expect(releases).toHaveLength(1)
    expect(releases[0].rawChangelog).toContain('Update v1.2')
    expect(releases[0].rawChangelog).toContain('New features here')
    expect(releases[0].rawChangelog).not.toContain('evil()')
    expect(releases[0].sourceUrl).toBe('https://example.com/changelog')
  })
})

describe('rssAdapter', () => {
  it('parses RSS feed items', async () => {
    const rss = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Release 3.0</title>
      <link>https://example.com/post/release-3</link>
      <pubDate>Mon, 20 May 2026 00:00:00 GMT</pubDate>
      <description>Big update with new features</description>
    </item>
  </channel>
</rss>`
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(rss, { status: 200 }),
    )

    const releases = await rssAdapter.fetch({
      type: 'rss',
      url: 'https://example.com/feed.xml',
    })

    expect(releases).toHaveLength(1)
    expect(releases[0].version).toBe('Release 3.0')
    expect(releases[0].rawChangelog).toBe('Big update with new features')
    expect(releases[0].sourceUrl).toBe('https://example.com/post/release-3')
  })
})
