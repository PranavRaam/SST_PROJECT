#!/usr/bin/env python3
import requests
import json
import os
import sys

# API URL - change this to your actual backend URL
API_URL = "http://localhost:5000/api"

# Data for Lubbock area
lubbock_data = {
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

def update_map_data():
    """Send the correct Lubbock data to the API"""
    try:
        print(f"Updating map data for Lubbock with {len(lubbock_data['pgs'])} PGs and {len(lubbock_data['hhahs'])} HHAHs")
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{API_URL}/update-map-data",
            headers=headers,
            json=lubbock_data
        )
        
        if response.status_code == 200:
            print("Successfully updated Lubbock map data!")
            print(response.json())
            
            # Clear the cache to force regeneration
            clear_response = requests.get(f"{API_URL}/clear-cache")
            if clear_response.status_code == 200:
                print("Successfully cleared cache!")
                print(clear_response.json())
            else:
                print(f"Failed to clear cache: {clear_response.status_code}")
                print(clear_response.text)
            
            # Regenerate the map
            regen_response = requests.get(f"{API_URL}/generate-map?force=true")
            if regen_response.status_code == 200:
                print("Successfully requested map regeneration!")
                print(regen_response.json())
            else:
                print(f"Failed to regenerate map: {regen_response.status_code}")
                print(regen_response.text)
            
            # Regenerate statistical area map for Lubbock
            stat_response = requests.get(f"{API_URL}/statistical-area-map/Lubbock?force_regen=true")
            if stat_response.status_code == 200:
                print("Successfully regenerated statistical area map for Lubbock!")
                
                # Save the map html to a file
                with open("statistical_area_Lubbock_lightweight.html", "w") as f:
                    f.write(stat_response.text)
                print("Saved map file to statistical_area_Lubbock_lightweight.html")
            else:
                print(f"Failed to regenerate statistical area map: {stat_response.status_code}")
        else:
            print(f"Failed to update map data: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Check if custom API URL is provided
    if len(sys.argv) > 1:
        API_URL = sys.argv[1]
        print(f"Using custom API URL: {API_URL}")
    
    update_map_data() 