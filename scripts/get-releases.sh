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

vscode_versions='["1.82.0","stable"]'
cross_product=$(jq -n --argjson jbeam "$js_array" --argjson vscode "$vscode_versions" \
  '[$jbeam[] | . as $j | $vscode[] | {jbeam_lsp_server: $j.jbeam_lsp_server, vscode_version: .}]')

echo "$cross_product" | jq .

if [[ "$GITHUB_OUTPUT" != "" ]]; then
  printf 'matrix={"include" : %s}\n' "${cross_product}" >> "$GITHUB_OUTPUT"
fi
