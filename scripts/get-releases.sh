#!/usr/bin/env bash
set -euo pipefail

min_version="$(jq -r '.requiredJbeamEditVersion' <package.json)"

selected_release=$(
  gh release list --repo webdevred/jbeam_edit |
    awk '{print $1}' |
    sed 's/^v//' |
    sort -V |
    awk -v min="$min_version" -f ./scripts/compare_with_min.awk
)

js_array='[{"jbeam_lsp_server":"'"v${min_version}"'"}'
[[ -n "$selected_release" ]] && js_array+=',{"jbeam_lsp_server":"'"v${selected_release}"'"}'
js_array+=']'

echo "$js_array" | jq .

printf '{"include" : matrix=%s}\n' "${js_array}"

if [[ "$GITHUB_OUTPUT" != "" ]]; then
  printf 'matrix={"include" : %s}\n' "${js_array}" >> "$GITHUB_OUTPUT"
fi
