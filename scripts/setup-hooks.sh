#!/usr/bin/bash

# Create .hooks directory if it doesn't exist
mkdir -p .hooks

# Remove existing pre-commit hook if it exists
if [ -f .git/hooks/pre-commit ]; then
    rm .git/hooks/pre-commit
fi

# Create symlink from .git/hooks/pre-commit to .hooks/pre-commit
ln -sf ../../.hooks/pre-commit .git/hooks/pre-commit

dos2unix .hooks/pre-commit

# Ensure the pre-commit hook is executable
chmod +x .hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "Git hooks setup complete!"
