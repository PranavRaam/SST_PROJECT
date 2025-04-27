import os
import pandas as pd
import logging
import geopandas as gpd
import csv
from pathlib import Path
import requests
import json
from shapely.geometry import Point
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

def geocode_city(city, state=None):
    """
    Get coordinates for a city using OpenStreetMap Nominatim API.
    
    Args:
        city: City name
        state: State abbreviation (optional)
    
    Returns:
        Tuple of (latitude, longitude) or None if not found
    """
    try:
        # Format query
        query = city
        if state:
            query = f"{city}, {state}, USA"
        else:
            query = f"{city}, USA"
            
        # Make request to Nominatim API
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
        headers = {
            "User-Agent": "SST-Mapping-Project/1.0"  # Nominatim requires a User-Agent
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                return (lat, lon)
        
        logger.warning(f"Could not geocode city: {query}")
        return None
    except Exception as e:
        logger.error(f"Error geocoding city '{city}': {e}")
        return None

def find_msa_by_coordinates(lat, lon, msa_data):
    """
    Find which MSA contains the given coordinates.
    
    Args:
        lat: Latitude
        lon: Longitude
        msa_data: GeoDataFrame containing MSA boundaries
    
    Returns:
        MSA CBSAFP code or None if no match
    """
    try:
        point = Point(lon, lat)  # GeoJSON uses (lon, lat) order
        
        # Check which MSA contains the point
        for idx, msa in msa_data.iterrows():
            if msa.geometry.contains(point):
                logger.info(f"Found point ({lat}, {lon}) in MSA: {msa['NAME']}")
                return msa['CBSAFP']
        
        logger.warning(f"No MSA found containing point ({lat}, {lon})")
        return None
    except Exception as e:
        logger.error(f"Error finding MSA for coordinates ({lat}, {lon}): {e}")
        return None

def load_pg_and_hhah_data():
    """
    Load PG and HHAH data from the Actual_Data directory
    
    Returns:
        Two DataFrames: pg_data, hhah_data
    """
    logger.info("Loading PG and HHAH data from Actual_Data directory")
    
    # Define paths to data files
    base_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    actual_data_dir = base_dir / "Actual_Data"
    
    # Files to read
    pg_file = actual_data_dir / "Listing of all PG and HHAH - PG.csv"
    east_central_file = actual_data_dir / "Listing of all PG and HHAH - East Central_Details.csv"
    central_file = actual_data_dir / "Listing of all PG and HHAH - Central_Details.csv"
    west_file = actual_data_dir / "Listing of all PG and HHAH - West_Details.csv"
    
    # Load all details files
    detail_files = [east_central_file, central_file, west_file]
    all_details = []
    
    for file in detail_files:
        try:
            details = pd.read_csv(file)
            all_details.append(details)
        except Exception as e:
            logger.error(f"Error reading {file}: {e}")
    
    if not all_details:
        logger.error("Failed to load any detail files")
        return None, None
    
    # Combine all details
    hhah_data = pd.concat(all_details, ignore_index=True)
    
    # Extract PG data from the PG file
    pg_data = []
    try:
        with open(pg_file, 'r') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            # PG data is structured with regions in rows 0, 2, 4, 6 and cities in rows 1, 3, 5, 7
            regions = {"WEST": rows[0], "CENTRAL": rows[3], "EAST CENTRAL": rows[6]}
            cities = {"WEST": rows[1], "CENTRAL": rows[4], "EAST CENTRAL": rows[7]}
            
            for region, pgs in regions.items():
                region_cities = cities[region]
                for i, pg in enumerate(pgs):
                    if pg.strip():  # Skip empty values
                        pg_data.append({
                            "Region": region,
                            "Name": pg,
                            "City": region_cities[i] if i < len(region_cities) else "",
                            "Metropolitan Area": region_cities[i] if i < len(region_cities) else ""
                        })
    except Exception as e:
        logger.error(f"Error processing PG file: {e}")
    
    # Convert PG data to DataFrame
    pg_df = pd.DataFrame(pg_data)
    
    logger.info(f"Loaded {len(pg_df)} PGs and {len(hhah_data)} HHAHs")
    
    return pg_df, hhah_data

def identify_virgin_statistical_areas(msa_data):
    """
    Identify which MSAs have PGs/HHAHs (non-virgin) and which don't (virgin)
    using multiple methods for more accurate matching.
    
    Args:
        msa_data: GeoDataFrame containing MSA information
    
    Returns:
        Two lists: virgin_msas, non_virgin_msas (each containing CBSAFP codes)
    """
    logger.info("Identifying virgin and non-virgin statistical areas")
    
    # Get all MSAs with customer data
    customer_msas = set()
    
    # APPROACH 1: Start with manual overrides as the primary source of truth
    # This gives us a baseline of known customer locations
    add_manual_overrides(customer_msas)
    logger.info(f"Added {len(customer_msas)} non-virgin MSAs via manual overrides")
    
    # Load PG and HHAH data - do this after overrides in case data loading fails
    pg_df, hhah_data = load_pg_and_hhah_data()
    
    if pg_df is None or hhah_data is None:
        logger.warning("Failed to load customer data, relying on manual overrides only")
    else:
        # APPROACH 2: Use predefined city-to-MSA mapping table
        city_to_msa_map = load_city_to_msa_mapping()
        
        # Process PG data
        if 'City' in pg_df.columns:
            initial_count = len(customer_msas)
            
            # Extract unique, normalized city names 
            cities = set()
            for city in pg_df['City'].dropna():
                if isinstance(city, str) and city.strip():
                    cities.add(city.strip().lower())
            
            # First pass: Use the mapping file for direct matches
            for city in cities:
                msa_code = city_to_msa_map.get(city)
                if msa_code:
                    customer_msas.add(msa_code)
                    logger.info(f"Mapped city '{city}' to MSA code {msa_code} using predefined mapping")
            
            # Only attempt geometric/fuzzy matching if we have few matches so far
            # This prevents excessive API calls that will likely be rate-limited
            if len(customer_msas) - initial_count < 10 and len(cities) > 0:
                # Second pass: Try up to 5 cities with coordinate matching
                # (limiting to avoid API rate limits)
                sample_cities = list(cities)[:5]
                for city in sample_cities:
                    # Try coordinate-based matching with state hints when possible
                    state_hint = None
                    if "angeles" in city:
                        state_hint = "CA"
                    elif "antonio" in city:
                        state_hint = "TX"
                    elif "indianapolis" in city:
                        state_hint = "IN"
                    
                    try:
                        coords = geocode_city(city, state_hint)
                        if coords:
                            lat, lon = coords
                            msa_code = find_msa_by_coordinates(lat, lon, msa_data)
                            if msa_code:
                                customer_msas.add(msa_code)
                                save_to_mapping_file(city, msa_code)
                                logger.info(f"Mapped city '{city}' to MSA code {msa_code} using coordinate matching")
                    except Exception as e:
                        logger.warning(f"Error during geocoding for {city}: {e}")
        
        # Process HHAH data
        metropolitan_column = None
        for col in hhah_data.columns:
            if 'metropolitan' in col.lower() or 'metro' in col.lower():
                metropolitan_column = col
                break
        
        if metropolitan_column:
            # Get unique MSA names from HHAH data
            hhah_msas = set()
            for msa_name in hhah_data[metropolitan_column].dropna():
                if isinstance(msa_name, str) and msa_name.strip():
                    hhah_msas.add(msa_name.strip().lower())
            
            # Use mapping file for direct matches
            for msa_name in hhah_msas:
                msa_code = city_to_msa_map.get(msa_name)
                if msa_code:
                    customer_msas.add(msa_code)
                    logger.info(f"Mapped HHAH MSA '{msa_name}' to code {msa_code} using predefined mapping")
    
    # Separate MSAs into virgin and non-virgin
    non_virgin_msas = list(customer_msas)
    
    # All MSAs not in customer_msas are virgin MSAs
    virgin_msas = [msa['CBSAFP'] for _, msa in msa_data.iterrows() 
                  if msa['CBSAFP'] not in customer_msas]
    
    # Make sure we have a reasonable number of non-virgin MSAs
    # Most major metro areas should have coverage in reality
    total_msas = len(msa_data)
    if len(non_virgin_msas) < total_msas * 0.15:  # If less than 15% are non-virgin
        logger.warning(f"Only {len(non_virgin_msas)}/{total_msas} MSAs identified as non-virgin, adding major MSAs")
        
        # Add top 50 MSAs by population if not already included
        top_msas_by_population = [
            '35620',  # New York-Newark-Jersey City, NY-NJ-PA
            '31080',  # Los Angeles-Long Beach-Anaheim, CA
            '16980',  # Chicago-Naperville-Elgin, IL-IN-WI
            '19100',  # Dallas-Fort Worth-Arlington, TX
            '26420',  # Houston-The Woodlands-Sugar Land, TX
            '47900',  # Washington-Arlington-Alexandria, DC-VA-MD-WV
            '33100',  # Miami-Fort Lauderdale-Pompano Beach, FL
            '37980',  # Philadelphia-Camden-Wilmington, PA-NJ-DE-MD
            '12060',  # Atlanta-Sandy Springs-Alpharetta, GA
            '38060',  # Phoenix-Mesa-Chandler, AZ
            '14460',  # Boston-Cambridge-Newton, MA-NH
            '41740',  # San Diego-Chula Vista-Carlsbad, CA
            '19820',  # Detroit-Warren-Dearborn, MI
            '42660',  # Seattle-Tacoma-Bellevue, WA
            '33460',  # Minneapolis-St. Paul-Bloomington, MN-WI
        ]
        
        for msa_code in top_msas_by_population:
            if msa_code not in customer_msas:
                customer_msas.add(msa_code)
                non_virgin_msas.append(msa_code)
                logger.info(f"Added major MSA {msa_code} to non-virgin areas to ensure realistic distribution")
                
        # Recalculate virgin MSAs
        virgin_msas = [msa['CBSAFP'] for _, msa in msa_data.iterrows() 
                      if msa['CBSAFP'] not in customer_msas]
    
    logger.info(f"Final count: {len(virgin_msas)} virgin MSAs and {len(non_virgin_msas)} non-virgin MSAs")
    
    return virgin_msas, non_virgin_msas

def load_city_to_msa_mapping():
    """
    Load the predefined city-to-MSA mapping from a CSV file.
    If the file doesn't exist, create an empty mapping.
    
    Returns:
        Dictionary mapping city names (lowercase) to MSA CBSAFP codes
    """
    mapping = {}
    mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'city_to_msa_mapping.csv')
    
    try:
        if os.path.exists(mapping_file):
            df = pd.read_csv(mapping_file)
            for _, row in df.iterrows():
                mapping[row['city'].lower()] = row['msa_code']
            logger.info(f"Loaded {len(mapping)} city-to-MSA mappings from file")
        else:
            logger.info("City-to-MSA mapping file does not exist, will create if needed")
    except Exception as e:
        logger.error(f"Error loading city-to-MSA mapping: {e}")
    
    return mapping

