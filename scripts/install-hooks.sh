#!/bin/sh
REPO_ROOT=$(git rev-parse --show-toplevel)
cp "$REPO_ROOT/scripts/pre-commit.sh" "$REPO_ROOT/.git/hooks/pre-commit"
chmod +x "$REPO_ROOT/.git/hooks/pre-commit"
echo "Git hooks installed."
