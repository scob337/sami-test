#!/usr/bin/env bash
# Install dependencies without frozen lockfile (CI-friendly), then build
set -euo pipefail
pnpm install --no-frozen-lockfile
pnpm run build
