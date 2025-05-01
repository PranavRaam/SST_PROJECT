#!/bin/bash

# Default to localhost if no environment specified
API_URL="http://localhost:5000/api"

# Check if an environment parameter was provided
if [ $# -eq 1 ]; then
    case $1 in
        "dev")
            API_URL="http://localhost:5000/api"
            ;;
        "prod")
            API_URL="https://sst-project.onrender.com/api"
            ;;
        "vercel")
            API_URL="https://sst-project-kappa.vercel.app/api"
            ;;
        *)
            # If a URL was directly provided, use it
            API_URL=$1
            ;;
    esac
fi

echo "Using API URL: $API_URL"

# Make sure we have the requests module
pip install requests --quiet

# Run the Python script with the API URL
python3 update_lubbock_map.py "$API_URL" 