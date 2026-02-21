#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | jq -re '.tool_input.file_path // empty')

if [[ "$file_path" == */.github/workflows/* ]]; then
  mise run //:gha:lint >&2 || exit 2
fi
