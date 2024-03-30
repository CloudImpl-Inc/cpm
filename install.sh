#!/bin/bash

# Function to install @cloudimpl-inc/cpm npm package globally
installCpmPackage() {
    sudo npm install -g @cloudimpl-inc/cpm
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

# Function to set aliases
setAliases() {
    local startupFiles=("$HOME/.bashrc" "$HOME/.zshrc")
    local cpmPath

    # Check if cpm alias already exists in any of the shell startup files
    for startupFile in "${startupFiles[@]}"; do
        # Create the file if it doesn't exist
        touch "$startupFile"

        if ! grep -q "alias cpm=" "$startupFile"; then
            # Determine the full path of the cpm command
            cpmPath=$(command -v cpm)

            # Append the alias for cpm to the shell startup file
            echo "alias cpm=\"source $cpmPath\"" >> "$startupFile"

            echo -e "\033[0;32mAlias added: cpm=\"source $cpmPath\" to $startupFile"
            echo -e "\033[0;33mRestart your terminal to use the 'cpm' command.\033[0m"
        else
            echo "Alias 'cpm' already exists in $startupFile"
        fi
    done
}

# Call the function to install and configure @cloudimpl-inc/cpm
installAndConfigureCpm

# Call the setAliases function
setAliases
