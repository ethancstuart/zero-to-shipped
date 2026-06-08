#!/bin/bash
set -e

BASE_URL=${BASE_URL:-http://localhost:3000}

echo "🚀 Load test against: $BASE_URL"
echo "📊 Scenarios: normal_traffic (10m, 50 VUs) → peak_traffic (5m, ramp to 200) → api_burst (2m, 100 VUs)"
echo "⏱️  Total runtime: ~19 minutes"
echo ""

# Check k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "❌ k6 not found. Install with: brew install k6"
  echo "   Or visit: https://k6.io/docs/getting-started/installation/"
  exit 1
fi

# Check target is reachable
echo "🔍 Checking target..."
if ! curl -sSf -o /dev/null "$BASE_URL"; then
  echo "❌ Cannot reach $BASE_URL"
  echo "   Make sure the server is running: npm run dev (or npm run start for production build)"
  exit 1
fi
echo "✅ Target reachable"
echo ""

# Run the test
BASE_URL="$BASE_URL" k6 run \
  --summary-export=load-tests/results/summary-$(date +%Y%m%d-%H%M%S).json \
  load-tests/scenarios.js
