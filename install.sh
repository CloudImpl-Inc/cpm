#!/bin/bash

# Function to install @cloudimpl-inc/cpm npm package globally
installCpmPackage() {
    npm install -g @cloudimpl-inc/cpm
}

# Function to add cpm-git plugin globally
addCpmGitPlugin() {
    cpm plugin add -g @cloudimpl-inc/cpm-git
}

# Function to install @cloudimpl-inc/cpm package and add cpm-git plugin globally
installAndConfigureCpm() {
    installCpmPackage
    addCpmGitPlugin
}

# Function to determine the shell
getShell() {
    local shellPath
    shellPath="${SHELL:-}"
    if [[ "$shellPath" == *"zsh"* ]]; then
        echo "zsh"
    else
        echo "bash"
    fi
}

# Function to set aliases
setAliases() {
    local shell startupFile cpmPath

    # Determine the shell
    shell=$(getShell)

    # Determine the shell startup file
    if [[ "$shell" == "zsh" ]]; then
        startupFile="$HOME/.zshrc"
    else
        startupFile="$HOME/.bashrc"
    fi

    # Check if cpm alias already exists in the shell startup file
    if ! grep -q "alias cpm=" "$startupFile"; then
        # Determine the full path of the cpm command
        cpmPath=$(command -v cpm)

        # Append the alias for cpm to the shell startup file
        echo "alias cpm=\"source $cpmPath\"" >> "$startupFile"

        echo -e "\033[0;32mAlias added: cpm=\"source $cpmPath\""
        echo -e "\033[0;33mRestart your terminal to use the 'cpm' command.\033[0m"
    else
        echo "Alias 'cpm' already exists in $startupFile"
    fi
}

# Call the function to install and configure @cloudimpl-inc/cpm
installAndConfigureCpm

# Call the setAliases function
setAliases
