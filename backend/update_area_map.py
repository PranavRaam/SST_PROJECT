#!/usr/bin/env python3
import requests
import json
import os
import sys
import argparse

# API URL - change this to your actual backend URL
DEFAULT_API_URL = "http://localhost:5000/api"

def load_area_data(area_name, data_file=None):
    """Load area data from file or use defaults for Lubbock"""
    if data_file and os.path.exists(data_file):
        try:
            with open(data_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading data file: {str(e)}")
            print("Using default data for Lubbock instead.")
    
    # Default data for Lubbock if no file provided or file loading fails
    if area_name.lower() == "lubbock":
        return {
            "area": "Lubbock",
            "pgs": [
                {
                    "name": "Brownfield Family Physicians",
                    "Agency Type": "PG",
                    "Address": "111 Brownfield Dr, Lubbock, TX",
                    "Telephone": "(806) 555-1234"
                }
            ],
            "hhahs": [
                {
                    "Agency Name": "Accolade Home",
                    "Agency Type": "HHAH",
                    "Address": "123 Health St, Lubbock, TX",
                    "Telephone": "(806) 555-2345"
                },
                {
                    "Agency Name": "Interim Healthcare",
                    "Agency Type": "HHAH",
                    "Address": "456 Wellness Ave, Lubbock, TX",
                    "Telephone": "(806) 555-3456"
                },
                {
                    "Agency Name": "Interim Hospice",
                    "Agency Type": "HHAH",
                    "Address": "456 Wellness Ave, Suite B, Lubbock, TX",
                    "Telephone": "(806) 555-4567"
                },
                {
                    "Agency Name": "Enhabit - LUBBOCK",
                    "Agency Type": "HHAH",
                    "Address": "789 Care Blvd, Lubbock, TX",
                    "Telephone": "(806) 555-5678"
                },
                {
                    "Agency Name": "Angels Care",
                    "Agency Type": "HHAH",
                    "Address": "321 Support Dr, Lubbock, TX",
                    "Telephone": "(806) 555-6789"
                }
            ]
        }
    else:
        # Create an empty template for a new area
        return {
            "area": area_name,
            "pgs": [],
            "hhahs": []
        }

def update_map_data(area_name, api_url=DEFAULT_API_URL, data_file=None, output_file=None):
    """Send the area data to the API"""
    area_data = load_area_data(area_name, data_file)
    
    try:
        print(f"Updating map data for {area_name} with {len(area_data['pgs'])} PGs and {len(area_data['hhahs'])} HHAHs")
        
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
            else:
                print(f"Failed to regenerate statistical area map: {stat_response.status_code}")
        else:
            print(f"Failed to update map data: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {str(e)}")

def create_sample_data_file(area_name, output_file):
    """Create a sample data file with empty PGs and HHAHs"""
    sample_data = {
        "area": area_name,
        "pgs": [
            {
                "name": "Sample PG 1",
                "Agency Type": "PG",
                "Address": f"123 Main St, {area_name}",
                "Telephone": "(555) 123-4567"
            }
        ],
        "hhahs": [
            {
                "Agency Name": "Sample HHAH 1",
                "Agency Type": "HHAH",
                "Address": f"456 Elm St, {area_name}",
                "Telephone": "(555) 765-4321"
            },
            {
                "Agency Name": "Sample HHAH 2",
                "Agency Type": "HHAH",
                "Address": f"789 Oak St, {area_name}",
                "Telephone": "(555) 987-6543"
            }
        ]
    }
    
    try:
        with open(output_file, 'w') as f:
            json.dump(sample_data, f, indent=2)
        print(f"Created sample data file: {output_file}")
        print("Edit this file with your actual PGs and HHAHs, then run the script again with --data option.")
    except Exception as e:
        print(f"Error creating sample file: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update map data for a statistical area")
    parser.add_argument("area", help="Name of the statistical area (e.g., Lubbock)")
    parser.add_argument("--api", dest="api_url", help="API URL (default: http://localhost:5000/api)")
    parser.add_argument("--data", dest="data_file", help="JSON file containing PG and HHAH data")
    parser.add_argument("--output", dest="output_file", help="Output file for the generated map")
    parser.add_argument("--create-sample", dest="create_sample", help="Create a sample data file for the given area", action="store_true")
    parser.add_argument("--sample-output", dest="sample_output", help="Output file for the sample data (default: area_name_data.json)")
    
    args = parser.parse_args()
    
    # Set default API URL if not specified
    if not args.api_url:
        args.api_url = DEFAULT_API_URL
        print(f"Using default API URL: {args.api_url}")
    
    # Create a sample data file if requested
    if args.create_sample:
        sample_output = args.sample_output if args.sample_output else f"{args.area.lower().replace(' ', '_')}_data.json"
        create_sample_data_file(args.area, sample_output)
    else:
        # Otherwise update the map data
        update_map_data(args.area, args.api_url, args.data_file, args.output_file) 