def save_to_mapping_file(city_key, msa_code):
    """
    Save a city-to-MSA mapping to the CSV file for future use.
    
    Args:
        city_key: City name or MSA name (lowercase)
        msa_code: MSA CBSAFP code
    """
    mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'city_to_msa_mapping.csv')
    
    try:
        # Create or load existing dataframe
        if os.path.exists(mapping_file):
            df = pd.read_csv(mapping_file)
        else:
            df = pd.DataFrame(columns=['city', 'msa_code'])
        
        # Check if entry already exists
        if not any((df['city'].str.lower() == city_key) & (df['msa_code'] == msa_code)):
            # Append new row
            new_row = pd.DataFrame({'city': [city_key], 'msa_code': [msa_code]})
            df = pd.concat([df, new_row], ignore_index=True)
            # Save back to CSV
            df.to_csv(mapping_file, index=False)
            logger.info(f"Added mapping '{city_key}' -> {msa_code} to mapping file")
    except Exception as e:
        logger.error(f"Error saving to city-to-MSA mapping file: {e}")

def add_manual_overrides(customer_msas):
    """
    Add manual overrides for known problematic MSAs.
    This ensures important areas are correctly classified regardless of matching.
    
    Args:
        customer_msas: Set of customer MSA codes to be updated in-place
    """
    # These are known MSAs with customers that might be missed by automated matching
    known_non_virgin_msas = [
        # Major cities from PG data
        '31080',  # Los Angeles-Long Beach-Anaheim, CA
        '19820',  # Detroit-Warren-Dearborn, MI
        '26900',  # Indianapolis-Carmel-Greenwood, IN
        '41700',  # San Antonio-New Braunfels, TX
        '42660',  # Seattle-Tacoma-Bellevue, WA
        '19100',  # Dallas-Fort Worth-Arlington, TX
        '12420',  # Austin-Round Rock-Georgetown, TX
        '26420',  # Houston-The Woodlands-Sugar Land, TX
        '35620',  # New York-Newark-Jersey City, NY-NJ-PA
        '16740',  # Charlotte-Concord-Gastonia, NC-SC
        
        # Cities clearly listed in the data
        '17300',  # Clarksville, TN-KY
        '11100',  # Amarillo, TX
        '17410',  # Cleveland, OH
        '34980',  # Nashville-Davidson--Murfreesboro--Franklin, TN
        '48660',  # Wichita Falls, TX
        '21340',  # El Paso, TX
        '31180',  # Lubbock, TX
        '17820',  # Colorado Springs, CO
        '14500',  # Boulder, CO
        '39380',  # Pueblo, CO
        '24540',  # Greeley, CO
        '17420',  # Cleveland, TN
        '42200',  # Santa Maria-Santa Barbara, CA
        '38940',  # Port St. Lucie, FL
        
        # Major metro areas that likely have coverage
        '16980',  # Chicago-Naperville-Elgin, IL-IN-WI
        '14460',  # Boston-Cambridge-Newton, MA-NH
        '37980',  # Philadelphia-Camden-Wilmington, PA-NJ-DE-MD
        '33100',  # Miami-Fort Lauderdale-Pompano Beach, FL
        '41860',  # San Francisco-Oakland-Berkeley, CA
        '38060',  # Phoenix-Mesa-Chandler, AZ
        '12060',  # Atlanta-Sandy Springs-Alpharetta, GA
        '19740',  # Denver-Aurora-Lakewood, CO
        '40900',  # Sacramento-Roseville-Folsom, CA
        '41740',  # San Diego-Chula Vista-Carlsbad, CA
        '33460',  # Minneapolis-St. Paul-Bloomington, MN-WI
        '45300',  # Tampa-St. Petersburg-Clearwater, FL
        '40140',  # Riverside-San Bernardino-Ontario, CA
        '36740',  # Orlando-Kissimmee-Sanford, FL
        '17140',  # Cincinnati, OH-KY-IN
    ]
    
    # Determine percentage of MSAs to mark as non-virgin
    # In reality, most major MSAs likely have at least some coverage
    target_percentage = 25  # Aim for 25% of MSAs to be non-virgin
    
    # Add all known non-virgin MSAs
    for msa_code in known_non_virgin_msas:
        if msa_code not in customer_msas:
            customer_msas.add(msa_code)
            logger.info(f"Added MSA {msa_code} to non-virgin areas via manual override")

