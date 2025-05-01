#!/bin/bash

# Make sure the Python script is executable
chmod +x auto_sync_listings_map.py

# Default values
API_URL="http://localhost:5000/api"
PG_CSV="Listing of all PG and HHAH - PG.csv"
HHAH_CSV="Listing of all PG and HHAH - HHAH.csv"
AREA=""
PATCH_APP=false
NO_PATCH=false

print_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Automatically synchronizes PG and HHAH listings with the map display."
    echo ""
    echo "Options:"
    echo "  -a, --area AREA      Sync only a specific area (e.g., Lubbock)"
    echo "  -e, --env ENV        Use predefined environment for API URL (dev, prod, vercel)"
    echo "  -u, --api-url URL    Use a custom API URL"
    echo "  -p, --pg-csv FILE    Path to PG CSV file (default: $PG_CSV)"
    echo "  -h, --hhah-csv FILE  Path to HHAH CSV file (default: $HHAH_CSV)"
    echo "  --patch-only         Only patch app.py without syncing data"
    echo "  --no-patch           Skip patching app.py even if sync is successful"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Sync all areas using both PG and HHAH CSVs"
    echo "  $0 -a Lubbock        # Sync only Lubbock area"
    echo "  $0 -e prod           # Use production API URL"
    echo "  $0 --patch-only      # Only patch app.py to auto-sync on restart"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--area)
            AREA="$2"
            shift 2
            ;;
        -e|--env)
            case $2 in
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
                    echo "Unknown environment: $2"
                    echo "Valid environments: dev, prod, vercel"
                    exit 1
                    ;;
            esac
            shift 2
            ;;
        -u|--api-url)
            API_URL="$2"
            shift 2
            ;;
        -p|--pg-csv)
            PG_CSV="$2"
            shift 2
            ;;
        -h|--hhah-csv)
            HHAH_CSV="$2"
            shift 2
            ;;
        --patch-only)
            PATCH_APP=true
            shift
            ;;
        --no-patch)
            NO_PATCH=true
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Ensure requests module is installed
pip install requests --quiet

# Build command
CMD="./auto_sync_listings_map.py --pg-csv \"$PG_CSV\" --api \"$API_URL\""

# Add HHAH CSV if it exists
if [ -f "$HHAH_CSV" ]; then
    CMD="$CMD --hhah-csv \"$HHAH_CSV\""
fi

# Add area if specified
if [ ! -z "$AREA" ]; then
    CMD="$CMD --area \"$AREA\""
fi

# If patch-only mode
if [ "$PATCH_APP" = true ]; then
    CMD="$CMD --patch-app"
fi

# If no-patch mode
if [ "$NO_PATCH" = true ]; then
    CMD="$CMD --no-patch"
fi

# Print command and execute
echo "Executing: $CMD"
eval $CMD 