#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"

echo "🚗 Spouštím Městskou Trasu na http://127.0.0.1:${PORT}/"
echo "Ukončení: Ctrl+C"
python -m http.server "$PORT"
