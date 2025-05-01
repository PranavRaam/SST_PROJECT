# Updating Map Data

This document explains how to update the map data for a statistical area to fix discrepancies between listings and map markers.

## Problem

Sometimes there may be discrepancies between the number of PGs and HHAHs shown on the map compared to the actual listings. This can happen when:

1. The map data becomes stale or out of sync with the listings
2. The map file gets deleted or corrupted
3. Mock data is used instead of real data

## Solution

We've created scripts to update the map data for a statistical area with the correct PG and HHAH information.

## Available Scripts

- `update_lubbock_map.py` and `update_lubbock_map.sh`: Specific scripts for fixing the Lubbock area map
- `update_area_map.py` and `update_area_map.sh`: General scripts that can be used for any statistical area
- `auto_sync_listings_map.py` and `sync_map.sh`: **NEW** Automatically reads PG and HHAH data from the listings CSV files

## Using the Scripts

### NEW! Auto-Sync Listings with Maps

The recommended approach is to use the new auto-sync script that dynamically reads from the listings CSV files:

```bash
# Sync all areas from the listings CSV
./sync_map.sh

# Sync only the Lubbock area
./sync_map.sh -a Lubbock

# Use the production environment
./sync_map.sh -e prod

# Patch app.py to automatically sync on server start (without syncing now)
./sync_map.sh --patch-only
```

This script automatically:
1. Reads PG and HHAH data from the CSV files
2. Updates the map data through the API
3. Regenerates maps for all the areas found in the listings
4. Optionally patches `app.py` to automatically sync on server start

### Updating Lubbock Map

To update the Lubbock map with the predefined PG and HHAH data:

```bash
# Using the development server (localhost)
./update_lubbock_map.sh dev

# Using the production server
./update_lubbock_map.sh prod

# Using the Vercel deployment
./update_lubbock_map.sh vercel

# Using a custom API URL
./update_lubbock_map.sh https://your-custom-api-url.com/api
```

### Updating Any Area Map

The more general script supports updating any statistical area:

```bash
# Basic usage for Lubbock (uses default data)
./update_area_map.sh Lubbock

# Update a specific area using an environment
./update_area_map.sh -e prod "San Antonio"

# Update using a JSON data file
./update_area_map.sh -d houston_data.json Houston
```

### Creating a Sample Data File

You can create a sample data file for any area:

```bash
# Create a sample file for San Antonio
./update_area_map.sh -s "San Antonio"
```

This will generate a file called `san_antonio_data.json` that you can edit to add your actual PGs and HHAHs.

## Command Line Options

### sync_map.sh Options

```
Usage: ./sync_map.sh [options]

Automatically synchronizes PG and HHAH listings with the map display.

Options:
  -a, --area AREA      Sync only a specific area (e.g., Lubbock)
  -e, --env ENV        Use predefined environment for API URL (dev, prod, vercel)
  -u, --api-url URL    Use a custom API URL
  -p, --pg-csv FILE    Path to PG CSV file (default: Listing of all PG and HHAH - PG.csv)
  -h, --hhah-csv FILE  Path to HHAH CSV file (default: Listing of all PG and HHAH - HHAH.csv)
  --patch-only         Only patch app.py without syncing data
  --no-patch           Skip patching app.py even if sync is successful
  --help               Show this help message

Examples:
  ./sync_map.sh                   # Sync all areas using both PG and HHAH CSVs
  ./sync_map.sh -a Lubbock        # Sync only Lubbock area
  ./sync_map.sh -e prod           # Use production API URL
  ./sync_map.sh --patch-only      # Only patch app.py to auto-sync on restart
```

### update_area_map.sh Options

```
Usage: ./update_area_map.sh [options] AREA

Options:
  -e, --env ENV       Use predefined environment (dev, prod, vercel) for API URL
  -a, --api URL       Use custom API URL
  -d, --data FILE     Use data from JSON file
  -o, --output FILE   Save map to custom output file
  -s, --create-sample Create a sample data file for the area
  --sample-output FILE Output file for sample data
  -h, --help          Show this help message

Examples:
  ./update_area_map.sh Lubbock                 # Update Lubbock map using default data
  ./update_area_map.sh -e prod Lubbock         # Update using production API
  ./update_area_map.sh -d houston_data.json Houston  # Update Houston using data file
  ./update_area_map.sh -s 'San Antonio'        # Create sample data file for San Antonio
```

## How It Works

### Auto-Sync Script (Recommended)

The `auto_sync_listings_map.py` script:

1. Reads PG and HHAH data directly from the listings CSV files
2. Parses the data to identify all areas and their respective PGs and HHAHs
3. Sends the data to the API for each area
4. Clears the cache to ensure the new data is used
5. Regenerates maps for all areas
6. Optionally patches app.py to automate this process on server start

### Manual Update Scripts

The older scripts:

1. Send the correct PG and HHAH data to the API
2. Clear the cache to ensure the new data is used
3. Regenerate the main map
4. Regenerate the statistical area map for the specific area
5. Save the generated map to the backend cache directory

## Auto-Sync Server Integration

By using the `--patch-only` option with `sync_map.sh`, you can add automatic synchronization to the server:

```bash
./sync_map.sh --patch-only
```

This will:

1. Create a backup of the original app.py file
2. Add code to automatically read PG and HHAH data from the listings CSV files on server start
3. Keep maps in sync with listings without needing to run scripts manually

## Data Format

### Listings CSV Format

The scripts expect the CSV files to have the following format:

1. PG Listings CSV:
   - First row: Agency names (with first cell as header)
   - Second row: Locations
   
2. HHAH Listings CSV:
   - First row: Agency names (with first cell as header)
   - Second row: Locations

### JSON Data Format

For manual updates using the JSON format:

```json
{
  "area": "Area Name",
  "pgs": [
    {
      "name": "PG Name",
      "Agency Type": "PG",
      "Address": "PG Address",
      "Telephone": "(123) 456-7890"
    }
  ],
  "hhahs": [
    {
      "Agency Name": "HHAH Name",
      "Agency Type": "HHAH",
      "Address": "HHAH Address",
      "Telephone": "(123) 456-7890"
    }
  ]
}
```

## Troubleshooting

If you encounter issues:

1. Make sure the backend server is running
2. Check that the API URL is correct
3. Verify that the CSV files or JSON data files are valid
4. Check for any error messages in the output
5. Try using the `-e dev` option to test with the local development server

## Notes

- The scripts require Python 3 and the `requests` module
- The scripts will automatically install the `requests` module if it's not already installed
- The auto-sync script is recommended for ongoing maintenance as it keeps the maps always in sync with the listings 