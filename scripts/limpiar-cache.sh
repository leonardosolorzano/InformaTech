#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

find "$PROJECT_ROOT" \
  -type d \( -name .git -o -name .venv -o -name node_modules \) -prune -o \
  -type d \( \
    -name __pycache__ -o \
    -name .pytest_cache -o \
    -name .mypy_cache -o \
    -name .ruff_cache -o \
    -name .next -o \
    -name .turbo -o \
    -name .vite \
  \) -prune -print -exec rm -rf -- {} +

printf 'Cachés temporales eliminados. Puedes volver a iniciar los servidores.\n'
