#!/bin/bash

# Remove the cpm executable
if command -v cpm &> /dev/null; then
    sudo npm uninstall -g @cloudimpl-inc/cpm
else
    echo "Error: 'cpm' command not found."
fi

# Remove the .cpm directory from the user's home directory
if [ -d "$HOME/.cpm" ]; then
    rm -rf "$HOME/.cpm"
fi

# Remove aliases related to cpm from the user's shell configuration file
removeAliases() {
    local startupFiles=("$HOME/.bashrc" "$HOME/.zshrc")

    for startupFile in "${startupFiles[@]}"; do
        if grep -q "alias cpm=" "$startupFile"; then
            sed -i '/alias cpm=/d' "$startupFile"
            echo "Alias for cpm removed from $startupFile"
        fi
    done
}

removeAliases
