#!/usr/bin/env bash
set -euo pipefail

# API Comparison Benchmark: Bun/Elysia vs Go/Chi
# Requires: both servers running + curl + a valid session cookie
#
# Usage: ./benchmark.sh [requests_per_test]
#
# Bun API: http://localhost:3000
# Go  API: http://localhost:3002

REQUESTS=${1:-50}
BUN_URL="http://localhost:3000"
GO_URL="http://localhost:3002"
RESULTS_FILE="results_$(date +%Y%m%d_%H%M%S).md"

echo "============================================"
echo "  API Performance Comparison"
echo "  Bun/Elysia (port 3000) vs Go/Chi (port 3002)"
echo "  Requests per test: $REQUESTS"
echo "============================================"
echo ""

# Sign in to both servers and capture cookies
echo "Signing in to Bun server..."
curl -s -X POST "$BUN_URL/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -c /tmp/bench_bun_cookies.txt \
  -d '{"email":"test@example.com","password":"TestPassword123!"}' > /dev/null

echo "Signing in to Go server..."
curl -s -X POST "$GO_URL/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -c /tmp/bench_go_cookies.txt \
  -d '{"email":"test@example.com","password":"TestPassword123!"}' > /dev/null

echo ""

# Benchmark function: runs N requests and reports avg latency
bench() {
  local label="$1"
  local url="$2"
  local method="${3:-GET}"
  local body="${4:-}"
  local cookies="${5:-}"
  local total_ms=0
  local count=0
  local min_ms=999999
  local max_ms=0

  for i in $(seq 1 "$REQUESTS"); do
    local args=(-s -o /dev/null -w "%{time_total}")
    if [ -n "$cookies" ]; then
      args+=(-b "$cookies")
    fi
    if [ "$method" = "POST" ]; then
      args+=(-X POST -H "Content-Type: application/json" -d "$body")
    fi

    local time_s
    time_s=$(curl "${args[@]}" "$url")
    local time_ms
    time_ms=$(echo "$time_s * 1000" | bc)
    total_ms=$(echo "$total_ms + $time_ms" | bc)

    local time_int=${time_ms%%.*}
    time_int=${time_int:-0}
    [ -n "$time_int" ] && [ "$time_int" -lt "$min_ms" ] 2>/dev/null && min_ms=$time_int
    [ -n "$time_int" ] && [ "$time_int" -gt "$max_ms" ] 2>/dev/null && max_ms=$time_int
    count=$((count + 1))
  done

  local avg
  avg=$(echo "scale=1; $total_ms / $count" | bc)
  printf "  %-35s avg: %6s ms  min: %3d ms  max: %3d ms\n" "$label" "$avg" "$min_ms" "$max_ms"
  echo "$label|$avg|$min_ms|$max_ms" >> /tmp/bench_raw.txt
}

rm -f /tmp/bench_raw.txt

ENDPOINTS=(
  "GET /|/|GET||"
  "GET /api/v1/feed|/api/v1/feed?limit=5|GET||_COOKIES_"
  "GET /api/v1/feed/following|/api/v1/feed/following?limit=5|GET||_COOKIES_"
  "GET /api/v1/profile/me|/api/v1/profile/me|GET||_COOKIES_"
  "GET /api/v1/profile/:username|/api/v1/profile/testuser|GET||"
  "GET /api/v1/followers/:username|/api/v1/followers/alice|GET||"
  "GET /api/v1/following/:username|/api/v1/following/testuser|GET||"
  "GET /api/v1/graph/trending|/api/v1/graph/trending?limit=5|GET||_COOKIES_"
  "GET /api/v1/onboarding/:id|/api/v1/onboarding/2032372199385468928|GET||"
  "GET /api/v1/username/:name|/api/v1/username/testuser|GET||"
)

echo "--- Bun/Elysia (port 3000) ---"
for entry in "${ENDPOINTS[@]}"; do
  IFS='|' read -r label path method body cookies <<< "$entry"
  cookie_file=""
  if [ "$cookies" = "_COOKIES_" ]; then
    cookie_file="/tmp/bench_bun_cookies.txt"
  fi
  bench "Bun $label" "${BUN_URL}${path}" "$method" "$body" "$cookie_file"
done

echo ""
echo "--- Go/Chi (port 3002) ---"
for entry in "${ENDPOINTS[@]}"; do
  IFS='|' read -r label path method body cookies <<< "$entry"
  cookie_file=""
  if [ "$cookies" = "_COOKIES_" ]; then
    cookie_file="/tmp/bench_go_cookies.txt"
  fi
  bench "Go  $label" "${GO_URL}${path}" "$method" "$body" "$cookie_file"
done

echo ""
echo "============================================"
echo "  Benchmark complete. $REQUESTS requests per endpoint."
echo "============================================"

# Generate markdown report
cat > "$RESULTS_FILE" << EOF
# API Performance Comparison

**Date:** $(date)
**Requests per endpoint:** $REQUESTS
**Bun/Elysia:** $BUN_URL (port 3000)
**Go/Chi:** $GO_URL (port 3002)

| Endpoint | Bun Avg (ms) | Go Avg (ms) | Winner |
|----------|-------------|------------|--------|
EOF

while IFS='|' read -r label avg min max; do
  echo "$label|$avg|$min|$max"
done < /tmp/bench_raw.txt | paste - - | while IFS=$'\t' read -r bun_line go_line; do
  bun_label=$(echo "$bun_line" | cut -d'|' -f1 | sed 's/^Bun //')
  bun_avg=$(echo "$bun_line" | cut -d'|' -f2)
  go_avg=$(echo "$go_line" | cut -d'|' -f2)

  if (( $(echo "$bun_avg < $go_avg" | bc -l) )); then
    winner="Bun"
  else
    winner="Go"
  fi

  echo "| $bun_label | $bun_avg | $go_avg | $winner |" >> "$RESULTS_FILE"
done

echo ""
echo "Results saved to: $RESULTS_FILE"
