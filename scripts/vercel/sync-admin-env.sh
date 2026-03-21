#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_ENV="${VERCEL_ENVIRONMENT:-production}"

require_var() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    echo "Falta variable requerida: ${key}" >&2
    exit 1
  fi
}

require_var VERCEL_TOKEN
require_var VERCEL_ORG_ID
require_var VERCEL_PROJECT_ID_ADMIN

ENV_LINES="$(bash "${ROOT_DIR}/scripts/aws/render-admin-env.sh")"

while IFS='=' read -r key value; do
  if [[ -z "${key}" ]]; then
    continue
  fi

  pnpm dlx vercel env rm "${key}" "${TARGET_ENV}" --yes --token="${VERCEL_TOKEN}" >/dev/null 2>&1 || true
  printf '%s\n' "${value}" | pnpm dlx vercel env add "${key}" "${TARGET_ENV}" --token="${VERCEL_TOKEN}" >/dev/null
  echo "Sincronizada ${key} -> ${TARGET_ENV}"
done <<< "${ENV_LINES}"
