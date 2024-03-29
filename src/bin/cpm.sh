#!/bin/bash

# Check if the first argument is 'cd'
if [ "$1" = "cd" ]; then
    # If 'cd' command is provided, change directory
    if [ $# -gt 1 ]; then
        cd "$(cpmjs find "$2")" || exit
    else
        echo "error: missing required argument 'path'"
        exit 1
    fi
else
    # Run your Node.js CLI tool with arguments passed to the wrapper script
    cpmjs "$@"
fi
