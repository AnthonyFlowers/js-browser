#!/bin/bash
# SessionStart hook: put the Node major from .nvmrc on PATH and install dependencies.
# Idempotent and quiet; does not touch git config.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

want="$(tr -d 'v \n' < .nvmrc | cut -d. -f1)"
have="$(node -v 2>/dev/null | tr -d v | cut -d. -f1 || true)"

if [ "$have" != "$want" ]; then
  bin="$(npx -y -p "node@$want" -c 'dirname "$(command -v node)"' 2>/dev/null | tail -n 1)"
  if [ -z "$bin" ] || [ ! -x "$bin/node" ]; then
    echo "session-start: could not get node@$want" >&2
    exit 1
  fi
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    line="export PATH=\"$bin:\$PATH\""
    grep -qxF "$line" "$CLAUDE_ENV_FILE" 2>/dev/null || echo "$line" >> "$CLAUDE_ENV_FILE"
  fi
  export PATH="$bin:$PATH"
fi

lock_hash="$(sha256sum package-lock.json | cut -d' ' -f1)"
stamp=node_modules/.package-lock-hash
if [ ! -d node_modules ] || [ "$(cat "$stamp" 2>/dev/null || true)" != "$lock_hash" ]; then
  npm ci --no-audit --no-fund --loglevel=error
  echo "$lock_hash" > "$stamp"
fi

echo "node $(node -v), deps ready"
