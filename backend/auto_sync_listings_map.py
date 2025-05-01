#!/usr/bin/env python3
import requests
import json
import os
import sys
import argparse
import csv
import re

# API URL - change this to your actual backend URL
DEFAULT_API_URL = "http://localhost:5000/api"

def read_listings_csv(csv_path):
    """Read PG and HHAH data from CSV file"""
    try:
        areas_data = {}
        
        with open(csv_path, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            if len(rows) < 2:
                print(f"Error: CSV file {csv_path} has insufficient data")
                return {}
            
            # First row contains PG names, second row contains locations
            pg_names = rows[0]
            pg_locations = rows[1]
            
            # Debug: print the first few entries to verify the data
            print(f"DEBUG: First 5 PG entries:")
            for i in range(1, min(6, len(pg_names))):
                print(f"  {i}: '{pg_names[i]}' at '{pg_locations[i]}'")
            
            # Process each column
            for i in range(1, len(pg_names)):  # Skip the first cell (header)
                if not pg_names[i] or pg_names[i].strip() == '':
                    continue
                    
                pg_name = pg_names[i].strip()
                location = pg_locations[i].strip() if i < len(pg_locations) else ""
                
                if not location:
                    continue
                    
                # Initialize area data if this is a new area
                if location not in areas_data:
                    areas_data[location] = {
                        "area": location,
                        "pgs": [],
                        "hhahs": []
                    }
                
                # Add PG to the appropriate area
                areas_data[location]["pgs"].append({
                    "name": pg_name,
                    "Agency Type": "PG",
                    "Address": f"{pg_name} Office, {location}",
                    "Telephone": "(555) 123-4567"  # Placeholder
                })
        
        print(f"Found PG data for {len(areas_data)} areas: {', '.join(areas_data.keys())}")
        return areas_data
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
        return {}

def read_hhah_listings_csv(csv_path, existing_areas_data=None):
    """Read HHAH data from CSV file and merge with existing area data"""
    if existing_areas_data is None:
        existing_areas_data = {}
    
    try:
        with open(csv_path, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            if len(rows) < 2:
                print(f"Error: HHAH CSV file {csv_path} has insufficient data")
                return existing_areas_data
            
            # First row contains HHAH names
            hhah_names = rows[0] 
            hhah_locations = rows[1]
            
            # Debug: print the first few entries to verify the data
            print(f"DEBUG: First 10 HHAH entries:")
            for i in range(1, min(11, len(hhah_names))):
                print(f"  {i}: '{hhah_names[i]}' at '{hhah_locations[i]}'")
            
            # Create a count of HHAHs per location to track what we're finding
            location_counts = {}
            
            # Process each column
            for i in range(1, len(hhah_names)):  # Skip the first cell (header)
                if not hhah_names[i] or hhah_names[i].strip() == '':
                    continue
                    
                hhah_name = hhah_names[i].strip()
                location = hhah_locations[i].strip() if i < len(hhah_locations) else ""
                
                if not location:
                    print(f"WARNING: Skipping HHAH '{hhah_name}' because location is empty")
                    continue
                
                # Track counts for debugging
                if location not in location_counts:
                    location_counts[location] = 0
                location_counts[location] += 1
                    
                # Initialize area data if this is a new area
                if location not in existing_areas_data:
                    existing_areas_data[location] = {
                        "area": location,
                        "pgs": [],
                        "hhahs": []
                    }
                
                # Check if this HHAH is already in the list to avoid duplicates
                # (This can happen if there are duplicate entries in the CSV)
                already_exists = False
                for existing_hhah in existing_areas_data[location]["hhahs"]:
                    if existing_hhah.get("Agency Name") == hhah_name:
                        already_exists = True
                        break
                
                if already_exists:
                    print(f"WARNING: Skipping duplicate HHAH '{hhah_name}' in location '{location}'")
                    continue
                
                # Add HHAH to the appropriate area
                existing_areas_data[location]["hhahs"].append({
                    "Agency Name": hhah_name,
                    "Agency Type": "HHAH",
                    "Address": f"{hhah_name} Office, {location}",
                    "Telephone": "(555) 987-6543"  # Placeholder
                })
        
        # Print debug counts
        print("\nDEBUG: HHAH Counts by Location from CSV:")
        for loc, count in location_counts.items():
            print(f"  {loc}: {count} HHAHs")
        
        # Print HHAH counts from our data structure
        print("\nFinal Area Counts:")
        for area, data in existing_areas_data.items():
            print(f"Area: {area} - PGs: {len(data['pgs'])}, HHAHs: {len(data['hhahs'])}")
            # Print each HHAH for Lubbock for debugging
            if area == "Lubbock":
                print("  Lubbock HHAHs:")
                for hhah in data["hhahs"]:
                    print(f"    - {hhah['Agency Name']}")
        
        return existing_areas_data
    except Exception as e:
        print(f"Error reading HHAH CSV file: {str(e)}")
        return existing_areas_data

def update_map_data(area_name, area_data, api_url=DEFAULT_API_URL, output_file=None):
    """Send the area data to the API"""
    try:
        print(f"Updating map data for {area_name} with {len(area_data['pgs'])} PGs and {len(area_data['hhahs'])} HHAHs")
        
        # Print each HHAH for verification if it's Lubbock
        if area_name == "Lubbock":
            print("Lubbock HHAHs being sent to API:")
            for hhah in area_data["hhahs"]:
                print(f"  - {hhah['Agency Name']}")
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{api_url}/update-map-data",
            headers=headers,
            json=area_data
        )
        
        if response.status_code == 200:
            print("Successfully updated map data!")
            print(response.json())
            
            # Clear the cache to force regeneration
            clear_response = requests.get(f"{api_url}/clear-cache")
            if clear_response.status_code == 200:
                print("Successfully cleared cache!")
                print(clear_response.json())
            else:
                print(f"Failed to clear cache: {clear_response.status_code}")
                print(clear_response.text)
            
            # Regenerate the map
            regen_response = requests.get(f"{api_url}/generate-map?force=true")
            if regen_response.status_code == 200:
                print("Successfully requested map regeneration!")
                print(regen_response.json())
            else:
                print(f"Failed to regenerate map: {regen_response.status_code}")
                print(regen_response.text)
            
            # Regenerate statistical area map
            safe_area_name = area_name.replace(" ", "%20").replace(",", "%2C")
            stat_response = requests.get(f"{api_url}/statistical-area-map/{safe_area_name}?force_regen=true")
            if stat_response.status_code == 200:
                print(f"Successfully regenerated statistical area map for {area_name}!")
                
                # Save the map html to a file if requested
                if output_file:
                    file_path = output_file
                else:
                    file_path = f"statistical_area_{area_name.replace(' ', '_').replace(',', '').replace('-', '_')}_lightweight.html"
                
                with open(file_path, "w") as f:
                    f.write(stat_response.text)
                print(f"Saved map file to {file_path}")
                
                # Also save to backend/cache
                cache_path = os.path.join("backend", "cache", os.path.basename(file_path))
                try:
                    with open(cache_path, "w") as f:
                        f.write(stat_response.text)
                    print(f"Also saved map to backend cache: {cache_path}")
                except Exception as cache_err:
                    print(f"Warning: Could not save to backend cache: {str(cache_err)}")
                
                return True
            else:
                print(f"Failed to regenerate statistical area map: {stat_response.status_code}")
        else:
            print(f"Failed to update map data: {response.status_code}")
            print(response.text)
        
        return False
    except Exception as e:
        print(f"Error updating map data: {str(e)}")
        return False

def patch_app_py(api_url=DEFAULT_API_URL):
    """Patch app.py to automatically load our data for future server restarts"""
    try:
        # Check if we can connect to the API
        health_response = requests.get(f"{api_url}/health")
        if health_response.status_code != 200:
            print(f"Warning: Cannot connect to API at {api_url}. Skipping app.py patch.")
            return False
        
        app_py_path = "backend/app.py"
        if not os.path.exists(app_py_path):
            print(f"Warning: {app_py_path} not found. Skipping app.py patch.")
            return False
        
        # Read the current app.py file
        with open(app_py_path, 'r') as f:
            content = f.read()
        
        # Check if our code is already in app.py
        if "# Auto-sync listings with map data" in content:
            print("app.py is already patched. Skipping.")
            return True
        
        # Find the position to insert our code (before if __name__ == '__main__':)
        main_pattern = re.compile(r"if\s+__name__\s*==\s*['\"]__main__['\"]")
        match = main_pattern.search(content)
        
        if not match:
            print("Warning: Could not find appropriate location to patch app.py")
            return False
        
        insert_position = match.start()
        
        # Code to insert - improved version with better debugging and duplicate checking
        patch_code = """
# Auto-sync listings with map data
real_map_data = {}

def load_listings_data():
    \"\"\"Load PG and HHAH data from listings CSV files\"\"\"
    try:
        import csv
        import os
        
        pg_csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Listing of all PG and HHAH - PG.csv")
        if not os.path.exists(pg_csv_path):
            logger.warning(f"PG listings file not found: {pg_csv_path}")
            return
        
        areas_data = {}
        
        with open(pg_csv_path, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            if len(rows) < 2:
                logger.warning(f"PG CSV file has insufficient data")
                return
            
            # First row contains PG names, second row contains locations
            pg_names = rows[0]
            pg_locations = rows[1]
            
            # Process each column
            for i in range(1, len(pg_names)):
                if not pg_names[i] or pg_names[i].strip() == '':
                    continue
                    
                pg_name = pg_names[i].strip()
                location = pg_locations[i].strip() if i < len(pg_locations) else ""
                
                if not location:
                    continue
                    
                # Initialize area data if this is a new area
                if location not in areas_data:
                    areas_data[location] = {
                        "area": location,
                        "pgs": [],
                        "hhahs": []
                    }
                
                # Check for duplicate PGs
                already_exists = False
                for existing_pg in areas_data[location]["pgs"]:
                    if existing_pg.get("name") == pg_name:
                        already_exists = True
                        break
                
                if already_exists:
                    continue
                
                # Add PG to the appropriate area
                areas_data[location]["pgs"].append({
                    "name": pg_name,
                    "Agency Type": "PG",
                    "Address": f"{pg_name} Office, {location}",
                    "Telephone": "(555) 123-4567"  # Placeholder
                })
        
        # Now add HHAH data if available
        hhah_csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Listing of all PG and HHAH - HHAH.csv")
        if os.path.exists(hhah_csv_path):
            with open(hhah_csv_path, 'r') as f:
                reader = csv.reader(f)
                rows = list(reader)
                
                if len(rows) >= 2:
                    # First row contains HHAH names
                    hhah_names = rows[0] 
                    hhah_locations = rows[1]
                    
                    # Create a location counts dictionary for debugging
                    location_counts = {}
                    
                    # Process each column
                    for i in range(1, len(hhah_names)):
                        if not hhah_names[i] or hhah_names[i].strip() == '':
                            continue
                            
                        hhah_name = hhah_names[i].strip()
                        location = hhah_locations[i].strip() if i < len(hhah_locations) else ""
                        
                        if not location:
                            logger.warning(f"Skipping HHAH '{hhah_name}' because location is empty")
                            continue
                            
                        # Track location counts
                        if location not in location_counts:
                            location_counts[location] = 0
                        location_counts[location] += 1
                            
                        # Initialize area data if this is a new area
                        if location not in areas_data:
                            areas_data[location] = {
                                "area": location,
                                "pgs": [],
                                "hhahs": []
                            }
                        
                        # Check for duplicate HHAHs
                        already_exists = False
                        for existing_hhah in areas_data[location]["hhahs"]:
                            if existing_hhah.get("Agency Name") == hhah_name:
                                already_exists = True
                                break
                        
                        if already_exists:
                            logger.warning(f"Skipping duplicate HHAH '{hhah_name}' in {location}")
                            continue
                        
                        # Add HHAH to the appropriate area
                        areas_data[location]["hhahs"].append({
                            "Agency Name": hhah_name,
                            "Agency Type": "HHAH",
                            "Address": f"{hhah_name} Office, {location}",
                            "Telephone": "(555) 987-6543"  # Placeholder
                        })
                    
                    # Log HHAH counts
                    for loc, count in location_counts.items():
                        logger.info(f"{loc}: Found {count} HHAHs in CSV")
        
        # Now update real_map_data with our loaded data
        global real_map_data
        real_map_data = areas_data
        
        # Log what we loaded
        for area, data in areas_data.items():
            logger.info(f"Loaded listings data for {area}: {len(data['pgs'])} PGs and {len(data['hhahs'])} HHAHs")
            
            # Log each HHAH for Lubbock for easier verification
            if area == "Lubbock":
                for hhah in data["hhahs"]:
                    logger.info(f"  Lubbock HHAH: {hhah['Agency Name']}")
        
        return areas_data
    except Exception as e:
        logger.exception(f"Error loading listings data: {str(e)}")
        return {}

# Load listings data at startup
load_listings_data()

"""
        # Insert the patch code
        new_content = content[:insert_position] + patch_code + content[insert_position:]
        
        # Backup the original file
        backup_path = f"{app_py_path}.backup"
        with open(backup_path, 'w') as f:
            f.write(content)
        print(f"Created backup of app.py at {backup_path}")
        
        # Write the patched file
        with open(app_py_path, 'w') as f:
            f.write(new_content)
        print(f"Successfully patched {app_py_path}")
        
        return True
    except Exception as e:
        print(f"Error patching app.py: {str(e)}")
        return False

def sync_all_areas(listings_csv, hhah_csv=None, api_url=DEFAULT_API_URL):
    """Sync all areas found in the listings CSV with the map data"""
    # Read data from CSV
    areas_data = read_listings_csv(listings_csv)
    
    # If HHAH CSV is provided, read and merge that data
    if hhah_csv and os.path.exists(hhah_csv):
        areas_data = read_hhah_listings_csv(hhah_csv, areas_data)
    
    # Update each area
    success_count = 0
    for area_name, area_data in areas_data.items():
        print(f"\n==== Processing {area_name} ====")
        if update_map_data(area_name, area_data, api_url):
            success_count += 1
    
    print(f"\nSuccessfully updated {success_count} of {len(areas_data)} areas")
    return success_count

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync listings data with map data")
    parser.add_argument("--pg-csv", dest="pg_csv", default="Listing of all PG and HHAH - PG.csv", 
                       help="Path to PG listings CSV file")
    parser.add_argument("--hhah-csv", dest="hhah_csv", default=None,
                       help="Path to HHAH listings CSV file")
    parser.add_argument("--api", dest="api_url", help="API URL (default: http://localhost:5000/api)")
    parser.add_argument("--area", dest="area", help="Sync only a specific area")
    parser.add_argument("--patch-app", dest="patch_app", action="store_true", 
                       help="Patch app.py to automatically sync on server start")
    parser.add_argument("--no-patch", dest="no_patch", action="store_true",
                       help="Skip patching app.py even if sync is successful")
    parser.add_argument("--debug", dest="debug", action="store_true",
                       help="Show additional debug information")
    
    args = parser.parse_args()
    
    # Set default API URL if not specified
    if not args.api_url:
        args.api_url = DEFAULT_API_URL
        print(f"Using default API URL: {args.api_url}")
    
    # Set default HHAH CSV if not specified
    if not args.hhah_csv:
        default_hhah_csv = "Listing of all PG and HHAH - HHAH.csv"
        if os.path.exists(default_hhah_csv):
            args.hhah_csv = default_hhah_csv
            print(f"Using default HHAH CSV: {args.hhah_csv}")
    
    # Check if PG CSV file exists
    if not os.path.exists(args.pg_csv):
        print(f"Error: PG CSV file not found: {args.pg_csv}")
        sys.exit(1)
    
    # Check if HHAH CSV file exists when specified
    if args.hhah_csv and not os.path.exists(args.hhah_csv):
        print(f"Error: HHAH CSV file not found: {args.hhah_csv}")
        sys.exit(1)
    
    # If only patching app.py is requested
    if args.patch_app and not args.area:
        patch_app_py(args.api_url)
        sys.exit(0)
    
    # If specific area is requested
    if args.area:
        areas_data = read_listings_csv(args.pg_csv)
        
        # If HHAH CSV is provided, read and merge that data
        if args.hhah_csv and os.path.exists(args.hhah_csv):
            areas_data = read_hhah_listings_csv(args.hhah_csv, areas_data)
        
        if args.area in areas_data:
            if update_map_data(args.area, areas_data[args.area], args.api_url):
                print(f"Successfully updated {args.area}")
                
                # Patch app.py if requested and not explicitly disabled
                if not args.no_patch:
                    patch_app_py(args.api_url)
            else:
                print(f"Failed to update {args.area}")
        else:
            print(f"Error: Area '{args.area}' not found in listings CSV")
            print(f"Available areas: {', '.join(areas_data.keys())}")
            sys.exit(1)
    else:
        # Sync all areas
        success_count = sync_all_areas(args.pg_csv, args.hhah_csv, args.api_url)
        
        # Patch app.py if at least one area was updated successfully and not explicitly disabled
        if success_count > 0 and not args.no_patch:
            patch_app_py(args.api_url) 