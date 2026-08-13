#!/bin/bash
set -e

echo "🚀 Setting up pre-commit hooks..."

# Install pre-commit hooks using the UI-local config (this folder is a
# subdirectory of the profile-hub git repository)
SCRIPT_DIR=$(dirname "$(realpath "$0")")
pre-commit install --config "$SCRIPT_DIR/../.pre-commit-config.yaml"

echo "✅ Pre-commit hooks installed!"
echo ""
echo "ℹ️  CloudFormation files will be validated and linted on each commit."
echo "ℹ️  To manually run all hooks: pre-commit run --all-files --config .pre-commit-config.yaml"
echo "ℹ️  To manually run cfn-lint: cfn-lint cicd/**/*.yaml"
echo "ℹ️  To manually run cfn-nag: cfn_nag_scan --input-path cicd/"
