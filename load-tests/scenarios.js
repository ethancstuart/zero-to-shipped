import http from 'k6/http'
import { sleep, check } from 'k6'
import { Trend, Counter } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Custom metrics
const homepageTrend = new Trend('homepage_duration')
const pillarHubTrend = new Trend('pillar_hub_duration')
const contentDetailTrend = new Trend('content_detail_duration')
const apiTrend = new Trend('api_duration')

export const options = {
  scenarios: {
    normal_traffic: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m',
      exec: 'browseFlow',
      tags: { scenario: 'normal' },
    },
    peak_traffic: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '3m', target: 200 },
        { duration: '1m', target: 10 },
      ],
      exec: 'browseFlow',
      startTime: '11m',
      tags: { scenario: 'peak' },
    },
    api_burst: {
      executor: 'constant-vus',
      vus: 100,
      duration: '2m',
      exec: 'apiBurst',
      startTime: '17m',
      tags: { scenario: 'api_burst' },
    },
  },
  thresholds: {
    'http_req_duration{scenario:normal}': ['p(95)<2000'],
    'http_req_duration{scenario:peak}': ['p(95)<5000'],
    'http_req_failed{scenario:normal}': ['rate<0.01'],
    'http_req_failed{scenario:peak}': ['rate<0.05'],
    'http_req_failed{scenario:api_burst}': ['rate<0.15'], // Some 429s expected
  },
}

const PILLAR_PATHS = ['/pulse', '/build', '/learn', '/system']
const TOOL_PATHS = ['/tools', '/showcase']

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function thinkTime() {
  sleep(Math.random() * 3 + 2) // 2-5 seconds between requests
}

export function browseFlow() {
  // 1. Homepage
  let res = http.get(`${BASE_URL}/`, { tags: { name: 'homepage' } })
  homepageTrend.add(res.timings.duration)
  check(res, { 'homepage 200': (r) => r.status === 200 })
  thinkTime()

  // 2. Pillar hub
  const pillar = pickRandom(PILLAR_PATHS)
  res = http.get(`${BASE_URL}${pillar}`, { tags: { name: 'pillar_hub' } })
  pillarHubTrend.add(res.timings.duration)
  check(res, { 'pillar hub 200': (r) => r.status === 200 })
  thinkTime()

  // 3. Try to find and visit a content detail page
  // Use a known slug from the seeded content
  const knownSlugs = {
    '/learn': 'setup-and-first-build',
    '/build': 'landing-page-with-claude-code',
    '/pulse': 'welcome-to-prototype-studio',
    '/system': 'getting-started-with-agents',
  }
  const slug = knownSlugs[pillar]
  if (slug) {
    res = http.get(`${BASE_URL}${pillar}/${slug}`, { tags: { name: 'content_detail' } })
    contentDetailTrend.add(res.timings.duration)
    check(res, { 'content detail 200': (r) => r.status === 200 })
    thinkTime()
  }

  // 4. Tools or showcase
  res = http.get(`${BASE_URL}${pickRandom(TOOL_PATHS)}`, { tags: { name: 'tools' } })
  check(res, { 'tools/showcase 200': (r) => r.status === 200 })
  thinkTime()
}

export function apiBurst() {
  // Hit the public API endpoints aggressively to test rate limiting
  const endpoints = [
    '/api/v1/tools',
    '/api/v1/stats',
    '/api/v1/pulse',
    '/api/v1/capabilities',
    '/api/v1/showcase',
  ]
  const endpoint = pickRandom(endpoints)
  const res = http.get(`${BASE_URL}${endpoint}`, { tags: { name: 'api_endpoint' } })
  apiTrend.add(res.timings.duration)
  check(res, {
    'api responded': (r) => r.status === 200 || r.status === 429, // both acceptable
  })
}
