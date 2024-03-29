#!/bin/bash

# Check if the first argument is 'goto'
if [ "$1" = "goto" ]; then
    # If 'goto' command is provided, change directory
    if [ $# -gt 1 ]; then
        # Define the output file path using the CPM_OUTPUT environment variable
        output_file=$(mktemp)

        # Execute the cpmjs find command and redirect its output to the specified output file
        env CPM_OUTPUT="$output_file" cpmjs goto "$2" || return

        # Read the output file and set environment variables
        while IFS='=' read -r key value || [ -n "$key" ]; do
            if [ "$key" = "path" ]; then
                repo_path="$value"
            fi
        done < "$output_file"

        if [ -n "${repo_path+x}" ] && [ "${repo_path}" != "undefined" ]; then
            cd "$repo_path" || return
        fi

        # Remove the temporary output file
        rm "$output_file"
    else
        # Show cpm error message
        cpmjs goto
    fi
else
    # Run your Node.js CLI tool with arguments passed to the wrapper script
    cpmjs "$@"
fi
