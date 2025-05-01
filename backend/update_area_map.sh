#!/bin/bash

# Default values
API_URL="http://localhost:5000/api"
AREA="Lubbock"
CREATE_SAMPLE=false
DATA_FILE=""
OUTPUT_FILE=""
SAMPLE_OUTPUT=""

print_usage() {
    echo "Usage: $0 [options] AREA"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV       Use predefined environment (dev, prod, vercel) for API URL"
    echo "  -a, --api URL       Use custom API URL"
    echo "  -d, --data FILE     Use data from JSON file"
    echo "  -o, --output FILE   Save map to custom output file"
    echo "  -s, --create-sample Create a sample data file for the area"
    echo "  --sample-output FILE Output file for sample data"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 Lubbock                 # Update Lubbock map using default data"
    echo "  $0 -e prod Lubbock         # Update using production API"
    echo "  $0 -d houston_data.json Houston  # Update Houston using data file"
    echo "  $0 -s 'San Antonio'        # Create sample data file for San Antonio"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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
        -a|--api)
            API_URL=$2
            shift 2
            ;;
        -d|--data)
            DATA_FILE=$2
            shift 2
            ;;
        -o|--output)
            OUTPUT_FILE=$2
            shift 2
            ;;
        -s|--create-sample)
            CREATE_SAMPLE=true
            shift
            ;;
        --sample-output)
            SAMPLE_OUTPUT=$2
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        -*|--*)
            echo "Unknown option $1"
            print_usage
            exit 1
            ;;
        *)
            AREA="$1"
            shift
            ;;
    esac
done

# Validate that we have an area name
if [[ -z "$AREA" ]]; then
    echo "Error: Area name is required"
    print_usage
    exit 1
fi

echo "Using API URL: $API_URL"
echo "Area: $AREA"

# Make sure we have the requests module
pip install requests --quiet

# Build the command
CMD="python3 update_area_map.py"

# Add area
CMD="$CMD \"$AREA\""

# Add API URL
CMD="$CMD --api \"$API_URL\""

# Add data file if specified
if [[ ! -z "$DATA_FILE" ]]; then
    CMD="$CMD --data \"$DATA_FILE\""
fi

# Add output file if specified
if [[ ! -z "$OUTPUT_FILE" ]]; then
    CMD="$CMD --output \"$OUTPUT_FILE\""
fi

# Add create-sample flag if needed
if [[ "$CREATE_SAMPLE" = true ]]; then
    CMD="$CMD --create-sample"
    
    # Add sample output if specified
    if [[ ! -z "$SAMPLE_OUTPUT" ]]; then
        CMD="$CMD --sample-output \"$SAMPLE_OUTPUT\""
    fi
fi

# Execute the command
echo "Executing: $CMD"
eval $CMD 