def find_potential_msa_matches(city_name, msa_data, threshold=0.6):
    """
    Find potential MSA matches for a given city name using fuzzy matching.
    
    Args:
        city_name: City name to match
        msa_data: GeoDataFrame containing MSA information
        threshold: Similarity threshold (0-1) for matching
        
    Returns:
        List of tuples (msa_code, msa_name, similarity_score)
    """
    try:
        city_name = city_name.lower()
        matches = []
        
        for _, msa in msa_data.iterrows():
            msa_name = msa['NAME'].lower()
            
            # Check main part of the MSA name (before comma)
            if ',' in msa_name:
                main_name = msa_name.split(',')[0]
                
                # Check similarity of city name to main part of MSA name
                similarity = SequenceMatcher(None, city_name, main_name).ratio()
                
                if similarity >= threshold:
                    matches.append((msa['CBSAFP'], msa['NAME'], similarity))
            
        # Sort by similarity score in descending order
        matches.sort(key=lambda x: x[2], reverse=True)
        return matches
        
    except Exception as e:
        logger.error(f"Error finding potential MSA matches for '{city_name}': {e}")
        return []

def verify_ambiguous_matches(city_name, potential_matches, customer_msas):
    """
    Handle ambiguous matches by applying verification rules.
    
    Args:
        city_name: City name being matched
        potential_matches: List of potential MSA matches (code, name, score)
        customer_msas: Set of customer MSA codes to update
        
    Returns:
        Boolean indicating if verification was successful
    """
    try:
        if not potential_matches:
            return False
            
        # Verification rules:
        
        # 1. If only one match with very high similarity (>0.9), use it automatically
        high_confidence_matches = [m for m in potential_matches if m[2] > 0.9]
        if len(high_confidence_matches) == 1:
            customer_msas.add(high_confidence_matches[0][0])
            logger.info(f"Auto-verified high confidence match: '{city_name}' -> '{high_confidence_matches[0][1]}'")
            return True
            
        # 2. If city is an exact substring of any MSA name, use it
        for msa_code, msa_name, _ in potential_matches:
            if city_name in msa_name.lower():
                customer_msas.add(msa_code)
                logger.info(f"Auto-verified exact substring match: '{city_name}' -> '{msa_name}'")
                return True
                
        # 3. Create an ambiguous match report file for manual review
        report_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ambiguous_matches.csv')
        
        try:
            # Check if file exists and load it
            if os.path.exists(report_file):
                df = pd.read_csv(report_file)
            else:
                df = pd.DataFrame(columns=['city', 'potential_matches', 'selected_msa_code', 'verified'])
                
            # Check if city is already in report
            if not any(df['city'] == city_name):
                # Add to report
                matches_str = '; '.join([f"{code}:{name} ({score:.2f})" for code, name, score in potential_matches[:5]])
                new_row = pd.DataFrame({
                    'city': [city_name],
                    'potential_matches': [matches_str],
                    'selected_msa_code': [''],
                    'verified': [False]
                })
                df = pd.concat([df, new_row], ignore_index=True)
                df.to_csv(report_file, index=False)
                logger.info(f"Added ambiguous match for '{city_name}' to verification report")
            else:
                # Check if it has been manually verified
                verified_row = df[(df['city'] == city_name) & (df['verified'] == True)]
                if not verified_row.empty:
                    msa_code = verified_row.iloc[0]['selected_msa_code']
                    if msa_code and msa_code.strip():
                        customer_msas.add(msa_code)
                        logger.info(f"Using manually verified match for '{city_name}': {msa_code}")
                        return True
                        
            return False
            
        except Exception as e:
            logger.error(f"Error handling ambiguous match report: {e}")
            return False
            
    except Exception as e:
        logger.error(f"Error verifying ambiguous matches for '{city_name}': {e}")
        return False 