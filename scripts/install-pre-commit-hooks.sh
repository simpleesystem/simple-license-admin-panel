#!/bin/bash
# Install pre-commit hooks for admin-panel
# This script ensures hooks are installed when the repo is cloned or when dependencies are installed

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PANEL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PANEL_DIR}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Not in a git repository, skipping pre-commit hook installation"
  exit 0
fi

# Check if pre-commit is available
if ! command -v pre-commit > /dev/null 2>&1; then
  # Try python3 -m pre_commit as fallback
  if ! python3 -m pre_commit --version > /dev/null 2>&1; then
    echo "pre-commit not found, skipping hook installation"
    echo "Install with: pip install pre-commit (or brew install pre-commit)"
    exit 0
  fi
fi

# Check if .pre-commit-config.yaml exists
if [ ! -f ".pre-commit-config.yaml" ]; then
  echo ".pre-commit-config.yaml not found, skipping hook installation"
  exit 0
fi

# Install hooks (idempotent - safe to run multiple times)
if command -v pre-commit > /dev/null 2>&1; then
  if pre-commit install > /dev/null 2>&1; then
    echo "✅ Pre-commit hooks installed successfully"
  else
    echo "⚠️  Pre-commit hook installation failed (hooks may already be installed)"
  fi
elif python3 -m pre_commit install > /dev/null 2>&1; then
  echo "✅ Pre-commit hooks installed successfully"
else
  echo "⚠️  Pre-commit hook installation failed (hooks may already be installed)"
fi

exit 0
