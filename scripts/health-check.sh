#!/usr/bin/env bash
set -euo pipefail
curl --fail --retry 5 --retry-delay 5 "${HEALTH_URL:-http://localhost:8080/api/health}"
