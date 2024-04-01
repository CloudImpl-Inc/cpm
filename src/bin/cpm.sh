#!/bin/bash

# Check if the first and second arguments are 'project' and 'goto'
if [ "$1" = "project" ] && [ "$2" = "goto" ]; then
    # If 'project' and 'goto' commands are provided, continue with the rest of the script
    if [ $# -gt 2 ]; then
        # Define the output file path using the CPM_OUTPUT environment variable
        output_file=$(mktemp)

        # Execute the cpmjs find command and redirect its output to the specified output file
        env CPM_OUTPUT="$output_file" cpmjs project goto "$3" || return

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
        cpmjs project goto
    fi
else
    # Run your Node.js CLI tool with arguments passed to the wrapper script
    cpmjs "$@"
fi
