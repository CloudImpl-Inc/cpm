#!/bin/bash

# Check if the first argument is 'goto'
if [ "$1" = "goto" ]; then
    # If 'goto' command is provided, change directory
    if [ $# -gt 1 ]; then
        # Define the output file path using the CPM_OUTPUT environment variable
        output_file=$(mktemp)

        # Execute the cpmjs find command and redirect its output to the specified output file
        env CPM_OUTPUT="$output_file" cpmjs find "$2" || exit

        # Read the output file and set environment variables
        while IFS='=' read -r key value || [ -n "$key" ]; do
            if [ "$key" = "path" ]; then
                repo_path="$value"
            fi
        done < "$output_file"

        if [ -z "$repo_path" ]; then
            echo "error: 'path' value not found in output"
            exit 1
        fi

        # Change directory to the output of the cpmjs find command
        cd "$repo_path" || exit

        # Remove the temporary output file
        rm "$output_file"
    else
        echo "error: missing required argument 'path'"
        exit 1
    fi
else
    # Run your Node.js CLI tool with arguments passed to the wrapper script
    cpmjs "$@"
fi
