# Load Test Baseline

**Last run:** TBD (run via `load-tests/run.sh`)
**Target:** https://zerotoship.app (or http://localhost:3000 for local)

## How to Run

```bash
# Local (against dev server)
npm run dev  # in one terminal

# In another terminal:
brew install k6  # one-time
./load-tests/run.sh

# Against production
BASE_URL=https://zerotoship.app ./load-tests/run.sh
```

## Scenarios

| Scenario | Duration | VUs | Purpose |
|----------|----------|-----|---------|
| `normal_traffic` | 10 min | 50 constant | Steady state simulation |
| `peak_traffic` | 5 min | 10→200 ramp | Surge handling |
| `api_burst` | 2 min | 100 constant | Rate limiter validation |

## Thresholds

| Metric | Threshold | Notes |
|--------|-----------|-------|
| Normal: p95 response | < 2000ms | Standard expectation |
| Peak: p95 response | < 5000ms | Degraded but functional |
| Normal: error rate | < 1% | Should be near zero |
| Peak: error rate | < 5% | Some degradation acceptable |
| API burst: error rate | < 15% | 429s expected from rate limiter |

## Baseline Results

(Run the load test and fill in this section)

### Normal Traffic (50 VUs constant, 10 min)
- p50 response time: TBD
- p95 response time: TBD
- p99 response time: TBD
- Total requests: TBD
- Error rate: TBD

### Peak Traffic (ramp 10→200, 5 min)
- p50 response time: TBD
- p95 response time: TBD
- Total requests: TBD
- Error rate: TBD
- First bottleneck: TBD

### API Burst (100 VUs, 2 min)
- Total requests: TBD
- 200 responses: TBD
- 429 responses: TBD (this is GOOD — proves rate limiter works)
- p95 response: TBD

## Bottlenecks Identified

(Fill after run)

## Recommendations

(Fill after run)

## Cost Impact

A 10-minute normal traffic run hits:
- ~30,000 page loads (50 VUs × 600s / 1s avg flow)
- Supabase: ~150,000 queries (5 per page load)
- Claude API: 0 (assistant not in flow)
- Gemini: 0

This is more than a full day of normal real traffic. The test is intentionally aggressive.
