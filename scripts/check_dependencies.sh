#!/usr/bin/env bash
set -euo pipefail

DIRECT_DEPS=$(jq -r '.dependencies, .devDependencies | keys[]?' package.json)

OUTDATED=$(npm outdated --json || true)

if [ -z "$OUTDATED" ] || [ "$OUTDATED" = "null" ]; then
  echo "No outdated direct dependencies."
  exit 0
fi

IGNORE_JSON=$(printf '%s\n' "${IGNORE_LIST[@]}" | jq -R . | jq -s .)

OUTDATED_DIRECT=$(echo "$OUTDATED" | jq -r \
  --argjson deps "$(printf '%s\n' "$DIRECT_DEPS" | jq -R . | jq -s .)" \
  --argjson ignore "$IGNORE_JSON" -f ./scripts/check_dependencies.jq)

if [ "$(echo "$OUTDATED_DIRECT" | jq 'length')" -eq 0 ]; then
  echo "No relevant outdated direct dependencies."
  exit 0
fi

echo "Outdated direct dependencies found (excluding ignored):"
echo "$OUTDATED_DIRECT" | jq .
exit 1
