#!/bin/bash
set -euo pipefail
echo "=== chittymonitor Onboarding ==="
curl -s -X POST "${GETCHITTY_ENDPOINT:-https://get.chitty.cc/api/onboard}" \
  -H "Content-Type: application/json" \
  -d '{"service_name":"chittymonitor","organization":"CHITTYOS","type":"service","tier":3,"domains":["monitor.chitty.cc"]}' | jq .
