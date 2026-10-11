#!/usr/bin/env bash
set -euo pipefail

if (($# != 1)); then
  printf 'usage: %s <path to jbeam-lsp-server>\n' "$0" >&2
  exit 2
fi

server_path=$(realpath -- "$1")
if [[ ! -f $server_path || ! -x $server_path ]]; then
  printf 'error: %s is not an executable file\n' "$server_path" >&2
  exit 1
fi

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
core_path="$repo_root/external/jbeam-edit"
if [[ ! -f $core_path/examples/jbeam/fender.jbeam ]]; then
  printf 'error: %s has no examples, run: git submodule update --init\n' "$core_path" >&2
  exit 1
fi

export JBEAM_LSP_PATH="$server_path"
# A server run straight from a cabal build tree looks for its default ruleset
# in the install directory unless this points at a checkout of the core.
export jbeam_edit_datadir="${jbeam_edit_datadir:-$core_path}"

cd "$repo_root"
if command -v xvfb-run &>/dev/null; then
  xvfb-run --auto-servernum npm test
else
  npm test
fi
